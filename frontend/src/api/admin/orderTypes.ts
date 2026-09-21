// DTO админки заказов. Контракт с бэкендом — см. src/api/admin/order.ts

export interface Paged<T> {
  items: T[]
  total: number
}

export const ORDER_STATUSES = ['New', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'] as const
export type OrderStatus = (typeof ORDER_STATUSES)[number]

export interface OrderListItem {
  id: number
  number: string
  customerName: string
  customerEmail: string
  status: OrderStatus
  itemsCount: number
  total: number
  createdAt: string
  updatedAt: string | null
}

export interface OrderItemDetails {
  id: number
  variantId: number
  productName: string
  sku: string
  price: number
  quantity: number
  lineTotal: number
}

export interface OrderStatusEvent {
  status: OrderStatus
  changedAt: string
  comment: string | null
}

export interface OrderDetails {
  id: number
  number: string
  status: OrderStatus
  customerName: string
  customerEmail: string
  customerPhone: string | null
  shippingAddress: string
  comment: string | null
  items: OrderItemDetails[]
  subtotal: number
  shippingCost: number
  total: number
  history: OrderStatusEvent[]
  createdAt: string
  updatedAt: string | null
}

export interface OrderQuery {
  search?: string
  status?: OrderStatus | null
  page: number
  pageSize: number
}

export interface OrderAdminApi {
  orders: {
    list(query: OrderQuery): Promise<Paged<OrderListItem>>
    get(id: number): Promise<OrderDetails>
    updateStatus(id: number, status: OrderStatus, comment?: string): Promise<OrderDetails>
    cancel(id: number, comment?: string): Promise<OrderDetails>
  }
}
