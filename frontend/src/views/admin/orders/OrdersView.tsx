import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { orderAdmin } from '../../../api/admin/order'
import { ORDER_STATUSES, type OrderStatus } from '../../../api/admin/orderTypes'
import { useLoad } from '../../../utils/useLoad'
import { ORDER_STATUS_LABELS, ORDER_STATUS_PILL } from '../../../utils/orderStatus'
import { formatDateTime, formatMoney } from '../../../utils/format'
import Alert from '../../../components/Alert'
import Pagination from '../../../components/admin/Pagination'
import EmptyState from '../../../components/admin/EmptyState'
import { IconInbox, IconSearch, IconX } from '../../../components/icons'

const PAGE_SIZE = 20

export default function OrdersView() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()

  const search = params.get('q') ?? ''
  const status = (params.get('status') as OrderStatus | null) ?? null
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

  const list = useLoad(() => orderAdmin.orders.list({ search, status, page, pageSize: PAGE_SIZE }), [search, status, page])

  const hasFilters = !!search || !!status

  return (
    <>
      <div className="page-head">
        <div>
          <span className="eyebrow">Продажи</span>
          <h1>Заказы</h1>
          <p>{list.data ? `${list.data.total} заказов` : 'Все заказы площадки'}</p>
        </div>
      </div>

      <div className="toolbar">
        <div className="control toolbar-search">
          <IconSearch />
          <input className="input" placeholder="Поиск по номеру или клиенту" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
          {searchInput && (
            <button type="button" className="input-affix" onClick={() => setSearchInput('')} aria-label="Очистить">
              <IconX />
            </button>
          )}
        </div>
        <select className="select" value={status ?? ''} onChange={(e) => patch({ status: e.target.value || null, page: null })}>
          <option value="">Все статусы</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {ORDER_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      {list.error && <Alert kind="error">{list.error}</Alert>}

      <div className="card">
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Заказ</th>
                <th>Клиент</th>
                <th className="num">Позиций</th>
                <th className="num">Сумма</th>
                <th>Статус</th>
                <th>Создан</th>
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
                list.data?.items.map((o) => (
                  <tr key={o.id} className="is-link" onClick={() => navigate(`/admin/orders/${o.id}`)}>
                    <td className="mono">{o.number}</td>
                    <td>
                      <span className="product-cell-text">
                        <span className="product-cell-name">{o.customerName}</span>
                        <span className="product-cell-sub">{o.customerEmail}</span>
                      </span>
                    </td>
                    <td className="num">{o.itemsCount}</td>
                    <td className="num">{formatMoney(o.total)}</td>
                    <td>
                      <span className={`pill ${ORDER_STATUS_PILL[o.status]}`}>{ORDER_STATUS_LABELS[o.status]}</span>
                    </td>
                    <td className="muted">{formatDateTime(o.createdAt)}</td>
                    <td className="actions" />
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {!list.loading && list.data?.items.length === 0 && (
          <EmptyState
            icon={<IconInbox />}
            title={hasFilters ? 'Ничего не найдено' : 'Заказов пока нет'}
            text={hasFilters ? 'Попробуйте изменить фильтры или поисковый запрос.' : 'Здесь появятся заказы покупателей.'}
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
