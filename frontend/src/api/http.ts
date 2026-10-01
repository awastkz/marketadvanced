import axios, { type InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '../stores/auth'
import { getGuestId } from '../utils/guestId'

/**
 * Один и тот же клиент (токен в заголовке, ретрай через refresh при 401),
 * но с разным baseURL: Identity/Cart/Order/Payment живут в `api`, Catalog —
 * отдельный сервис (см. docker-compose: catalog слушает свой порт). Общего
 * шлюза пока нет, поэтому фронт знает оба адреса напрямую.
 */
function createHttp(baseURL: string) {
  const instance = axios.create({ baseURL, withCredentials: true })

  instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const accessToken = useAuthStore.getState().accessToken
    if (accessToken) {
      config.headers.set('Authorization', `Bearer ${accessToken}`)
    } else {
      // гость: корзина на бэкенде привязывается к X-Guest-Id
      config.headers.set('X-Guest-Id', getGuestId())
    }
    return config
  })

  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config
      const isAuthEndpoint = originalRequest?.url?.startsWith('/api/auth/')

      if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
        originalRequest._retry = true

        const newAccessToken = await useAuthStore.getState().refresh()
        if (newAccessToken) {
          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`
          return instance(originalRequest)
        }

        useAuthStore.getState().logout()
      }

      return Promise.reject(error)
    },
  )

  return instance
}

export const http = createHttp(import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5080')

export const catalogHttp = createHttp(import.meta.env.VITE_CATALOG_API_BASE_URL ?? 'http://localhost:5081')
