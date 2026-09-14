import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { catalogAdmin } from '../../api/admin/catalog'
import type { Attribute, ProductAttributeValue, ProductDetails, ProductImage, ProductPayload, ProductVariant } from '../../api/admin/types'
import { useLoad } from '../../utils/useLoad'
import { flattenTree, indent } from '../../utils/categories'
import { slugify } from '../../utils/slug'
import { errorMessage, formatDateTime } from '../../utils/format'
import { toast } from '../../stores/toast'
import Alert from '../../components/Alert'
import Toggle from '../../components/admin/Toggle'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import { IconChevronLeft, IconLayers, IconPlus, IconSave, IconStar, IconTrash, IconUpload, IconX } from '../../components/icons'

interface FormState {
  name: string
  slug: string
  slugTouched: boolean
  description: string
  categoryId: number | null
  brandId: number | null
  isActive: boolean
  /** Признаки, по которым различаются варианты (id атрибутов), в порядке колонок. */
  axes: number[]
  variants: ProductVariant[]
  attributes: ProductAttributeValue[]
}

interface PendingImage {
  key: number
  file: File
  url: string
}

const emptyVariant = (axes: number[]): ProductVariant => ({
  id: null,
  sku: '',
  name: '',
  price: 0,
  stock: 0,
  isActive: true,
  attributes: axes.map((attributeId) => ({ attributeId, value: '' })),
})

/** Признаки вариантов выводим из самих вариантов: объединение attributeId в порядке появления. */
function axesOf(variants: ProductVariant[]): number[] {
  const out: number[] = []
  for (const v of variants) for (const a of v.attributes) if (!out.includes(a.attributeId)) out.push(a.attributeId)
  return out
}

function fromProduct(p: ProductDetails | null): FormState {
  const variants = p?.variants.length ? p.variants.map((v) => ({ ...v, attributes: v.attributes.map((a) => ({ ...a })) })) : [emptyVariant([])]
  const axes = axesOf(variants)
  for (const v of variants) {
    v.attributes = axes.map((id) => v.attributes.find((a) => a.attributeId === id) ?? { attributeId: id, value: '' })
  }
  return {
    name: p?.name ?? '',
    slug: p?.slug ?? '',
    slugTouched: !!p,
    description: p?.description ?? '',
    categoryId: p?.categoryId ?? null,
    brandId: p?.brandId ?? null,
    isActive: p?.isActive ?? true,
    axes,
    variants,
    attributes: p?.attributes.map((a) => ({ ...a })) ?? [],
  }
}

function axisValue(v: ProductVariant, attributeId: number) {
  return v.attributes.find((a) => a.attributeId === attributeId)?.value ?? ''
}

function variantName(v: ProductVariant, axes: number[], attrById: Map<number, Attribute>) {
  return axes
    .map((id) => {
      const value = axisValue(v, id).trim()
      const unit = attrById.get(id)?.unit
      return value ? (unit ? `${value} ${unit}` : value) : ''
    })
    .filter(Boolean)
    .join(', ')
}

function comboKey(v: ProductVariant, axes: number[]) {
  return axes.map((id) => axisValue(v, id).trim().toLowerCase()).join('|')
}

let pendingSeq = 0

export default function ProductEditView() {
  const { id } = useParams()
  const productId = id && id !== 'new' ? Number(id) : null
  const isNew = productId == null
  const navigate = useNavigate()

  const dicts = useLoad(async () => {
    const [categories, brands, attributes] = await Promise.all([
      catalogAdmin.categories.list(),
      catalogAdmin.brands.list(),
      catalogAdmin.attributes.list(),
    ])
    return { categories, brands, attributes: [...attributes].sort((a, b) => a.sortOrder - b.sortOrder) }
  }, [])

  const product = useLoad(() => (productId ? catalogAdmin.products.get(productId) : Promise.resolve(null)), [productId])

  const [form, setForm] = useState<FormState>(() => fromProduct(null))
  const [images, setImages] = useState<ProductImage[]>([])
  const [pending, setPending] = useState<PendingImage[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (product.data) {
      setForm(fromProduct(product.data))
      setImages(product.data.images)
    }
  }, [product.data])

  useEffect(() => () => pending.forEach((p) => URL.revokeObjectURL(p.url)), [pending])

  const categories = useMemo(() => flattenTree(dicts.data?.categories ?? []), [dicts.data])
  const attrById = useMemo(() => new Map((dicts.data?.attributes ?? []).map((a) => [a.id, a])), [dicts.data])

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }))

  function onName(value: string) {
    setForm((f) => ({ ...f, name: value, slug: f.slugTouched ? f.slug : slugify(value) }))
  }

  /* ---------- признаки вариантов ---------- */

  const usedByProduct = new Set(form.attributes.map((a) => a.attributeId))
  const usedByAxes = new Set(form.axes)
  const freeAttributes = (dicts.data?.attributes ?? []).filter((a) => !usedByAxes.has(a.id) && !usedByProduct.has(a.id))

  function addAxis(attributeId: number) {
    setForm((f) => ({
      ...f,
      axes: [...f.axes, attributeId],
      variants: f.variants.map((v) => ({ ...v, attributes: [...v.attributes, { attributeId, value: '' }] })),
    }))
  }

  function removeAxis(attributeId: number) {
    setForm((f) => ({
      ...f,
      axes: f.axes.filter((id) => id !== attributeId),
      variants: f.variants.map((v) => ({ ...v, attributes: v.attributes.filter((a) => a.attributeId !== attributeId) })),
    }))
  }

  /** Значения, уже введённые по этому признаку в других строках: для подсказок и генерации. */
  function axisValues(attributeId: number): string[] {
    const out: string[] = []
    for (const v of form.variants) {
      const val = axisValue(v, attributeId).trim()
      if (val && !out.some((x) => x.toLowerCase() === val.toLowerCase())) out.push(val)
    }
    return out
  }

  /** Добавляет строки для всех комбинаций введённых значений, которых ещё нет. */
  function generateCombos() {
    const lists = form.axes.map((id) => axisValues(id))
    if (lists.some((l) => l.length === 0)) return
    const combos = lists.reduce<string[][]>((acc, list) => acc.flatMap((c) => list.map((v) => [...c, v])), [[]])
    const existing = new Set(form.variants.map((v) => comboKey(v, form.axes)))
    const fresh: ProductVariant[] = []
    for (const combo of combos) {
      const v: ProductVariant = { ...emptyVariant(form.axes), attributes: form.axes.map((id, i) => ({ attributeId: id, value: combo[i] })) }
      if (!existing.has(comboKey(v, form.axes))) fresh.push(v)
    }
    if (!fresh.length) {
      toast.success('Все комбинации уже есть')
      return
    }
    // пустые строки-заготовки заменяем сгенерированными
    const kept = form.variants.filter((v) => v.sku || v.price || v.attributes.some((a) => a.value.trim()))
    set('variants', [...kept, ...fresh])
    toast.success(`Добавлено вариантов: ${fresh.length}`)
  }

  const canGenerate = form.axes.length > 0 && form.axes.every((id) => axisValues(id).length > 0)

  /* ---------- варианты ---------- */

  function updateVariant(i: number, patch: Partial<ProductVariant>) {
    setForm((f) => ({ ...f, variants: f.variants.map((v, idx) => (idx === i ? { ...v, ...patch } : v)) }))
  }

  function updateVariantAxis(i: number, attributeId: number, value: string) {
    setForm((f) => ({
      ...f,
      variants: f.variants.map((v, idx) =>
        idx === i ? { ...v, attributes: v.attributes.map((a) => (a.attributeId === attributeId ? { ...a, value } : a)) } : v,
      ),
    }))
  }

  function removeVariant(i: number) {
    setForm((f) => ({ ...f, variants: f.variants.length > 1 ? f.variants.filter((_, idx) => idx !== i) : f.variants }))
  }

  /* ---------- характеристики товара ---------- */

  function addAttribute() {
    const next = freeAttributes[0]
    if (!next) return
    set('attributes', [...form.attributes, { attributeId: next.id, value: '' }])
  }

  function updateAttribute(i: number, patch: Partial<ProductAttributeValue>) {
    set('attributes', form.attributes.map((a, idx) => (idx === i ? { ...a, ...patch } : a)))
  }

  /* ---------- фото ---------- */

  function addFiles(files: FileList | null) {
    if (!files?.length) return
    const next = Array.from(files)
      .filter((f) => f.type.startsWith('image/'))
      .map((file) => ({ key: ++pendingSeq, file, url: URL.createObjectURL(file) }))
    setPending((p) => [...p, ...next])
  }

  async function uploadPending(pid: number) {
    if (!pending.length) return
    setUploading(true)
    try {
      for (const p of pending) {
        const img = await catalogAdmin.products.uploadImage(pid, p.file)
        setImages((list) => [...list, img])
        setPending((list) => list.filter((x) => x.key !== p.key))
      }
    } finally {
      setUploading(false)
    }
  }

  async function deleteImage(img: ProductImage) {
    if (!productId) return
    try {
      await catalogAdmin.products.deleteImage(productId, img.id)
      setImages((list) => {
        const rest = list.filter((i) => i.id !== img.id)
        if (img.isMain && rest[0]) rest[0] = { ...rest[0], isMain: true }
        return rest
      })
    } catch (e) {
      toast.error(errorMessage(e))
    }
  }

  async function setMain(img: ProductImage) {
    if (!productId || img.isMain) return
    try {
      await catalogAdmin.products.setMainImage(productId, img.id)
      setImages((list) => list.map((i) => ({ ...i, isMain: i.id === img.id })))
    } catch (e) {
      toast.error(errorMessage(e))
    }
  }

  /* ---------- сохранение ---------- */

  function validate(): boolean {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Укажите название'
    if (!form.slug.trim()) e.slug = 'Укажите slug'
    else if (!/^[a-z0-9-]+$/.test(form.slug)) e.slug = 'Только латиница, цифры и дефис'
    if (form.categoryId == null) e.categoryId = 'Выберите категорию'

    const skus = form.variants.map((v) => v.sku.trim().toLowerCase())
    const combos = form.variants.map((v) => comboKey(v, form.axes))
    form.variants.forEach((v, i) => {
      if (!v.sku.trim()) e[`variant.${i}.sku`] = 'SKU обязателен'
      else if (skus.indexOf(skus[i]) !== i) e[`variant.${i}.sku`] = 'SKU повторяется'
      if (!(v.price > 0)) e[`variant.${i}.price`] = 'Цена должна быть больше 0'
      let axesFilled = true
      for (const id of form.axes) {
        if (!axisValue(v, id).trim()) {
          axesFilled = false
          e[`variant.${i}.axis.${id}`] = `Укажите «${attrById.get(id)?.name ?? 'значение'}»`
        }
      }
      if (form.axes.length && axesFilled && combos.indexOf(combos[i]) !== i) {
        e[`variant.${i}.combo`] = 'Такая комбинация уже есть'
      }
    })
    form.attributes.forEach((a, i) => {
      if (!a.value.trim()) e[`attr.${i}`] = 'Заполните значение'
    })
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function onSubmit(ev: FormEvent) {
    ev.preventDefault()
    if (!validate()) {
      setSaveError('Проверьте выделенные поля')
      return
    }
    setSaving(true)
    setSaveError(null)
    const payload: ProductPayload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      description: form.description.trim(),
      categoryId: form.categoryId!,
      brandId: form.brandId,
      isActive: form.isActive,
      variants: form.variants.map((v) => ({
        ...v,
        sku: v.sku.trim(),
        name: form.axes.length ? variantName(v, form.axes, attrById) : v.name.trim(),
        attributes: v.attributes.map((a) => ({ ...a, value: a.value.trim() })),
      })),
      attributes: form.attributes.map((a) => ({ ...a, value: a.value.trim() })),
    }
    try {
      const saved = isNew ? await catalogAdmin.products.create(payload) : await catalogAdmin.products.update(productId, payload)
      await uploadPending(saved.id)
      toast.success(isNew ? 'Товар создан' : 'Изменения сохранены')
      if (isNew) navigate(`/admin/products/${saved.id}`, { replace: true })
      else {
        setForm(fromProduct(saved))
        setImages((list) => (saved.images.length ? saved.images : list))
      }
    } catch (e) {
      setSaveError(errorMessage(e))
    } finally {
      setSaving(false)
    }
  }

  async function onDelete() {
    if (!productId) return
    await catalogAdmin.products.remove(productId)
    toast.success('Товар удалён')
    navigate('/admin/products', { replace: true })
  }

  const busy = saving || uploading
  const loading = dicts.loading || product.loading
  const variantError = Object.entries(errors).find(([k]) => k.startsWith('variant.'))?.[1]
  const previewNames = form.variants.map((v) => variantName(v, form.axes, attrById)).filter(Boolean)

  if (product.error) {
    return (
      <>
        <BackLink />
        <Alert kind="error">{product.error}</Alert>
      </>
    )
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <BackLink />
      <div className="page-head">
        <div>
          <span className="eyebrow">{isNew ? 'Новый товар' : 'Редактирование'}</span>
          <h1>{isNew ? 'Добавить товар' : form.name || '…'}</h1>
          {!isNew && product.data && (
            <p>
              Создан {formatDateTime(product.data.createdAt)}
              {product.data.updatedAt && ` · обновлён ${formatDateTime(product.data.updatedAt)}`}
            </p>
          )}
        </div>
        <div className="page-actions">
          {!isNew && (
            <button type="button" className="btn btn-ghost is-danger" onClick={() => setConfirmDelete(true)} disabled={busy}>
              <IconTrash />
              Удалить
            </button>
          )}
          <button type="submit" className="btn btn-primary" disabled={busy || loading}>
            <IconSave />
            {saving ? 'Сохраняем…' : uploading ? 'Загружаем фото…' : isNew ? 'Создать товар' : 'Сохранить'}
          </button>
        </div>
      </div>

      {saveError && <Alert kind="error">{saveError}</Alert>}
      {dicts.error && <Alert kind="error">{dicts.error}</Alert>}

      <div className="edit-grid">
        <div className="edit-main">
          {/* Основное */}
          <section className="card">
            <div className="form-section">
              <h2>Основное</h2>
              <p>Название и адрес страницы товара</p>
              <div className="field">
                <label htmlFor="name">Название</label>
                <input id="name" className="input" value={form.name} onChange={(e) => onName(e.target.value)} placeholder="Например, iPhone 16 Pro" disabled={loading} />
                {errors.name && <span className="field-hint is-error">{errors.name}</span>}
              </div>
              <div className="field">
                <label htmlFor="slug">Slug</label>
                <div className="control">
                  <input id="slug" className="input mono" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value, slugTouched: true }))} placeholder="iphone-16-pro" disabled={loading} />
                  {form.slugTouched && (
                    <button type="button" className="input-affix" title="Сгенерировать из названия" onClick={() => setForm((f) => ({ ...f, slug: slugify(f.name), slugTouched: false }))}>
                      <IconX />
                    </button>
                  )}
                </div>
                <span className={`field-hint${errors.slug ? ' is-error' : ''}`}>{errors.slug ?? `/catalog/${form.slug || '…'}`}</span>
              </div>
              <div className="field">
                <label htmlFor="description">Описание</label>
                <textarea id="description" className="input textarea" rows={5} value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Расскажите о товаре" disabled={loading} />
              </div>
            </div>
          </section>

          {/* Характеристики товара */}
          <section className="card">
            <div className="form-section">
              <div className="section-head">
                <div>
                  <h2>Характеристики</h2>
                  <p>Общее для всех вариантов: диагональ, вес, материал</p>
                </div>
                <button type="button" className="btn btn-ghost btn-sm" onClick={addAttribute} disabled={!freeAttributes.length}>
                  <IconPlus />
                  Характеристика
                </button>
              </div>
              {form.attributes.length === 0 ? (
                <p className="muted small" style={{ margin: 0 }}>
                  {dicts.data && dicts.data.attributes.length === 0 ? (
                    <>
                      Справочник пуст. Сначала создайте атрибуты в разделе <Link to="/admin/attributes">Атрибуты</Link>.
                    </>
                  ) : (
                    'Пока нет характеристик. То, чем варианты отличаются друг от друга, задаётся ниже в блоке «Варианты».'
                  )}
                </p>
              ) : (
                <div className="attr-rows">
                  {form.attributes.map((a, i) => {
                    const attr = attrById.get(a.attributeId)
                    return (
                      <div key={a.attributeId} className="attr-row">
                        <select className="select input-sm" value={a.attributeId} onChange={(e) => updateAttribute(i, { attributeId: Number(e.target.value) })}>
                          {attr && <option value={attr.id}>{attr.name}</option>}
                          {freeAttributes.map((f) => (
                            <option key={f.id} value={f.id}>
                              {f.name}
                            </option>
                          ))}
                        </select>
                        <div className="control">
                          <input className={`input input-sm${errors[`attr.${i}`] ? ' is-invalid' : ''}`} value={a.value} onChange={(e) => updateAttribute(i, { value: e.target.value })} placeholder="Значение" />
                          {attr?.unit && <span className="input-suffix">{attr.unit}</span>}
                        </div>
                        <button type="button" className="btn btn-ghost btn-icon btn-sm is-danger" onClick={() => set('attributes', form.attributes.filter((_, idx) => idx !== i))} title="Убрать">
                          <IconTrash />
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </section>

          {/* Варианты */}
          <section className="card">
            <div className="form-section">
              <div className="section-head">
                <div>
                  <h2>Варианты</h2>
                  <p>То, что покупатель кладёт в корзину: свой SKU, цена и остаток</p>
                </div>
                <div className="page-actions">
                  {form.axes.length > 0 && (
                    <button type="button" className="btn btn-ghost btn-sm" onClick={generateCombos} disabled={!canGenerate} title="Создать строки для всех сочетаний введённых значений">
                      <IconLayers />
                      Все комбинации
                    </button>
                  )}
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => set('variants', [...form.variants, emptyVariant(form.axes)])}>
                    <IconPlus />
                    Вариант
                  </button>
                </div>
              </div>

              <div className="axes">
                <span className="axes-label">Варьируется по:</span>
                {form.axes.map((id) => (
                  <span key={id} className="chip">
                    {attrById.get(id)?.name ?? `#${id}`}
                    <button type="button" onClick={() => removeAxis(id)} aria-label="Убрать признак">
                      <IconX />
                    </button>
                  </span>
                ))}
                {freeAttributes.length > 0 ? (
                  <select className="select axes-add" value="" onChange={(e) => e.target.value && addAxis(Number(e.target.value))}>
                    <option value="">{form.axes.length ? '+ ещё признак' : '+ добавить признак'}</option>
                    {freeAttributes.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  form.axes.length === 0 && <span className="muted small">нет свободных атрибутов</span>
                )}
                {form.axes.length === 0 && <span className="axes-hint muted small">Например: память, цвет, размер. Появятся колонками в таблице.</span>}
              </div>

              <div className="table-wrap">
                <table className="table table-edit">
                  <thead>
                    <tr>
                      <th style={{ width: 140 }}>SKU</th>
                      {form.axes.length === 0 ? (
                        <th>Название</th>
                      ) : (
                        form.axes.map((id) => (
                          <th key={id} className="axis">
                            {attrById.get(id)?.name}
                            {attrById.get(id)?.unit && <span className="muted">, {attrById.get(id)?.unit}</span>}
                          </th>
                        ))
                      )}
                      <th style={{ width: 110 }}>Цена</th>
                      <th style={{ width: 84 }}>Остаток</th>
                      <th style={{ width: 60 }}>Вкл.</th>
                      <th className="actions" />
                    </tr>
                  </thead>
                  <tbody>
                    {form.variants.map((v, i) => {
                      const comboErr = errors[`variant.${i}.combo`]
                      return (
                        <tr key={v.id ?? `new-${i}`} className={comboErr ? 'is-invalid-row' : undefined} title={comboErr}>
                          <td>
                            <input className={`input input-sm mono${errors[`variant.${i}.sku`] ? ' is-invalid' : ''}`} value={v.sku} onChange={(e) => updateVariant(i, { sku: e.target.value.toUpperCase() })} placeholder="SKU-001" title={errors[`variant.${i}.sku`]} />
                          </td>
                          {form.axes.length === 0 ? (
                            <td>
                              <input className="input input-sm" value={v.name} onChange={(e) => updateVariant(i, { name: e.target.value })} placeholder="Необязательно" />
                            </td>
                          ) : (
                            form.axes.map((id) => (
                              <td key={id} className="axis">
                                <input
                                  className={`input input-sm${errors[`variant.${i}.axis.${id}`] || comboErr ? ' is-invalid' : ''}`}
                                  list={`axis-${id}`}
                                  value={axisValue(v, id)}
                                  onChange={(e) => updateVariantAxis(i, id, e.target.value)}
                                  placeholder={attrById.get(id)?.name}
                                  title={errors[`variant.${i}.axis.${id}`]}
                                />
                              </td>
                            ))
                          )}
                          <td>
                            <input type="number" min={0} step="1" className={`input input-sm num${errors[`variant.${i}.price`] ? ' is-invalid' : ''}`} value={v.price || ''} onChange={(e) => updateVariant(i, { price: Number(e.target.value) })} title={errors[`variant.${i}.price`]} />
                          </td>
                          <td>
                            <input type="number" min={0} step="1" className="input input-sm num" value={v.stock} onChange={(e) => updateVariant(i, { stock: Number(e.target.value) })} />
                          </td>
                          <td>
                            <Toggle checked={v.isActive} onChange={(val) => updateVariant(i, { isActive: val })} />
                          </td>
                          <td className="actions">
                            <button type="button" className="btn btn-ghost btn-icon btn-sm is-danger" onClick={() => removeVariant(i)} disabled={form.variants.length === 1} title="Удалить вариант">
                              <IconTrash />
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
                {form.axes.map((id) => (
                  <datalist key={id} id={`axis-${id}`}>
                    {axisValues(id).map((val) => (
                      <option key={val} value={val} />
                    ))}
                  </datalist>
                ))}
              </div>

              {form.axes.length > 0 && (
                <div className="variants-preview muted small">
                  <span>Названия вариантов соберутся автоматически:</span>
                  {previewNames.length === 0 && <em>заполните значения в таблице</em>}
                  {previewNames.map((n, i) => (
                    <span key={i} className="badge">
                      {n}
                    </span>
                  ))}
                </div>
              )}
              {variantError && <span className="field-hint is-error">{variantError}</span>}
            </div>
          </section>

          {/* Фото */}
          <section className="card">
            <div className="form-section">
              <div className="section-head">
                <div>
                  <h2>Фотографии</h2>
                  <p>Фото со звёздочкой показывается в каталоге</p>
                </div>
              </div>
              <div className="gallery">
                {images.map((img) => (
                  <figure key={img.id} className={`gallery-item${img.isMain ? ' is-main' : ''}`}>
                    <img src={img.url} alt={img.alt ?? ''} />
                    <button type="button" className={`gallery-star${img.isMain ? ' is-on' : ''}`} onClick={() => setMain(img)} title={img.isMain ? 'Главное фото' : 'Сделать главным'}>
                      <IconStar />
                    </button>
                    <button type="button" className="gallery-remove" onClick={() => deleteImage(img)} title="Удалить фото">
                      <IconX />
                    </button>
                  </figure>
                ))}
                {pending.map((p) => (
                  <figure key={p.key} className="gallery-item is-pending">
                    <img src={p.url} alt="" />
                    <span className="gallery-badge">{uploading ? 'Загрузка…' : 'Не загружено'}</span>
                    <button type="button" className="gallery-remove" onClick={() => setPending((list) => list.filter((x) => x.key !== p.key))} title="Убрать">
                      <IconX />
                    </button>
                  </figure>
                ))}
                <label
                  className="gallery-add"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault()
                    addFiles(e.dataTransfer.files)
                  }}
                >
                  <IconUpload />
                  <span>Добавить фото</span>
                  <small>или перетащите сюда</small>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="visually-hidden"
                    onChange={(e) => {
                      addFiles(e.target.files)
                      e.target.value = ''
                    }}
                  />
                </label>
              </div>
              {pending.length > 0 && !isNew && (
                <div className="gallery-pending-actions">
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => productId && uploadPending(productId)} disabled={uploading}>
                    <IconUpload />
                    Загрузить {pending.length} {pending.length === 1 ? 'файл' : 'файлов'} сейчас
                  </button>
                  <span className="muted small">или они загрузятся при сохранении</span>
                </div>
              )}
              {isNew && pending.length > 0 && <p className="muted small">Фото загрузятся после создания товара.</p>}
            </div>
          </section>
        </div>

        <aside className="edit-side">
          <section className="card">
            <div className="form-section">
              <h2>Публикация</h2>
              <p>Скрытый товар не виден покупателям</p>
              <div className="publish-row">
                <Toggle checked={form.isActive} onChange={(v) => set('isActive', v)} label={form.isActive ? 'В продаже' : 'Скрыт'} />
                <span className={`pill ${form.isActive ? 'pill-success' : 'pill-muted'}`}>{form.isActive ? 'Активен' : 'Черновик'}</span>
              </div>
            </div>
          </section>

          <section className="card">
            <div className="form-section">
              <h2>Классификация</h2>
              <p>Где товар живёт в каталоге</p>
              <div className="field">
                <label htmlFor="category">Категория</label>
                <select id="category" className={`select${errors.categoryId ? ' is-invalid' : ''}`} value={form.categoryId ?? ''} onChange={(e) => set('categoryId', e.target.value ? Number(e.target.value) : null)} disabled={loading}>
                  <option value="">Выберите категорию</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {indent(c.depth)}
                      {c.name}
                    </option>
                  ))}
                </select>
                {errors.categoryId && <span className="field-hint is-error">{errors.categoryId}</span>}
              </div>
              <div className="field">
                <label htmlFor="brand">Бренд</label>
                <select id="brand" className="select" value={form.brandId ?? ''} onChange={(e) => set('brandId', e.target.value ? Number(e.target.value) : null)} disabled={loading}>
                  <option value="">Без бренда</option>
                  {dicts.data?.brands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <section className="card">
            <div className="form-section">
              <h2>Сводка</h2>
              <dl className="kv">
                <div>
                  <dt>Вариантов</dt>
                  <dd>{form.variants.length}</dd>
                </div>
                <div>
                  <dt>Признаки</dt>
                  <dd>{form.axes.length ? form.axes.map((id) => attrById.get(id)?.name).join(', ') : '—'}</dd>
                </div>
                <div>
                  <dt>Остаток</dt>
                  <dd>{form.variants.reduce((s, v) => s + (v.stock || 0), 0)}</dd>
                </div>
                <div>
                  <dt>Фото</dt>
                  <dd>{images.length + pending.length}</dd>
                </div>
                <div>
                  <dt>Характеристик</dt>
                  <dd>{form.attributes.length}</dd>
                </div>
              </dl>
            </div>
          </section>
        </aside>
      </div>

      <div className="save-bar">
        <span className="muted small">{isNew ? 'Товар ещё не сохранён' : 'Изменения вступят в силу после сохранения'}</span>
        <button type="submit" className="btn btn-primary" disabled={busy || loading}>
          <IconSave />
          {saving ? 'Сохраняем…' : isNew ? 'Создать товар' : 'Сохранить'}
        </button>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Удалить товар?"
        text="Товар будет удалён вместе с вариантами, фото и характеристиками. Это действие нельзя отменить."
        onConfirm={onDelete}
        onClose={() => setConfirmDelete(false)}
      />
    </form>
  )
}

function BackLink() {
  return (
    <Link to="/admin/products" className="back-link">
      <IconChevronLeft />
      К списку товаров
    </Link>
  )
}
