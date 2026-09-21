/**
 * Админ-API корзин.
 *
 * Ожидаемые эндпоинты бэкенда:
 *   GET    /api/admin/carts?search=&onlyNonEmpty=&page=&pageSize=  -> Paged<CartListItem>
 *   GET    /api/admin/carts/{id}                                    -> CartDetails
 *   PUT    /api/admin/carts/{id}/items/{itemId}   { quantity }      -> CartDetails
 *   DELETE /api/admin/carts/{id}/items/{itemId}                     -> CartDetails
 *   DELETE /api/admin/carts/{id}                                    (очистить корзину)
 *
 * Для просмотра без бэкенда: VITE_ADMIN_MOCK=true в .env.local
 */

import { http } from '../http'
import type { CartAdminApi, CartDetails, CartListItem, CartQuery, Paged } from './cartTypes'
import { mockCartApi } from './cartMock'

const httpCartApi: CartAdminApi = {
  carts: {
    list: (q: CartQuery) =>
      http
        .get<Paged<CartListItem>>('/api/admin/carts', {
          params: { search: q.search || undefined, onlyNonEmpty: q.onlyNonEmpty || undefined, page: q.page, pageSize: q.pageSize },
        })
        .then((r) => r.data),
    get: (id) => http.get<CartDetails>(`/api/admin/carts/${id}`).then((r) => r.data),
    updateItemQuantity: (cartId, itemId, quantity) =>
      http.put<CartDetails>(`/api/admin/carts/${cartId}/items/${itemId}`, { quantity }).then((r) => r.data),
    removeItem: (cartId, itemId) => http.delete<CartDetails>(`/api/admin/carts/${cartId}/items/${itemId}`).then((r) => r.data),
    clear: (cartId) => http.delete<void>(`/api/admin/carts/${cartId}`).then(() => undefined),
  },
}

export const cartAdmin: CartAdminApi = import.meta.env.VITE_ADMIN_MOCK === 'true' ? mockCartApi : httpCartApi
