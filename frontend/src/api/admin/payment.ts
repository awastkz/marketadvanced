/**
 * Админ-API платежей.
 *
 * Ожидаемые эндпоинты бэкенда:
 *   GET  /api/admin/payments?search=&status=&method=&page=&pageSize=  -> Paged<PaymentListItem>
 *   GET  /api/admin/payments/{id}                                      -> PaymentDetails
 *   POST /api/admin/payments/{id}/refund  { amount, reason }           -> PaymentDetails
 *   PUT  /api/admin/payments/{id}/fail    { reason }                   -> PaymentDetails
 *
 * Для просмотра без бэкенда: VITE_ADMIN_MOCK=true в .env.local
 */

import { http } from '../http'
import type { Paged, PaymentAdminApi, PaymentDetails, PaymentListItem, PaymentQuery } from './paymentTypes'
import { mockPaymentApi } from './paymentMock'

const httpPaymentApi: PaymentAdminApi = {
  payments: {
    list: (q: PaymentQuery) =>
      http
        .get<Paged<PaymentListItem>>('/api/admin/payments', {
          params: { search: q.search || undefined, status: q.status ?? undefined, method: q.method ?? undefined, page: q.page, pageSize: q.pageSize },
        })
        .then((r) => r.data),
    get: (id) => http.get<PaymentDetails>(`/api/admin/payments/${id}`).then((r) => r.data),
    refund: (id, amount, reason) => http.post<PaymentDetails>(`/api/admin/payments/${id}/refund`, { amount, reason }).then((r) => r.data),
    markFailed: (id, reason) => http.put<PaymentDetails>(`/api/admin/payments/${id}/fail`, { reason }).then((r) => r.data),
  },
}

export const paymentAdmin: PaymentAdminApi = import.meta.env.VITE_ADMIN_MOCK === 'true' ? mockPaymentApi : httpPaymentApi
