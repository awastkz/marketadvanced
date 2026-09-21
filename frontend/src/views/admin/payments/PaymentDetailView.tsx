import { useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { paymentAdmin } from '../../../api/admin/payment'
import { useLoad } from '../../../utils/useLoad'
import { PAYMENT_METHOD_LABELS, PAYMENT_STATUS_LABELS, PAYMENT_STATUS_PILL } from '../../../utils/paymentStatus'
import { errorMessage, formatDateTime, formatMoney } from '../../../utils/format'
import { toast } from '../../../stores/toast'
import Alert from '../../../components/Alert'
import { IconChevronLeft, IconRotateCcw } from '../../../components/icons'

export default function PaymentDetailView() {
  const { id } = useParams()
  const paymentId = Number(id)

  const payment = useLoad(() => paymentAdmin.payments.get(paymentId), [paymentId])
  const [amount, setAmount] = useState('')
  const [reason, setReason] = useState('')
  const [refunding, setRefunding] = useState(false)
  const [refundError, setRefundError] = useState<string | null>(null)
  const [markingFailed, setMarkingFailed] = useState(false)

  async function submitRefund(e: FormEvent) {
    e.preventDefault()
    const value = Number(amount)
    if (!(value > 0)) {
      setRefundError('Укажите сумму больше нуля')
      return
    }
    setRefunding(true)
    setRefundError(null)
    try {
      const updated = await paymentAdmin.payments.refund(paymentId, value, reason)
      payment.setData(updated)
      setAmount('')
      setReason('')
      toast.success('Возврат оформлен')
    } catch (err) {
      setRefundError(errorMessage(err))
    } finally {
      setRefunding(false)
    }
  }

  async function markFailed() {
    setMarkingFailed(true)
    try {
      const updated = await paymentAdmin.payments.markFailed(paymentId, 'Отмечено вручную в админке')
      payment.setData(updated)
      toast.success('Платёж отмечен как неудачный')
    } catch (err) {
      toast.error(errorMessage(err))
    } finally {
      setMarkingFailed(false)
    }
  }

  if (payment.error) {
    return (
      <>
        <BackLink />
        <Alert kind="error">{payment.error}</Alert>
      </>
    )
  }

  const p = payment.data
  const refunded = p?.refunds.reduce((s, r) => s + r.amount, 0) ?? 0
  const canRefund = p && (p.status === 'Succeeded' || p.status === 'PartiallyRefunded')
  const canMarkFailed = p && p.status === 'Pending'

  return (
    <>
      <BackLink />
      <div className="page-head">
        <div>
          <span className="eyebrow">Платёж</span>
          <h1>{p ? `Платёж №${p.id}` : '…'}</h1>
          {p && <p>Заказ {p.orderNumber} · создан {formatDateTime(p.createdAt)}</p>}
        </div>
        <div className="page-actions">
          {p && <span className={`pill ${PAYMENT_STATUS_PILL[p.status]}`}>{PAYMENT_STATUS_LABELS[p.status]}</span>}
          {canMarkFailed && (
            <button type="button" className="btn btn-ghost is-danger" onClick={markFailed} disabled={markingFailed}>
              {markingFailed ? 'Отмечаем…' : 'Отметить неудачным'}
            </button>
          )}
        </div>
      </div>

      <div className="edit-grid">
        <div className="edit-main">
          <section className="card">
            <div className="form-section">
              <h2>Детали платежа</h2>
              <dl className="kv">
                <div>
                  <dt>Сумма</dt>
                  <dd>{formatMoney(p?.amount)}</dd>
                </div>
                <div>
                  <dt>Способ оплаты</dt>
                  <dd>{p ? PAYMENT_METHOD_LABELS[p.method] : '—'}</dd>
                </div>
                <div>
                  <dt>Провайдер</dt>
                  <dd>{p?.provider ?? '—'}</dd>
                </div>
                <div>
                  <dt>ID транзакции</dt>
                  <dd className="mono">{p?.transactionId ?? '—'}</dd>
                </div>
              </dl>
            </div>
          </section>

          {p && p.refunds.length > 0 && (
            <section className="card">
              <div className="form-section">
                <h2>Возвраты</h2>
                <div className="table-wrap">
                  <table className="table">
                    <thead>
                      <tr>
                        <th className="num">Сумма</th>
                        <th>Причина</th>
                        <th>Дата</th>
                      </tr>
                    </thead>
                    <tbody>
                      {p.refunds.map((r) => (
                        <tr key={r.id}>
                          <td className="num">{formatMoney(r.amount)}</td>
                          <td>{r.reason ?? '—'}</td>
                          <td className="muted">{formatDateTime(r.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="muted small">Возвращено {formatMoney(refunded)} из {formatMoney(p.amount)}</p>
              </div>
            </section>
          )}
        </div>

        <aside className="edit-side">
          {canRefund && (
            <section className="card">
              <div className="form-section">
                <h2>Оформить возврат</h2>
                <form onSubmit={submitRefund}>
                  {refundError && <Alert kind="error">{refundError}</Alert>}
                  <div className="field">
                    <label htmlFor="refund-amount">Сумма</label>
                    <input id="refund-amount" type="number" min={1} max={(p?.amount ?? 0) - refunded} className="input" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder={String((p?.amount ?? 0) - refunded)} />
                    <span className="field-hint">Доступно к возврату: {formatMoney((p?.amount ?? 0) - refunded)}</span>
                  </div>
                  <div className="field">
                    <label htmlFor="refund-reason">Причина</label>
                    <textarea id="refund-reason" className="input textarea" rows={2} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Например, возврат товара" />
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={refunding}>
                    <IconRotateCcw />
                    {refunding ? 'Оформляем…' : 'Оформить возврат'}
                  </button>
                </form>
              </div>
            </section>
          )}
        </aside>
      </div>
    </>
  )
}

function BackLink() {
  return (
    <Link to="/admin/payments" className="back-link">
      <IconChevronLeft />
      К списку платежей
    </Link>
  )
}
