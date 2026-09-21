/**
 * Админ-API пользователей.
 *
 * Ожидаемые эндпоинты бэкенда:
 *   GET    /api/admin/users?search=&status=&page=&pageSize=  -> Paged<UserListItem>
 *   GET    /api/admin/users/{id}                              -> UserDetails
 *   PUT    /api/admin/users/{id}            (json)            -> UserDetails
 *   PUT    /api/admin/users/{id}/block      { blocked }       -> UserDetails
 *   DELETE /api/admin/users/{id}/sessions/{sessionId}
 *   DELETE /api/admin/users/{id}
 *
 * Для просмотра без бэкенда: VITE_ADMIN_MOCK=true в .env.local
 */

import { http } from '../http'
import type { IdentityAdminApi, Paged, UserDetails, UserListItem, UserQuery, UserUpdatePayload } from './identityTypes'
import { mockIdentityApi } from './identityMock'

const httpIdentityApi: IdentityAdminApi = {
  users: {
    list: (q: UserQuery) =>
      http
        .get<Paged<UserListItem>>('/api/admin/users', {
          params: { search: q.search || undefined, status: q.status === 'all' ? undefined : q.status, page: q.page, pageSize: q.pageSize },
        })
        .then((r) => r.data),
    get: (id) => http.get<UserDetails>(`/api/admin/users/${id}`).then((r) => r.data),
    update: (id, p: UserUpdatePayload) => http.put<UserDetails>(`/api/admin/users/${id}`, p).then((r) => r.data),
    setBlocked: (id, blocked) => http.put<UserDetails>(`/api/admin/users/${id}/block`, { blocked }).then((r) => r.data),
    revokeSession: (id, sessionId) => http.delete<void>(`/api/admin/users/${id}/sessions/${sessionId}`).then(() => undefined),
    remove: (id) => http.delete<void>(`/api/admin/users/${id}`).then(() => undefined),
  },
}

export const identityAdmin: IdentityAdminApi = import.meta.env.VITE_ADMIN_MOCK === 'true' ? mockIdentityApi : httpIdentityApi
