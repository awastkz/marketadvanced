import { useMemo, useState, type FormEvent } from 'react'
import { catalogAdmin } from '../../api/admin/catalog'
import type { Category, CategoryPayload } from '../../api/admin/types'
import { useLoad } from '../../utils/useLoad'
import { descendantIds, flattenTree, indent, type CategoryNode } from '../../utils/categories'
import { slugify } from '../../utils/slug'
import { errorMessage } from '../../utils/format'
import { toast } from '../../stores/toast'
import Alert from '../../components/Alert'
import Modal from '../../components/admin/Modal'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import EmptyState from '../../components/admin/EmptyState'
import ImagePicker from '../../components/admin/ImagePicker'
import { IconCornerDownRight, IconEdit, IconFolder, IconLayers, IconPlus, IconTrash } from '../../components/icons'

interface Editing {
  category: Category | null
  parentId: number | null
}

interface FormState {
  name: string
  slug: string
  slugTouched: boolean
  sortOrder: number
  parentId: number | null
  image: File | null
  removeImage: boolean
}

function initial(e: Editing): FormState {
  return {
    name: e.category?.name ?? '',
    slug: e.category?.slug ?? '',
    slugTouched: !!e.category,
    sortOrder: e.category?.sortOrder ?? 0,
    parentId: e.category?.parentId ?? e.parentId,
    image: null,
    removeImage: false,
  }
}

export default function CategoriesView() {
  const { data, loading, error, reload } = useLoad(() => catalogAdmin.categories.list(), [])
  const tree = useMemo(() => flattenTree(data ?? []), [data])

  const [editing, setEditing] = useState<Editing | null>(null)
  const [toDelete, setToDelete] = useState<Category | null>(null)

  async function remove(c: Category) {
    await catalogAdmin.categories.remove(c.id)
    toast.success(`Категория «${c.name}» удалена`)
    reload()
  }

  return (
    <>
      <div className="page-head">
        <div>
          <span className="eyebrow">Каталог</span>
          <h1>Категории</h1>
          <p>Дерево разделов и порядок их вывода на сайте</p>
        </div>
        <div className="page-actions">
          <button type="button" className="btn btn-primary" onClick={() => setEditing({ category: null, parentId: null })}>
            <IconPlus />
            Новая категория
          </button>
        </div>
      </div>

      {error && <Alert kind="error">{error}</Alert>}

      <div className="card">
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Категория</th>
                <th>Slug</th>
                <th className="num">Порядок</th>
                <th className="num">Товаров</th>
                <th className="actions" />
              </tr>
            </thead>
            <tbody>
              {loading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={5}>
                      <span className="skeleton" />
                    </td>
                  </tr>
                ))}
              {tree.map((c: CategoryNode) => (
                <tr key={c.id} className="is-link" onClick={() => setEditing({ category: c, parentId: c.parentId })}>
                  <td>
                    <span className="product-cell" style={{ paddingLeft: c.depth * 28 }}>
                      {c.depth > 0 && <IconCornerDownRight className="tree-arrow" />}
                      <span className="thumb thumb-sm">{c.imageUrl ? <img src={c.imageUrl} alt="" /> : <IconFolder />}</span>
                      <span className="product-cell-text">
                        <span className="product-cell-name">{c.name}</span>
                        {c.children.length > 0 && <span className="product-cell-sub">{c.children.length} подкат.</span>}
                      </span>
                    </span>
                  </td>
                  <td className="mono muted">{c.slug}</td>
                  <td className="num">{c.sortOrder}</td>
                  <td className="num">{c.productsCount}</td>
                  <td className="actions" onClick={(e) => e.stopPropagation()}>
                    <button type="button" className="btn btn-ghost btn-icon btn-sm" title="Добавить подкатегорию" onClick={() => setEditing({ category: null, parentId: c.id })}>
                      <IconPlus />
                    </button>
                    <button type="button" className="btn btn-ghost btn-icon btn-sm" title="Редактировать" onClick={() => setEditing({ category: c, parentId: c.parentId })}>
                      <IconEdit />
                    </button>
                    <button type="button" className="btn btn-ghost btn-icon btn-sm is-danger" title="Удалить" onClick={() => setToDelete(c)}>
                      <IconTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && tree.length === 0 && (
          <EmptyState
            icon={<IconLayers />}
            title="Категорий пока нет"
            text="Создайте первую категорию, чтобы раскладывать товары по разделам."
            action={
              <button type="button" className="btn btn-primary" onClick={() => setEditing({ category: null, parentId: null })}>
                <IconPlus />
                Новая категория
              </button>
            }
          />
        )}
      </div>

      {editing && (
        <CategoryModal
          editing={editing}
          all={data ?? []}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null)
            reload()
          }}
        />
      )}

      <ConfirmDialog
        open={!!toDelete}
        title="Удалить категорию?"
        text={`«${toDelete?.name}» будет удалена. Подкатегории и товары нужно убрать заранее.`}
        onConfirm={() => (toDelete ? remove(toDelete) : undefined)}
        onClose={() => setToDelete(null)}
      />
    </>
  )
}

function CategoryModal({ editing, all, onClose, onSaved }: { editing: Editing; all: Category[]; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState<FormState>(() => initial(editing))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isNew = !editing.category

  // нельзя сделать категорию потомком самой себя
  const blocked = editing.category ? descendantIds(all, editing.category.id) : new Set<number>()
  const parents = flattenTree(all).filter((c) => !blocked.has(c.id))

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!form.name.trim() || !form.slug.trim()) {
      setError('Название и slug обязательны')
      return
    }
    setBusy(true)
    setError(null)
    const payload: CategoryPayload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      sortOrder: form.sortOrder,
      parentId: form.parentId,
      image: form.image,
      removeImage: form.removeImage,
    }
    try {
      if (editing.category) await catalogAdmin.categories.update(editing.category.id, payload)
      else await catalogAdmin.categories.create(payload)
      toast.success(isNew ? 'Категория создана' : 'Категория сохранена')
      onSaved()
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal
      open
      title={isNew ? 'Новая категория' : 'Редактировать категорию'}
      subtitle={isNew && editing.parentId != null ? `Внутри «${all.find((c) => c.id === editing.parentId)?.name}»` : undefined}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose} disabled={busy}>
            Отмена
          </button>
          <button type="submit" form="category-form" className="btn btn-primary" disabled={busy}>
            {busy ? 'Сохраняем…' : isNew ? 'Создать' : 'Сохранить'}
          </button>
        </>
      }
    >
      <form id="category-form" onSubmit={submit} noValidate>
        {error && <Alert kind="error">{error}</Alert>}
        <div className="field">
          <label htmlFor="c-name">Название</label>
          <input id="c-name" className="input" value={form.name} autoFocus onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, slug: f.slugTouched ? f.slug : slugify(e.target.value) }))} />
        </div>
        <div className="field">
          <label htmlFor="c-slug">Slug</label>
          <input id="c-slug" className="input mono" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value, slugTouched: true }))} />
        </div>
        <div className="field-row">
          <div className="field">
            <label htmlFor="c-parent">Родитель</label>
            <select id="c-parent" className="select" value={form.parentId ?? ''} onChange={(e) => setForm((f) => ({ ...f, parentId: e.target.value ? Number(e.target.value) : null }))}>
              <option value="">Корень каталога</option>
              {parents.map((c) => (
                <option key={c.id} value={c.id}>
                  {indent(c.depth)}
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="c-order">Порядок</label>
            <input id="c-order" type="number" className="input" value={form.sortOrder} onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))} />
          </div>
        </div>
        <ImagePicker
          label="Изображение"
          currentUrl={editing.category?.imageUrl ?? null}
          file={form.image}
          removed={form.removeImage}
          onFile={(file) => setForm((f) => ({ ...f, image: file, removeImage: false }))}
          onRemove={() => setForm((f) => ({ ...f, image: null, removeImage: true }))}
          hint="Показывается в плитке разделов на главной"
          shape="wide"
        />
      </form>
    </Modal>
  )
}
