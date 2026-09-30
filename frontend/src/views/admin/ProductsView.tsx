import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { catalogAdmin } from '../../api/admin/catalog'
import type { ProductListItem } from '../../api/admin/types'
import { useLoad } from '../../utils/useLoad'
import { flattenTree, indent } from '../../utils/categories'
import { formatDate, formatMoney } from '../../utils/format'
import { toast } from '../../stores/toast'
import Alert from '../../components/Alert'
import Pagination from '../../components/admin/Pagination'
import EmptyState from '../../components/admin/EmptyState'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import { IconBox, IconEdit, IconImage, IconPlus, IconSearch, IconTrash, IconX } from '../../components/icons'

const PAGE_SIZE = 20

export default function ProductsView() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()

  const search = params.get('q') ?? ''
  const categoryId = params.get('category')
  const brandId = params.get('brand')
  const status = params.get('status') ?? 'all'
  const page = Number(params.get('page') ?? '1') || 1

  const [searchInput, setSearchInput] = useState(search)
  const [toDelete, setToDelete] = useState<ProductListItem | null>(null)

  function patch(next: Record<string, string | null>) {
    const p = new URLSearchParams(params)
    for (const [k, v] of Object.entries(next)) {
      if (v == null || v === '' || (k === 'page' && v === '1') || (k === 'status' && v === 'all')) p.delete(k)
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

  const dicts = useLoad(async () => {
    const [categories, brands] = await Promise.all([catalogAdmin.categories.list(), catalogAdmin.brands.list()])
    return { categories: flattenTree(categories), brands }
  }, [])

  const list = useLoad(
    () =>
      catalogAdmin.products.list({
        search,
        categoryId,
        brandId,
        isActive: status === 'all' ? null : status === 'active',
        page,
        pageSize: PAGE_SIZE,
      }),
    [search, categoryId, brandId, status, page],
  )

  const hasFilters = !!search || categoryId != null || brandId != null || status !== 'all'

  async function remove(p: ProductListItem) {
    await catalogAdmin.products.remove(p.id)
    toast.success(`Товар «${p.name}» удалён`)
    list.reload()
  }

  return (
    <>
      <div className="page-head">
        <div>
          <span className="eyebrow">Каталог</span>
          <h1>Товары</h1>
          <p>{list.data ? `${list.data.total} позиций` : 'Все товары площадки'}</p>
        </div>
        <div className="page-actions">
          <Link to="/admin/products/new" className="btn btn-primary">
            <IconPlus />
            Новый товар
          </Link>
        </div>
      </div>

      <div className="toolbar">
        <div className="control toolbar-search">
          <IconSearch />
          <input className="input" placeholder="Поиск по названию или slug" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
          {searchInput && (
            <button type="button" className="input-affix" onClick={() => setSearchInput('')} aria-label="Очистить">
              <IconX />
            </button>
          )}
        </div>
        <select className="select" value={categoryId ?? ''} onChange={(e) => patch({ category: e.target.value || null, page: null })}>
          <option value="">Все категории</option>
          {dicts.data?.categories.map((c) => (
            <option key={c.id} value={c.id}>
              {indent(c.depth)}
              {c.name}
            </option>
          ))}
        </select>
        <select className="select" value={brandId ?? ''} onChange={(e) => patch({ brand: e.target.value || null, page: null })}>
          <option value="">Все бренды</option>
          {dicts.data?.brands.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
        <div className="segmented toolbar-status">
          {[
            ['all', 'Все'],
            ['active', 'В продаже'],
            ['hidden', 'Скрытые'],
          ].map(([v, l]) => (
            <label key={v}>
              <input type="radio" name="status" value={v} checked={status === v} onChange={() => patch({ status: v, page: null })} />
              {l}
            </label>
          ))}
        </div>
      </div>

      {list.error && <Alert kind="error">{list.error}</Alert>}

      <div className="card">
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Товар</th>
                <th>Категория</th>
                <th>Бренд</th>
                <th className="num">Цена от</th>
                <th className="num">Остаток</th>
                <th className="num">Вар.</th>
                <th>Статус</th>
                <th>Обновлён</th>
                <th className="actions" />
              </tr>
            </thead>
            <tbody>
              {list.loading &&
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={9}>
                      <span className="skeleton" />
                    </td>
                  </tr>
                ))}
              {!list.loading &&
                list.data?.items.map((p) => (
                  <tr key={p.id} className="is-link" onClick={() => navigate(`/admin/products/${p.id}`)}>
                    <td>
                      <span className="product-cell">
                        <span className="thumb">{p.imageUrl ? <img src={p.imageUrl} alt="" /> : <IconImage />}</span>
                        <span className="product-cell-text">
                          <span className="product-cell-name">{p.name}</span>
                          <span className="product-cell-sub">{p.slug}</span>
                        </span>
                      </span>
                    </td>
                    <td>{p.categoryName}</td>
                    <td className={p.brandName ? undefined : 'muted'}>{p.brandName ?? '—'}</td>
                    <td className="num">{formatMoney(p.minPrice)}</td>
                    <td className={`num${p.totalStock === 0 ? ' is-danger' : ''}`}>{p.totalStock}</td>
                    <td className="num">{p.variantsCount}</td>
                    <td>
                      <span className={`pill ${p.isActive ? 'pill-success' : 'pill-muted'}`}>{p.isActive ? 'В продаже' : 'Скрыт'}</span>
                    </td>
                    <td className="muted">{formatDate(p.updatedAt ?? p.createdAt)}</td>
                    <td className="actions" onClick={(e) => e.stopPropagation()}>
                      <Link to={`/admin/products/${p.id}`} className="btn btn-ghost btn-icon btn-sm" title="Редактировать">
                        <IconEdit />
                      </Link>
                      <button type="button" className="btn btn-ghost btn-icon btn-sm is-danger" title="Удалить" onClick={() => setToDelete(p)}>
                        <IconTrash />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {!list.loading && list.data?.items.length === 0 && (
          <EmptyState
            icon={<IconBox />}
            title={hasFilters ? 'Ничего не найдено' : 'Товаров пока нет'}
            text={hasFilters ? 'Попробуйте изменить фильтры или поисковый запрос.' : 'Добавьте первый товар, чтобы он появился в каталоге.'}
            action={
              hasFilters ? (
                <button type="button" className="btn btn-ghost" onClick={() => { setSearchInput(''); setParams({}, { replace: true }) }}>
                  Сбросить фильтры
                </button>
              ) : (
                <Link to="/admin/products/new" className="btn btn-primary">
                  <IconPlus />
                  Новый товар
                </Link>
              )
            }
          />
        )}

        {list.data && <Pagination page={page} pageSize={PAGE_SIZE} total={list.data.total} onChange={(p) => patch({ page: String(p) })} />}
      </div>

      <ConfirmDialog
        open={!!toDelete}
        title="Удалить товар?"
        text={`«${toDelete?.name}» будет удалён вместе со всеми вариантами и фото. Это действие нельзя отменить.`}
        onConfirm={() => (toDelete ? remove(toDelete) : undefined)}
        onClose={() => setToDelete(null)}
      />
    </>
  )
}
