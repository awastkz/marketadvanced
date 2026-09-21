import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { paymentAdmin } from '../../../api/admin/payment'
import { PAYMENT_METHODS, PAYMENT_STATUSES, type PaymentMethod, type PaymentStatus } from '../../../api/admin/paymentTypes'
import { useLoad } from '../../../utils/useLoad'
import { PAYMENT_METHOD_LABELS, PAYMENT_STATUS_LABELS, PAYMENT_STATUS_PILL } from '../../../utils/paymentStatus'
import { formatDateTime, formatMoney } from '../../../utils/format'
import Alert from '../../../components/Alert'
import Pagination from '../../../components/admin/Pagination'
import EmptyState from '../../../components/admin/EmptyState'
import { IconCard, IconSearch, IconX } from '../../../components/icons'

const PAGE_SIZE = 20

export default function PaymentsView() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()

  const search = params.get('q') ?? ''
  const status = (params.get('status') as PaymentStatus | null) ?? null
  const method = (params.get('method') as PaymentMethod | null) ?? null
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

  const list = useLoad(() => paymentAdmin.payments.list({ search, status, method, page, pageSize: PAGE_SIZE }), [search, status, method, page])

  const hasFilters = !!search || !!status || !!method

  return (
    <>
      <div className="page-head">
        <div>
          <span className="eyebrow">Продажи</span>
          <h1>Платежи</h1>
          <p>{list.data ? `${list.data.total} платежей` : 'Все платежи по заказам'}</p>
        </div>
      </div>

      <div className="toolbar">
        <div className="control toolbar-search">
          <IconSearch />
          <input className="input" placeholder="Поиск по номеру заказа" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
          {searchInput && (
            <button type="button" className="input-affix" onClick={() => setSearchInput('')} aria-label="Очистить">
              <IconX />
            </button>
          )}
        </div>
        <select className="select" value={status ?? ''} onChange={(e) => patch({ status: e.target.value || null, page: null })}>
          <option value="">Все статусы</option>
          {PAYMENT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {PAYMENT_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        <select className="select" value={method ?? ''} onChange={(e) => patch({ method: e.target.value || null, page: null })}>
          <option value="">Все способы</option>
          {PAYMENT_METHODS.map((m) => (
            <option key={m} value={m}>
              {PAYMENT_METHOD_LABELS[m]}
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
                <th className="num">Сумма</th>
                <th>Способ</th>
                <th>Статус</th>
                <th>Создан</th>
                <th className="actions" />
              </tr>
            </thead>
            <tbody>
              {list.loading &&
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6}>
                      <span className="skeleton" />
                    </td>
                  </tr>
                ))}
              {!list.loading &&
                list.data?.items.map((p) => (
                  <tr key={p.id} className="is-link" onClick={() => navigate(`/admin/payments/${p.id}`)}>
                    <td className="mono">{p.orderNumber}</td>
                    <td className="num">{formatMoney(p.amount)}</td>
                    <td>{PAYMENT_METHOD_LABELS[p.method]}</td>
                    <td>
                      <span className={`pill ${PAYMENT_STATUS_PILL[p.status]}`}>{PAYMENT_STATUS_LABELS[p.status]}</span>
                    </td>
                    <td className="muted">{formatDateTime(p.createdAt)}</td>
                    <td className="actions" />
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {!list.loading && list.data?.items.length === 0 && (
          <EmptyState
            icon={<IconCard />}
            title={hasFilters ? 'Ничего не найдено' : 'Платежей пока нет'}
            text={hasFilters ? 'Попробуйте изменить фильтры или поисковый запрос.' : 'Здесь появятся платежи по заказам.'}
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
