import { useState, type FormEvent } from 'react'
import { catalogAdmin } from '../../api/admin/catalog'
import type { Brand, BrandPayload } from '../../api/admin/types'
import { useLoad } from '../../utils/useLoad'
import { slugify } from '../../utils/slug'
import { errorMessage } from '../../utils/format'
import { toast } from '../../stores/toast'
import Alert from '../../components/Alert'
import Modal from '../../components/admin/Modal'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import EmptyState from '../../components/admin/EmptyState'
import ImagePicker from '../../components/admin/ImagePicker'
import { IconEdit, IconPlus, IconTag, IconTrash } from '../../components/icons'

type Editing = { brand: Brand | null }

export default function BrandsView() {
  const { data, loading, error, reload } = useLoad(() => catalogAdmin.brands.list(), [])
  const [editing, setEditing] = useState<Editing | null>(null)
  const [toDelete, setToDelete] = useState<Brand | null>(null)

  async function remove(b: Brand) {
    await catalogAdmin.brands.remove(b.id)
    toast.success(`Бренд «${b.name}» удалён`)
    reload()
  }

  const brands = [...(data ?? [])].sort((a, b) => a.name.localeCompare(b.name))

  return (
    <>
      <div className="page-head">
        <div>
          <span className="eyebrow">Каталог</span>
          <h1>Бренды</h1>
          <p>Производители и торговые марки</p>
        </div>
        <div className="page-actions">
          <button type="button" className="btn btn-primary" onClick={() => setEditing({ brand: null })}>
            <IconPlus />
            Новый бренд
          </button>
        </div>
      </div>

      {error && <Alert kind="error">{error}</Alert>}

      {loading && (
        <div className="brand-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card brand-card">
              <span className="skeleton" style={{ width: 56, height: 56, borderRadius: 14 }} />
              <span className="skeleton" style={{ width: '60%' }} />
            </div>
          ))}
        </div>
      )}

      {!loading && brands.length === 0 && (
        <div className="card">
          <EmptyState
            icon={<IconTag />}
            title="Брендов пока нет"
            text="Добавьте бренды, чтобы покупатели могли фильтровать по производителю."
            action={
              <button type="button" className="btn btn-primary" onClick={() => setEditing({ brand: null })}>
                <IconPlus />
                Новый бренд
              </button>
            }
          />
        </div>
      )}

      {!loading && brands.length > 0 && (
        <div className="brand-grid">
          {brands.map((b) => (
            <div key={b.id} className="card brand-card">
              <span className="brand-logo">{b.logoUrl ? <img src={b.logoUrl} alt="" /> : <span>{b.name.charAt(0).toUpperCase()}</span>}</span>
              <div className="brand-card-body">
                <strong>{b.name}</strong>
                <span className="mono muted small">{b.slug}</span>
                {b.description && <p>{b.description}</p>}
              </div>
              <div className="brand-card-foot">
                <span className="badge">{b.productsCount} тов.</span>
                <span className="brand-card-actions">
                  <button type="button" className="btn btn-ghost btn-icon btn-sm" title="Редактировать" onClick={() => setEditing({ brand: b })}>
                    <IconEdit />
                  </button>
                  <button type="button" className="btn btn-ghost btn-icon btn-sm is-danger" title="Удалить" onClick={() => setToDelete(b)}>
                    <IconTrash />
                  </button>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <BrandModal
          brand={editing.brand}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null)
            reload()
          }}
        />
      )}

      <ConfirmDialog
        open={!!toDelete}
        title="Удалить бренд?"
        text={`«${toDelete?.name}» будет удалён. У товаров этого бренда поле «Бренд» станет пустым.`}
        onConfirm={() => (toDelete ? remove(toDelete) : undefined)}
        onClose={() => setToDelete(null)}
      />
    </>
  )
}

function BrandModal({ brand, onClose, onSaved }: { brand: Brand | null; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    name: brand?.name ?? '',
    slug: brand?.slug ?? '',
    slugTouched: !!brand,
    description: brand?.description ?? '',
    logo: null as File | null,
    removeLogo: false,
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
    const payload: BrandPayload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      description: form.description.trim(),
      logo: form.logo,
      removeLogo: form.removeLogo,
    }
    try {
      if (brand) await catalogAdmin.brands.update(brand.id, payload)
      else await catalogAdmin.brands.create(payload)
      toast.success(brand ? 'Бренд сохранён' : 'Бренд создан')
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
      title={brand ? 'Редактировать бренд' : 'Новый бренд'}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose} disabled={busy}>
            Отмена
          </button>
          <button type="submit" form="brand-form" className="btn btn-primary" disabled={busy}>
            {busy ? 'Сохраняем…' : brand ? 'Сохранить' : 'Создать'}
          </button>
        </>
      }
    >
      <form id="brand-form" onSubmit={submit} noValidate>
        {error && <Alert kind="error">{error}</Alert>}
        <div className="field">
          <label htmlFor="b-name">Название</label>
          <input id="b-name" className="input" value={form.name} autoFocus onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, slug: f.slugTouched ? f.slug : slugify(e.target.value) }))} />
        </div>
        <div className="field">
          <label htmlFor="b-slug">Slug</label>
          <input id="b-slug" className="input mono" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value, slugTouched: true }))} />
        </div>
        <div className="field">
          <label htmlFor="b-desc">Описание</label>
          <textarea id="b-desc" className="input textarea" rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
        </div>
        <ImagePicker
          label="Логотип"
          currentUrl={brand?.logoUrl ?? null}
          file={form.logo}
          removed={form.removeLogo}
          onFile={(file) => setForm((f) => ({ ...f, logo: file, removeLogo: false }))}
          onRemove={() => setForm((f) => ({ ...f, logo: null, removeLogo: true }))}
          hint="Квадратный PNG или SVG на прозрачном фоне"
        />
      </form>
    </Modal>
  )
}
