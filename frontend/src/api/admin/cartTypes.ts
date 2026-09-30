// DTO админки корзин. Контракт с бэкендом — см. src/api/admin/cart.ts

export interface Paged<T> {
  items: T[]
  total: number
}

export interface CartListItem {
  id: string
  ownerLabel: string
  userId: string | null
  guestId: string | null
  itemsCount: number
  totalQuantity: number
  totalAmount: number
  updatedAt: string
  expiresAt: string | null
}

export interface CartItemDetails {
  id: string
  variantId: string
  productName: string
  sku: string
  price: number
  quantity: number
  lineTotal: number
}

export interface CartDetails {
  id: string
  ownerLabel: string
  userId: string | null
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
    get(id: string): Promise<CartDetails>
    updateItemQuantity(cartId: string, itemId: string, quantity: number): Promise<CartDetails>
    removeItem(cartId: string, itemId: string): Promise<CartDetails>
    clear(cartId: string): Promise<void>
  }
}
