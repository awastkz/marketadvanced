import { useEffect, useState } from 'react'
import Modal from './admin/Modal'
import Alert from './Alert'
import { catalogAdmin } from '../api/admin/catalog'
import type { ProductDetails } from '../api/admin/types'
import { useCartStore } from '../stores/cart'
import { toast } from '../stores/toast'
import { errorMessage, formatMoney } from '../utils/format'
import { IconCart, IconImage } from './icons'

interface ProductQuickViewProps {
  productId: number | null
  onClose: () => void
}

/**
 * Модалка «товар»: открывается по клику на карточку, показывает варианты и
 * позволяет добавить любой из них в корзину (по 1 шт., количество потом
 * меняется на странице корзины).
 */
export default function ProductQuickView({ productId, onClose }: ProductQuickViewProps) {
  const [product, setProduct] = useState<ProductDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busyVariantId, setBusyVariantId] = useState<number | null>(null)
  const addItem = useCartStore((s) => s.addItem)

  useEffect(() => {
    if (productId == null) {
      setProduct(null)
      return
    }

    let alive = true
    setLoading(true)
    setError(null)
    catalogAdmin.products
      .get(productId)
      .then((p) => alive && setProduct(p))
      .catch((e) => alive && setError(errorMessage(e)))
      .finally(() => alive && setLoading(false))

    return () => {
      alive = false
    }
  }, [productId])

  async function onAdd(variantId: number) {
    setBusyVariantId(variantId)
    try {
      await addItem(variantId, 1)
      toast.success('Товар добавлен в корзину')
    } catch (e) {
      toast.error(errorMessage(e))
    } finally {
      setBusyVariantId(null)
    }
  }

  const mainImage = product?.images.find((i) => i.isMain) ?? product?.images[0]

  return (
    <Modal open={productId != null} title={product?.name ?? 'Товар'} onClose={onClose} size="lg">
      {loading && <span className="skeleton" style={{ display: 'block', height: 220 }} />}
      {error && <Alert kind="error">{error}</Alert>}

      {product && !loading && (
        <div className="quickview">
          <div className="quickview-image">{mainImage ? <img src={mainImage.url} alt="" /> : <IconImage />}</div>

          <div className="quickview-body">
            {product.description && <p className="quickview-description">{product.description}</p>}

            <div className="quickview-variants">
              {product.variants.map((v) => {
                const disabled = !v.isActive || v.stock <= 0 || v.id == null
                const busy = v.id != null && busyVariantId === v.id
                return (
                  <div className="quickview-variant" key={v.id ?? v.sku}>
                    <div className="quickview-variant-info">
                      <span className="quickview-variant-name">{v.name || v.sku}</span>
                      <span className="mono muted">{v.sku}</span>
                    </div>
                    <span className="quickview-variant-price">{formatMoney(v.price)}</span>
                    <span className={`pill ${v.stock > 0 ? 'pill-success' : 'pill-danger'}`}>
                      {v.stock > 0 ? `В наличии: ${v.stock}` : 'Нет в наличии'}
                    </span>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      disabled={disabled || busy}
                      onClick={() => v.id != null && onAdd(v.id)}
                    >
                      <IconCart />
                      {busy ? 'Добавляем…' : 'В корзину'}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </Modal>
  )
}
