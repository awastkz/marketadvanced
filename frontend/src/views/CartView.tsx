import { useState } from 'react'
import { Link } from 'react-router-dom'
import AppShell from '../components/AppShell'
import Alert from '../components/Alert'
import EmptyState from '../components/admin/EmptyState'
import ConfirmDialog from '../components/admin/ConfirmDialog'
import { useCartStore, cartItemCount } from '../stores/cart'
import { toast } from '../stores/toast'
import { errorMessage, formatMoney } from '../utils/format'
import { IconBox, IconCart, IconMinus, IconPlus, IconTrash } from '../components/icons'

export default function CartView() {
  const cart = useCartStore((s) => s.cart)
  const loading = useCartStore((s) => s.loading)
  const error = useCartStore((s) => s.error)
  const load = useCartStore((s) => s.load)
  const setQuantity = useCartStore((s) => s.setQuantity)
  const removeItem = useCartStore((s) => s.removeItem)
  const clear = useCartStore((s) => s.clear)

  const [busyVariantId, setBusyVariantId] = useState<number | null>(null)
  const [confirmClear, setConfirmClear] = useState(false)

  const items = cart?.items ?? []
  const count = cartItemCount(cart)

  async function changeQuantity(variantId: number, next: number) {
    setBusyVariantId(variantId)
    try {
      await setQuantity(variantId, next)
    } catch (e) {
      toast.error(errorMessage(e))
    } finally {
      setBusyVariantId(null)
    }
  }

  async function onRemove(variantId: number) {
    setBusyVariantId(variantId)
    try {
      await removeItem(variantId)
      toast.success('Товар убран из корзины')
    } catch (e) {
      toast.error(errorMessage(e))
    } finally {
      setBusyVariantId(null)
    }
  }

  async function onClear() {
    await clear()
    toast.success('Корзина очищена')
  }

  return (
    <AppShell>
      <div className="page-head">
        <div>
          <span className="eyebrow">Покупки</span>
          <h1>Корзина</h1>
          {cart && <p>{count > 0 ? `Товаров: ${count}` : 'Корзина пуста'}</p>}
        </div>
        <div className="page-actions">
          <Link to="/catalog" className="btn btn-ghost">
            В каталог
          </Link>
        </div>
      </div>

      <div className="cart-grid">
        <div className="cart-main">
          {error && !cart && (
            <Alert kind="error">
              {error}{' '}
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => load()}>
                Повторить
              </button>
            </Alert>
          )}

          {loading && !cart && (
            <div className="card">
              <div className="card-body cart-items">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div className="cart-item" key={i}>
                    <span className="skeleton" style={{ width: '100%', height: 44 }} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {cart && items.length === 0 && (
            <div className="card">
              <div className="card-body">
                <EmptyState
                  icon={<IconCart />}
                  title="Корзина пуста"
                  text="Загляните в каталог и выберите что-нибудь — товар сразу появится здесь."
                  action={
                    <Link to="/catalog" className="btn btn-primary">
                      Перейти в каталог
                    </Link>
                  }
                />
              </div>
            </div>
          )}

          {cart && items.length > 0 && (
            <div className="card">
              <div className="card-body cart-items">
                {items.map((item) => {
                  const busy = busyVariantId === item.variantId
                  return (
                    <div className="cart-item" key={item.variantId}>
                      <span className="cart-item-icon">
                        <IconBox />
                      </span>
                      <div className="cart-item-info">
                        <div className="cart-item-name">{item.productName}</div>
                        <div className="cart-item-sku mono muted">{item.sku}</div>
                      </div>
                      <div className="cart-item-price">{formatMoney(item.price)}</div>
                      <div className="qty-stepper">
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => changeQuantity(item.variantId, item.quantity - 1)}
                          aria-label="Уменьшить количество"
                        >
                          <IconMinus />
                        </button>
                        <span className="qty-value">{item.quantity}</span>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => changeQuantity(item.variantId, item.quantity + 1)}
                          aria-label="Увеличить количество"
                        >
                          <IconPlus />
                        </button>
                      </div>
                      <div className="cart-item-total">{formatMoney(item.lineTotal)}</div>
                      <button
                        type="button"
                        className="btn btn-ghost btn-icon btn-sm is-danger"
                        title="Убрать из корзины"
                        aria-label="Убрать из корзины"
                        disabled={busy}
                        onClick={() => onRemove(item.variantId)}
                      >
                        <IconTrash />
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        <aside className="cart-summary">
          <div className="card">
            <div className="card-body">
              <p className="card-title">Итого</p>
              <dl className="kv">
                <div>
                  <dt>Товаров</dt>
                  <dd>{count}</dd>
                </div>
                <div>
                  <dt>Сумма</dt>
                  <dd>{formatMoney(cart?.total ?? 0)}</dd>
                </div>
              </dl>

              <button type="button" className="btn btn-primary btn-block cart-checkout-btn" disabled>
                Оформить заказ
                <span className="badge">Скоро</span>
              </button>

              <button
                type="button"
                className="btn btn-ghost btn-block is-danger"
                disabled={items.length === 0}
                onClick={() => setConfirmClear(true)}
              >
                <IconTrash />
                Очистить корзину
              </button>

              <Link to="/catalog" className="tile-meta cart-back-link">
                ← Продолжить покупки
              </Link>
            </div>
          </div>
        </aside>
      </div>

      <ConfirmDialog
        open={confirmClear}
        title="Очистить корзину?"
        text="Все товары будут убраны из корзины. Это действие нельзя отменить."
        confirmLabel="Очистить"
        onConfirm={onClear}
        onClose={() => setConfirmClear(false)}
      />
    </AppShell>
  )
}
