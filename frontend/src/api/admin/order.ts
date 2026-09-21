/**
 * Админ-API заказов.
 *
 * Ожидаемые эндпоинты бэкенда:
 *   GET  /api/admin/orders?search=&status=&page=&pageSize=  -> Paged<OrderListItem>
 *   GET  /api/admin/orders/{id}                              -> OrderDetails
 *   PUT  /api/admin/orders/{id}/status  { status, comment }  -> OrderDetails
 *   PUT  /api/admin/orders/{id}/cancel  { comment }          -> OrderDetails
 *
 * Для просмотра без бэкенда: VITE_ADMIN_MOCK=true в .env.local
 */

import { http } from '../http'
import type { OrderAdminApi, OrderDetails, OrderListItem, OrderQuery, Paged } from './orderTypes'
import { mockOrderApi } from './orderMock'

const httpOrderApi: OrderAdminApi = {
  orders: {
    list: (q: OrderQuery) =>
      http
        .get<Paged<OrderListItem>>('/api/admin/orders', {
          params: { search: q.search || undefined, status: q.status ?? undefined, page: q.page, pageSize: q.pageSize },
        })
        .then((r) => r.data),
    get: (id) => http.get<OrderDetails>(`/api/admin/orders/${id}`).then((r) => r.data),
    updateStatus: (id, status, comment) => http.put<OrderDetails>(`/api/admin/orders/${id}/status`, { status, comment }).then((r) => r.data),
    cancel: (id, comment) => http.put<OrderDetails>(`/api/admin/orders/${id}/cancel`, { comment }).then((r) => r.data),
  },
}

export const orderAdmin: OrderAdminApi = import.meta.env.VITE_ADMIN_MOCK === 'true' ? mockOrderApi : httpOrderApi
