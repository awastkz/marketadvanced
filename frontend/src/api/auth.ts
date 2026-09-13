import { http } from './http'

export interface User {
  id: string
  email: string
  createdAt: string
  /** Роли пользователя, например ['Admin']. Пока бэкенд их не отдаёт — поле отсутствует. */
  roles?: string[]
}

export interface LoginResponse {
  user: User
  access_token: string
}

export function register(email: string, password: string, rePassword: string) {
  return http.post<void>('/api/auth/register', { email, password, rePassword })
}

export function login(email: string, password: string) {
  return http.post<LoginResponse>('/api/auth/login', { email, password })
}

export function refreshTokens() {
  return http.get<LoginResponse>('/api/auth/refresh')
}

export function logout() {
  return http.get<void>('/api/auth/logout')
}
