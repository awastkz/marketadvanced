import type { OrderStatus } from '../api/admin/orderTypes'

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  New: 'Новый',
  Confirmed: 'Подтверждён',
  Processing: 'В обработке',
  Shipped: 'Отправлен',
  Delivered: 'Доставлен',
  Cancelled: 'Отменён',
}

export const ORDER_STATUS_PILL: Record<OrderStatus, string> = {
  New: 'pill-info',
  Confirmed: 'pill-info',
  Processing: 'pill-warning',
  Shipped: 'pill-warning',
  Delivered: 'pill-success',
  Cancelled: 'pill-danger',
}
