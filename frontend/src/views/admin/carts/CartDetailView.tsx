import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { cartAdmin } from '../../../api/admin/cart'
import { useLoad } from '../../../utils/useLoad'
import { errorMessage, formatDateTime, formatMoney } from '../../../utils/format'
import { toast } from '../../../stores/toast'
import Alert from '../../../components/Alert'
import ConfirmDialog from '../../../components/admin/ConfirmDialog'
import { IconChevronLeft, IconTrash } from '../../../components/icons'

export default function CartDetailView() {
  const { id } = useParams()
  const cartId = Number(id)
  const navigate = useNavigate()

  const cart = useLoad(() => cartAdmin.carts.get(cartId), [cartId])
  const [confirmClear, setConfirmClear] = useState(false)
  const [busyItem, setBusyItem] = useState<number | null>(null)

  async function setQuantity(itemId: number, quantity: number) {
    if (quantity < 1) return
    setBusyItem(itemId)
    try {
      const updated = await cartAdmin.carts.updateItemQuantity(cartId, itemId, quantity)
      cart.setData(updated)
    } catch (err) {
      toast.error(errorMessage(err))
    } finally {
      setBusyItem(null)
    }
  }

  async function removeItem(itemId: number) {
    setBusyItem(itemId)
    try {
      const updated = await cartAdmin.carts.removeItem(cartId, itemId)
      cart.setData(updated)
      toast.success('Товар убран из корзины')
    } catch (err) {
      toast.error(errorMessage(err))
    } finally {
      setBusyItem(null)
    }
  }

  async function onClear() {
    await cartAdmin.carts.clear(cartId)
    toast.success('Корзина очищена')
    navigate('/admin/carts', { replace: true })
  }

  if (cart.error) {
    return (
      <>
        <BackLink />
        <Alert kind="error">{cart.error}</Alert>
      </>
    )
  }

  const c = cart.data
  const total = c?.items.reduce((s, i) => s + i.lineTotal, 0) ?? 0

  return (
    <>
      <BackLink />
      <div className="page-head">
        <div>
          <span className="eyebrow">Корзина</span>
          <h1>{c ? c.ownerLabel : '…'}</h1>
          {c && <p>Обновлена {formatDateTime(c.updatedAt)}</p>}
        </div>
        <div className="page-actions">
          <button type="button" className="btn btn-ghost is-danger" onClick={() => setConfirmClear(true)} disabled={!c || c.items.length === 0}>
            <IconTrash />
            Очистить корзину
          </button>
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Товар</th>
                <th>SKU</th>
                <th className="num">Цена</th>
                <th className="num">Кол-во</th>
                <th className="num">Сумма</th>
                <th className="actions" />
              </tr>
            </thead>
            <tbody>
              {cart.loading &&
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6}>
                      <span className="skeleton" />
                    </td>
                  </tr>
                ))}
              {c?.items.map((item) => (
                <tr key={item.id}>
                  <td>{item.productName}</td>
                  <td className="mono muted">{item.sku}</td>
                  <td className="num">{formatMoney(item.price)}</td>
                  <td className="num">
                    <input
                      type="number"
                      min={1}
                      className="input input-sm num"
                      style={{ width: 72 }}
                      value={item.quantity}
                      disabled={busyItem === item.id}
                      onChange={(e) => setQuantity(item.id, Number(e.target.value))}
                    />
                  </td>
                  <td className="num">{formatMoney(item.lineTotal)}</td>
                  <td className="actions">
                    <button type="button" className="btn btn-ghost btn-icon btn-sm is-danger" title="Убрать" disabled={busyItem === item.id} onClick={() => removeItem(item.id)}>
                      <IconTrash />
                    </button>
                  </td>
                </tr>
              ))}
              {!cart.loading && c && c.items.length === 0 && (
                <tr>
                  <td colSpan={6} className="muted">
                    Корзина пуста
                  </td>
                </tr>
              )}
            </tbody>
            {c && c.items.length > 0 && (
              <tfoot>
                <tr>
                  <td colSpan={4} className="num" style={{ fontWeight: 600 }}>
                    Итого
                  </td>
                  <td className="num" style={{ fontWeight: 600 }}>
                    {formatMoney(total)}
                  </td>
                  <td />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      <ConfirmDialog
        open={confirmClear}
        title="Очистить корзину?"
        text="Все товары будут убраны из корзины покупателя. Это действие нельзя отменить."
        onConfirm={onClear}
        onClose={() => setConfirmClear(false)}
      />
    </>
  )
}

function BackLink() {
  return (
    <Link to="/admin/carts" className="back-link">
      <IconChevronLeft />
      К списку корзин
    </Link>
  )
}
