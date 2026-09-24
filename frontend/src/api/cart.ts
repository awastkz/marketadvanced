import { http } from './http'

export interface CartItem {
  id: number
  variantId: number
  productName: string
  sku: string
  price: number
  quantity: number
  lineTotal: number
}

export interface Cart {
  id: number
  items: CartItem[]
  total: number
}

export function getCart() {
  return http.get<Cart>('/api/cart')
}

export function addItem(variantId: number, quantity: number) {
  return http.post<void>('/api/cart/items', { variantId, quantity })
}

// Бэкенд удаляет позицию целиком по variantId (query-параметр), отдельного
// эндпоинта «изменить количество» нет — см. cart.ts::setQuantity.
export function removeItem(variantId: number) {
  return http.delete<void>('/api/cart/items', { params: { variantId } })
}

export function clearCart() {
  return http.delete<void>('/api/cart/clear-items')
}
