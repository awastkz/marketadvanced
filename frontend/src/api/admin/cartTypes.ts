// DTO админки корзин. Контракт с бэкендом — см. src/api/admin/cart.ts

export interface Paged<T> {
  items: T[]
  total: number
}

export interface CartListItem {
  id: number
  ownerLabel: string
  userId: number | null
  guestId: string | null
  itemsCount: number
  totalQuantity: number
  totalAmount: number
  updatedAt: string
  expiresAt: string | null
}

export interface CartItemDetails {
  id: number
  variantId: number
  productName: string
  sku: string
  price: number
  quantity: number
  lineTotal: number
}

export interface CartDetails {
  id: number
  ownerLabel: string
  userId: number | null
  guestId: string | null
  items: CartItemDetails[]
  updatedAt: string
  expiresAt: string | null
}

export interface CartQuery {
  search?: string
  onlyNonEmpty?: boolean
  page: number
  pageSize: number
}

export interface CartAdminApi {
  carts: {
    list(query: CartQuery): Promise<Paged<CartListItem>>
    get(id: number): Promise<CartDetails>
    updateItemQuantity(cartId: number, itemId: number, quantity: number): Promise<CartDetails>
    removeItem(cartId: number, itemId: number): Promise<CartDetails>
    clear(cartId: number): Promise<void>
  }
}
