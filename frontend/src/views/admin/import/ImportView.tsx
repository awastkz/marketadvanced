import { useMemo, useState } from 'react'
import { catalogAdmin } from '../../../api/admin/catalog'
import { useLoad } from '../../../utils/useLoad'
import { flattenTree, indent } from '../../../utils/categories'
import Alert from '../../../components/Alert'
import ImportPanel from '../../../components/admin/ImportPanel'
import ExportPanel from '../../../components/admin/ExportPanel'
import { makeAttributeSpec, makeBrandSpec, makeCategorySpec, makeProductSpec } from './importSpecs'
import { makeAttributeExportSpec, makeBrandExportSpec, makeCategoryExportSpec, makeProductExportSpec } from './exportSpecs'
import { IconUpload } from '../../../components/icons'

type Mode = 'import' | 'export'
type EntityKey = 'categories' | 'brands' | 'attributes' | 'products'

const ENTITY_TABS: { key: EntityKey; label: string }[] = [
  { key: 'categories', label: 'Категории' },
  { key: 'brands', label: 'Бренды' },
  { key: 'attributes', label: 'Атрибуты' },
  { key: 'products', label: 'Товары' },
]

export default function ImportView() {
  const [mode, setMode] = useState<Mode>('import')
  const [entity, setEntity] = useState<EntityKey>('categories')

  const [exportCategoryId, setExportCategoryId] = useState<number | null>(null)
  const [exportStatus, setExportStatus] = useState<'all' | 'active' | 'hidden'>('all')

  const dicts = useLoad(async () => {
    const [categories, brands] = await Promise.all([catalogAdmin.categories.list(), catalogAdmin.brands.list()])
    return { categories, brands }
  }, [])
  const categoryTree = dicts.data ? flattenTree(dicts.data.categories) : []

  // Импорт
  const categorySpec = useMemo(() => makeCategorySpec(), [])
  const brandSpec = useMemo(() => makeBrandSpec(), [])
  const attributeSpec = useMemo(() => makeAttributeSpec(), [])
  const productSpec = useMemo(
    () => makeProductSpec(dicts.data?.categories ?? [], dicts.data?.brands ?? []),
    [dicts.data],
  )

  // Экспорт
  const categoryExportSpec = useMemo(() => makeCategoryExportSpec(), [])
  const brandExportSpec = useMemo(() => makeBrandExportSpec(), [])
  const attributeExportSpec = useMemo(() => makeAttributeExportSpec(), [])
  const productExportSpec = useMemo(
    () => makeProductExportSpec({ categoryId: exportCategoryId, isActive: exportStatus === 'all' ? null : exportStatus === 'active' }),
    [exportCategoryId, exportStatus],
  )

  return (
    <>
      <div className="page-head">
        <div>
          <span className="eyebrow">Каталог</span>
          <h1>Импорт / экспорт</h1>
          <p>Категории, бренды, атрибуты и товары — загрузка и выгрузка CSV в одном разделе.</p>
        </div>
      </div>

      {dicts.error && <Alert kind="error">{dicts.error}</Alert>}

      <div className="segmented import-mode-tabs">
        <label>
          <input type="radio" name="import-mode" checked={mode === 'import'} onChange={() => setMode('import')} />
          Импорт
        </label>
        <label>
          <input type="radio" name="import-mode" checked={mode === 'export'} onChange={() => setMode('export')} />
          Экспорт
        </label>
      </div>

      <div className="segmented import-tabs">
        {ENTITY_TABS.map((t) => (
          <label key={t.key}>
            <input type="radio" name="import-entity" checked={entity === t.key} onChange={() => setEntity(t.key)} />
            {t.label}
          </label>
        ))}
      </div>

      {mode === 'import' && (
        <>
          {entity === 'categories' && <ImportPanel spec={categorySpec} />}
          {entity === 'brands' && <ImportPanel spec={brandSpec} />}
          {entity === 'attributes' && <ImportPanel spec={attributeSpec} />}
          {entity === 'products' &&
            (dicts.loading ? <PlaceholderLoading /> : <ImportPanel key={dicts.data ? 'ready' : 'empty'} spec={productSpec} />)}
        </>
      )}

      {mode === 'export' && (
        <>
          {entity === 'categories' && <ExportPanel spec={categoryExportSpec} />}
          {entity === 'brands' && <ExportPanel spec={brandExportSpec} />}
          {entity === 'attributes' && <ExportPanel spec={attributeExportSpec} />}
          {entity === 'products' && (
            <ExportPanel
              spec={productExportSpec}
              filters={
                <div className="export-filters">
                  <select
                    className="select"
                    value={exportCategoryId ?? ''}
                    onChange={(e) => setExportCategoryId(e.target.value ? Number(e.target.value) : null)}
                  >
                    <option value="">Все категории</option>
                    {categoryTree.map((c) => (
                      <option key={c.id} value={c.id}>
                        {indent(c.depth)}
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <div className="segmented">
                    {[
                      ['all', 'Все'],
                      ['active', 'В продаже'],
                      ['hidden', 'Скрытые'],
                    ].map(([v, l]) => (
                      <label key={v}>
                        <input
                          type="radio"
                          name="export-status"
                          checked={exportStatus === v}
                          onChange={() => setExportStatus(v as typeof exportStatus)}
                        />
                        {l}
                      </label>
                    ))}
                  </div>
                </div>
              }
            />
          )}
        </>
      )}
    </>
  )
}

function PlaceholderLoading() {
  return (
    <div className="empty">
      <span className="empty-icon">
        <IconUpload />
      </span>
      <h3>Загружаем категории и бренды…</h3>
      <p>Нужны для проверки categorySlug и brandSlug в файле товаров.</p>
    </div>
  )
}
