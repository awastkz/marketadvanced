import type { ProductListItem } from '../api/admin/types'
import { formatMoney } from '../utils/format'
import { IconImage } from './icons'

interface ProductCardProps {
  product: ProductListItem
  onOpen: (id: number) => void
}

/** Карточка товара для публичного каталога и подборки на главной. Клик открывает ProductQuickView. */
export default function ProductCard({ product, onOpen }: ProductCardProps) {
  const outOfStock = product.totalStock === 0

  return (
    <button type="button" className="product-card" onClick={() => onOpen(product.id)}>
      <span className="product-card-image">
        {product.imageUrl ? <img src={product.imageUrl} alt="" /> : <IconImage />}
        {outOfStock && <span className="badge product-card-badge">Нет в наличии</span>}
      </span>
      <span className="product-card-body">
        <span className="product-card-category">{product.categoryName}</span>
        <span className="product-card-name">{product.name}</span>
        <span className="product-card-price">
          {product.variantsCount > 1 ? 'от ' : ''}
          {formatMoney(product.minPrice)}
        </span>
      </span>
    </button>
  )
}
