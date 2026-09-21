import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { orderAdmin } from '../../../api/admin/order'
import { ORDER_STATUSES, type OrderStatus } from '../../../api/admin/orderTypes'
import { useLoad } from '../../../utils/useLoad'
import { ORDER_STATUS_LABELS, ORDER_STATUS_PILL } from '../../../utils/orderStatus'
import { errorMessage, formatDateTime, formatMoney } from '../../../utils/format'
import { toast } from '../../../stores/toast'
import Alert from '../../../components/Alert'
import ConfirmDialog from '../../../components/admin/ConfirmDialog'
import { IconChevronLeft, IconX } from '../../../components/icons'

export default function OrderDetailView() {
  const { id } = useParams()
  const orderId = Number(id)

  const order = useLoad(() => orderAdmin.orders.get(orderId), [orderId])
  const [nextStatus, setNextStatus] = useState<OrderStatus | ''>('')
  const [comment, setComment] = useState('')
  const [updating, setUpdating] = useState(false)
  const [updateError, setUpdateError] = useState<string | null>(null)
  const [confirmCancel, setConfirmCancel] = useState(false)

  async function applyStatus() {
    if (!nextStatus) return
    setUpdating(true)
    setUpdateError(null)
    try {
      const updated = await orderAdmin.orders.updateStatus(orderId, nextStatus, comment)
      order.setData(updated)
      setNextStatus('')
      setComment('')
      toast.success('Статус обновлён')
    } catch (err) {
      setUpdateError(errorMessage(err))
    } finally {
      setUpdating(false)
    }
  }

  async function onCancel() {
    const updated = await orderAdmin.orders.cancel(orderId, comment)
    order.setData(updated)
    setComment('')
    toast.success('Заказ отменён')
  }

  if (order.error) {
    return (
      <>
        <BackLink />
        <Alert kind="error">{order.error}</Alert>
      </>
    )
  }

  const o = order.data
  const canChangeStatus = o && o.status !== 'Cancelled'
  const canCancel = o && o.status !== 'Delivered' && o.status !== 'Cancelled'

  return (
    <>
      <BackLink />
      <div className="page-head">
        <div>
          <span className="eyebrow">Заказ</span>
          <h1>{o ? o.number : '…'}</h1>
          {o && <p>Создан {formatDateTime(o.createdAt)}</p>}
        </div>
        <div className="page-actions">
          {o && <span className={`pill ${ORDER_STATUS_PILL[o.status]}`}>{ORDER_STATUS_LABELS[o.status]}</span>}
          {canCancel && (
            <button type="button" className="btn btn-ghost is-danger" onClick={() => setConfirmCancel(true)}>
              <IconX />
              Отменить заказ
            </button>
          )}
        </div>
      </div>

      <div className="edit-grid">
        <div className="edit-main">
          <section className="card">
            <div className="form-section">
              <h2>Товары</h2>
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Товар</th>
                      <th>SKU</th>
                      <th className="num">Цена</th>
                      <th className="num">Кол-во</th>
                      <th className="num">Сумма</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.loading &&
                      Array.from({ length: 3 }).map((_, i) => (
                        <tr key={i}>
                          <td colSpan={5}>
                            <span className="skeleton" />
                          </td>
                        </tr>
                      ))}
                    {o?.items.map((item) => (
                      <tr key={item.id}>
                        <td>{item.productName}</td>
                        <td className="mono muted">{item.sku}</td>
                        <td className="num">{formatMoney(item.price)}</td>
                        <td className="num">{item.quantity}</td>
                        <td className="num">{formatMoney(item.lineTotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                  {o && (
                    <tfoot>
                      <tr>
                        <td colSpan={4} className="num muted">
                          Товары
                        </td>
                        <td className="num">{formatMoney(o.subtotal)}</td>
                      </tr>
                      <tr>
                        <td colSpan={4} className="num muted">
                          Доставка
                        </td>
                        <td className="num">{formatMoney(o.shippingCost)}</td>
                      </tr>
                      <tr>
                        <td colSpan={4} className="num" style={{ fontWeight: 600 }}>
                          Итого
                        </td>
                        <td className="num" style={{ fontWeight: 600 }}>
                          {formatMoney(o.total)}
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>
          </section>

          {o && (
            <section className="card">
              <div className="form-section">
                <h2>История статусов</h2>
                <div className="attr-rows">
                  {o.history.map((h, i) => (
                    <div key={i} className="field-row" style={{ alignItems: 'center' }}>
                      <span className={`pill ${ORDER_STATUS_PILL[h.status]}`}>{ORDER_STATUS_LABELS[h.status]}</span>
                      <span className="muted small">{formatDateTime(h.changedAt)}</span>
                      {h.comment && <span className="small">{h.comment}</span>}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}
        </div>

        <aside className="edit-side">
          <section className="card">
            <div className="form-section">
              <h2>Клиент</h2>
              <dl className="kv">
                <div>
                  <dt>Имя</dt>
                  <dd>{o?.customerName ?? '—'}</dd>
                </div>
                <div>
                  <dt>Email</dt>
                  <dd>{o?.customerEmail ?? '—'}</dd>
                </div>
                <div>
                  <dt>Телефон</dt>
                  <dd>{o?.customerPhone ?? '—'}</dd>
                </div>
                <div>
                  <dt>Адрес</dt>
                  <dd>{o?.shippingAddress ?? '—'}</dd>
                </div>
              </dl>
              {o?.comment && <p className="muted small">Комментарий: {o.comment}</p>}
            </div>
          </section>

          {canChangeStatus && (
            <section className="card">
              <div className="form-section">
                <h2>Изменить статус</h2>
                {updateError && <Alert kind="error">{updateError}</Alert>}
                <div className="field">
                  <label htmlFor="next-status">Новый статус</label>
                  <select id="next-status" className="select" value={nextStatus} onChange={(e) => setNextStatus(e.target.value as OrderStatus)}>
                    <option value="">Выберите статус</option>
                    {ORDER_STATUSES.filter((s) => s !== 'Cancelled' && s !== o?.status).map((s) => (
                      <option key={s} value={s}>
                        {ORDER_STATUS_LABELS[s]}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="status-comment">Комментарий</label>
                  <textarea id="status-comment" className="input textarea" rows={2} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Необязательно" />
                </div>
                <button type="button" className="btn btn-primary" onClick={applyStatus} disabled={!nextStatus || updating}>
                  {updating ? 'Обновляем…' : 'Обновить статус'}
                </button>
              </div>
            </section>
          )}
        </aside>
      </div>

      <ConfirmDialog
        open={confirmCancel}
        title="Отменить заказ?"
        text="Статус заказа изменится на «Отменён». Это действие нельзя отменить."
        confirmLabel="Отменить заказ"
        onConfirm={onCancel}
        onClose={() => setConfirmCancel(false)}
      />
    </>
  )
}

function BackLink() {
  return (
    <Link to="/admin/orders" className="back-link">
      <IconChevronLeft />
      К списку заказов
    </Link>
  )
}
