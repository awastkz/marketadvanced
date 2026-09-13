import { useState, type FormEvent } from 'react'
import { catalogAdmin } from '../../api/admin/catalog'
import type { Attribute, AttributePayload } from '../../api/admin/types'
import { useLoad } from '../../utils/useLoad'
import { slugify } from '../../utils/slug'
import { errorMessage } from '../../utils/format'
import { toast } from '../../stores/toast'
import Alert from '../../components/Alert'
import Modal from '../../components/admin/Modal'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import EmptyState from '../../components/admin/EmptyState'
import { IconEdit, IconPlus, IconSliders, IconTrash } from '../../components/icons'

export default function AttributesView() {
  const { data, loading, error, reload } = useLoad(() => catalogAdmin.attributes.list(), [])
  const [editing, setEditing] = useState<{ attribute: Attribute | null } | null>(null)
  const [toDelete, setToDelete] = useState<Attribute | null>(null)

  async function remove(a: Attribute) {
    await catalogAdmin.attributes.remove(a.id)
    toast.success(`Атрибут «${a.name}» удалён`)
    reload()
  }

  const rows = [...(data ?? [])].sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name))

  return (
    <>
      <div className="page-head">
        <div>
          <span className="eyebrow">Справочники</span>
          <h1>Атрибуты</h1>
          <p>Характеристики, которые можно задавать товарам: цвет, размер, материал</p>
        </div>
        <div className="page-actions">
          <button type="button" className="btn btn-primary" onClick={() => setEditing({ attribute: null })}>
            <IconPlus />
            Новый атрибут
          </button>
        </div>
      </div>

      {error && <Alert kind="error">{error}</Alert>}

      <div className="card">
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Название</th>
                <th>Slug</th>
                <th>Ед. изм.</th>
                <th className="num">Порядок</th>
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
              {rows.map((a) => (
                <tr key={a.id} className="is-link" onClick={() => setEditing({ attribute: a })}>
                  <td>
                    <span className="product-cell-name">{a.name}</span>
                  </td>
                  <td className="mono muted">{a.slug}</td>
                  <td>{a.unit ? <span className="badge">{a.unit}</span> : <span className="muted">—</span>}</td>
                  <td className="num">{a.sortOrder}</td>
                  <td className="actions" onClick={(e) => e.stopPropagation()}>
                    <button type="button" className="btn btn-ghost btn-icon btn-sm" title="Редактировать" onClick={() => setEditing({ attribute: a })}>
                      <IconEdit />
                    </button>
                    <button type="button" className="btn btn-ghost btn-icon btn-sm is-danger" title="Удалить" onClick={() => setToDelete(a)}>
                      <IconTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && rows.length === 0 && (
          <EmptyState
            icon={<IconSliders />}
            title="Атрибутов пока нет"
            text="Создайте атрибуты, чтобы задавать товарам характеристики и строить фильтры."
            action={
              <button type="button" className="btn btn-primary" onClick={() => setEditing({ attribute: null })}>
                <IconPlus />
                Новый атрибут
              </button>
            }
          />
        )}
      </div>

      {editing && (
        <AttributeModal
          attribute={editing.attribute}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null)
            reload()
          }}
        />
      )}

      <ConfirmDialog
        open={!!toDelete}
        title="Удалить атрибут?"
        text={`«${toDelete?.name}» и его значения у всех товаров будут удалены.`}
        onConfirm={() => (toDelete ? remove(toDelete) : undefined)}
        onClose={() => setToDelete(null)}
      />
    </>
  )
}

function AttributeModal({ attribute, onClose, onSaved }: { attribute: Attribute | null; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    name: attribute?.name ?? '',
    slug: attribute?.slug ?? '',
    slugTouched: !!attribute,
    unit: attribute?.unit ?? '',
    sortOrder: attribute?.sortOrder ?? 0,
  })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!form.name.trim() || !form.slug.trim()) {
      setError('Название и slug обязательны')
      return
    }
    setBusy(true)
    setError(null)
    const payload: AttributePayload = { name: form.name.trim(), slug: form.slug.trim(), unit: form.unit.trim(), sortOrder: form.sortOrder }
    try {
      if (attribute) await catalogAdmin.attributes.update(attribute.id, payload)
      else await catalogAdmin.attributes.create(payload)
      toast.success(attribute ? 'Атрибут сохранён' : 'Атрибут создан')
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
      title={attribute ? 'Редактировать атрибут' : 'Новый атрибут'}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose} disabled={busy}>
            Отмена
          </button>
          <button type="submit" form="attribute-form" className="btn btn-primary" disabled={busy}>
            {busy ? 'Сохраняем…' : attribute ? 'Сохранить' : 'Создать'}
          </button>
        </>
      }
    >
      <form id="attribute-form" onSubmit={submit} noValidate>
        {error && <Alert kind="error">{error}</Alert>}
        <div className="field">
          <label htmlFor="a-name">Название</label>
          <input id="a-name" className="input" value={form.name} autoFocus placeholder="Например, Диагональ экрана" onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, slug: f.slugTouched ? f.slug : slugify(e.target.value) }))} />
        </div>
        <div className="field">
          <label htmlFor="a-slug">Slug</label>
          <input id="a-slug" className="input mono" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value, slugTouched: true }))} />
        </div>
        <div className="field-row">
          <div className="field">
            <label htmlFor="a-unit">Единица измерения</label>
            <input id="a-unit" className="input" value={form.unit} placeholder="см, кг, ГБ…" onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))} />
            <span className="field-hint">Необязательно</span>
          </div>
          <div className="field">
            <label htmlFor="a-order">Порядок</label>
            <input id="a-order" type="number" className="input" value={form.sortOrder} onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))} />
          </div>
        </div>
      </form>
    </Modal>
  )
}
