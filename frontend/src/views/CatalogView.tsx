import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import AppShell from '../components/AppShell'
import Alert from '../components/Alert'
import EmptyState from '../components/admin/EmptyState'
import Pagination from '../components/admin/Pagination'
import ProductCard from '../components/ProductCard'
import ProductQuickView from '../components/ProductQuickView'
import { catalogAdmin } from '../api/admin/catalog'
import { useLoad } from '../utils/useLoad'
import { flattenTree } from '../utils/categories'
import { IconBox, IconSearch, IconX } from '../components/icons'

const PAGE_SIZE = 12

export default function CatalogView() {
  const [params, setParams] = useSearchParams()
  const search = params.get('q') ?? ''
  const categoryId = params.get('category') ? Number(params.get('category')) : null
  const page = Number(params.get('page') ?? '1') || 1

  const [searchInput, setSearchInput] = useState(search)
  const [openProductId, setOpenProductId] = useState<number | null>(null)

  function patch(next: Record<string, string | null>) {
    const p = new URLSearchParams(params)
    for (const [k, v] of Object.entries(next)) {
      if (v == null || v === '' || (k === 'page' && v === '1')) p.delete(k)
      else p.set(k, v)
    }
    setParams(p, { replace: true })
  }

  useEffect(() => {
    const t = setTimeout(() => {
      if (searchInput !== search) patch({ q: searchInput, page: null })
    }, 300)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput])

  const categories = useLoad(() => catalogAdmin.categories.list(), [])
  const tree = categories.data ? flattenTree(categories.data) : []

  // Покупателю показываем только то, что реально продаётся
  const list = useLoad(
    () => catalogAdmin.products.list({ search, categoryId, brandId: null, isActive: true, page, pageSize: PAGE_SIZE }),
    [search, categoryId, page],
  )

  const hasFilters = !!search || categoryId != null

  function resetFilters() {
    setSearchInput('')
    setParams({}, { replace: true })
  }

  return (
    <AppShell>
      <div className="page-head">
        <div>
          <span className="eyebrow">Покупки</span>
          <h1>Каталог</h1>
          <p>{list.data ? `${list.data.total} товаров` : 'Все товары площадки'}</p>
        </div>
      </div>

      <div className="catalog-grid">
        <aside className="catalog-sidebar">
          <div className="card">
            <div className="card-body">
              <p className="card-title">Категории</p>
              <nav className="catalog-categories" aria-label="Категории товаров">
                <button
                  type="button"
                  className={categoryId == null ? 'is-active' : undefined}
                  onClick={() => patch({ category: null, page: null })}
                >
                  Все категории
                </button>
                {tree.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className={categoryId === c.id ? 'is-active' : undefined}
                    style={{ paddingLeft: 14 + c.depth * 14 }}
                    onClick={() => patch({ category: String(c.id), page: null })}
                  >
                    <span>{c.name}</span>
                    {c.productsCount > 0 && <span className="catalog-category-count">{c.productsCount}</span>}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </aside>

        <div className="catalog-main">
          <div className="control catalog-search">
            <IconSearch />
            <input
              className="input"
              placeholder="Поиск по товарам"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            {searchInput && (
              <button type="button" className="input-affix" onClick={() => setSearchInput('')} aria-label="Очистить">
                <IconX />
              </button>
            )}
          </div>

          {list.error && <Alert kind="error">{list.error}</Alert>}

          {list.loading && (
            <div className="product-grid">
              {Array.from({ length: 8 }).map((_, i) => (
                <div className="card product-card-skeleton" key={i}>
                  <span className="skeleton" style={{ display: 'block', height: 160 }} />
                </div>
              ))}
            </div>
          )}

          {!list.loading && list.data && list.data.items.length === 0 && (
            <EmptyState
              icon={<IconBox />}
              title="Ничего не найдено"
              text={hasFilters ? 'Попробуйте изменить категорию или поисковый запрос.' : 'В каталоге пока нет товаров.'}
              action={
                hasFilters ? (
                  <button type="button" className="btn btn-ghost" onClick={resetFilters}>
                    Сбросить фильтры
                  </button>
                ) : undefined
              }
            />
          )}

          {!list.loading && list.data && list.data.items.length > 0 && (
            <>
              <div className="product-grid">
                {list.data.items.map((p) => (
                  <ProductCard key={p.id} product={p} onOpen={setOpenProductId} />
                ))}
              </div>
              <Pagination page={page} pageSize={PAGE_SIZE} total={list.data.total} onChange={(p) => patch({ page: String(p) })} />
            </>
          )}
        </div>
      </div>

      <ProductQuickView productId={openProductId} onClose={() => setOpenProductId(null)} />
    </AppShell>
  )
}
