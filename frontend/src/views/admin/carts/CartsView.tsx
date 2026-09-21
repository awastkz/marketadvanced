import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { cartAdmin } from '../../../api/admin/cart'
import { useLoad } from '../../../utils/useLoad'
import { formatDateTime, formatMoney } from '../../../utils/format'
import Alert from '../../../components/Alert'
import Pagination from '../../../components/admin/Pagination'
import EmptyState from '../../../components/admin/EmptyState'
import { IconBag, IconSearch, IconX } from '../../../components/icons'

const PAGE_SIZE = 20

export default function CartsView() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()

  const search = params.get('q') ?? ''
  const onlyNonEmpty = params.get('nonEmpty') === '1'
  const page = Number(params.get('page') ?? '1') || 1

  const [searchInput, setSearchInput] = useState(search)

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

  const list = useLoad(() => cartAdmin.carts.list({ search, onlyNonEmpty, page, pageSize: PAGE_SIZE }), [search, onlyNonEmpty, page])

  const hasFilters = !!search || onlyNonEmpty

  return (
    <>
      <div className="page-head">
        <div>
          <span className="eyebrow">Корзины</span>
          <h1>Корзины покупателей</h1>
          <p>{list.data ? `${list.data.total} корзин` : 'Активные и брошенные корзины'}</p>
        </div>
      </div>

      <div className="toolbar">
        <div className="control toolbar-search">
          <IconSearch />
          <input className="input" placeholder="Поиск по ID пользователя или гостя" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
          {searchInput && (
            <button type="button" className="input-affix" onClick={() => setSearchInput('')} aria-label="Очистить">
              <IconX />
            </button>
          )}
        </div>
        <label className="checkbox-field">
          <input type="checkbox" checked={onlyNonEmpty} onChange={(e) => patch({ nonEmpty: e.target.checked ? '1' : null, page: null })} />
          Только непустые
        </label>
      </div>

      {list.error && <Alert kind="error">{list.error}</Alert>}

      <div className="card">
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Владелец</th>
                <th className="num">Позиций</th>
                <th className="num">Кол-во</th>
                <th className="num">Сумма</th>
                <th>Обновлена</th>
                <th>Истекает</th>
                <th className="actions" />
              </tr>
            </thead>
            <tbody>
              {list.loading &&
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={7}>
                      <span className="skeleton" />
                    </td>
                  </tr>
                ))}
              {!list.loading &&
                list.data?.items.map((c) => (
                  <tr key={c.id} className="is-link" onClick={() => navigate(`/admin/carts/${c.id}`)}>
                    <td>
                      <span className="product-cell-name">{c.ownerLabel}</span>
                    </td>
                    <td className="num">{c.itemsCount}</td>
                    <td className="num">{c.totalQuantity}</td>
                    <td className="num">{formatMoney(c.totalAmount)}</td>
                    <td className="muted">{formatDateTime(c.updatedAt)}</td>
                    <td className="muted">{c.expiresAt ? formatDateTime(c.expiresAt) : '—'}</td>
                    <td className="actions" />
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {!list.loading && list.data?.items.length === 0 && (
          <EmptyState
            icon={<IconBag />}
            title={hasFilters ? 'Ничего не найдено' : 'Корзин пока нет'}
            text={hasFilters ? 'Попробуйте изменить фильтры или поисковый запрос.' : 'Здесь появятся корзины покупателей.'}
            action={
              hasFilters ? (
                <button type="button" className="btn btn-ghost" onClick={() => { setSearchInput(''); setParams({}, { replace: true }) }}>
                  Сбросить фильтры
                </button>
              ) : undefined
            }
          />
        )}

        {list.data && <Pagination page={page} pageSize={PAGE_SIZE} total={list.data.total} onChange={(p) => patch({ page: String(p) })} />}
      </div>
    </>
  )
}
