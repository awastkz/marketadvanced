import { create } from 'zustand'
import * as authApi from '../api/auth'
import type { User } from '../api/auth'
import { useCartStore } from './cart'

interface AuthState {
  accessToken: string | null
  user: User | null
  initialized: boolean
  error: string | null
  setSession: (accessToken: string, user: User) => void
  register: (email: string, password: string, rePassword: string) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  refresh: () => Promise<string | null>
  initialize: () => Promise<void>
  logout: () => void
}

export const ADMIN_ROLE = 'Admin'

/**
 * Доступ в админку. Пока бэкенд не отдаёт roles, пускаем любого авторизованного —
 * реальная защита всё равно на сервере. Как только roles появятся, проверка станет строгой.
 */
export function isAdmin(user: User | null): boolean {
  if (!user) return false
  if (!user.roles) return true
  return user.roles.includes(ADMIN_ROLE)
}

let refreshInFlight: Promise<string | null> | null = null

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  user: null,
  initialized: false,
  error: null,

  setSession(accessToken, user) {
    set({ accessToken, user })
  },

  async register(email, password, rePassword) {
    set({ error: null })
    try {
      await authApi.register(email, password, rePassword)
    } catch (e) {
      set({ error: extractErrorMessage(e) })
      throw e
    }
  },

  async login(email, password) {
    set({ error: null })
    try {
      const { data } = await authApi.login(email, password)
      get().setSession(data.access_token, data.user)
      // до входа в сторе была гостевая корзина, теперь нужна корзина пользователя
      useCartStore.getState().reset()
    } catch (e) {
      set({ error: extractErrorMessage(e) })
      throw e
    }
  },

  // refresh-токен одноразовый (ротация на сервере), поэтому параллельные вызовы
  // должны делить один запрос: второй с той же cookie получит 401 и сбросит сессию
  refresh() {
    refreshInFlight ??= (async () => {
      try {
        const { data } = await authApi.refreshTokens()
        get().setSession(data.access_token, data.user)
        return data.access_token
      } catch {
        get().logout()
        return null
      } finally {
        refreshInFlight = null
      }
    })()
    return refreshInFlight
  },

  async initialize() {
    if (get().initialized) return
    await get().refresh()
    set({ initialized: true })
  },

  logout() {
    set({ accessToken: null, user: null })
    // корзина принадлежит пользователю по токену — после выхода снова грузится гостевая
    useCartStore.getState().reset()
  },
}))

function extractErrorMessage(e: unknown): string {
  if (typeof e === 'object' && e !== null && 'response' in e) {
    const response = (e as { response?: { data?: { message?: string } } }).response
    if (response?.data?.message) return response.data.message
  }
  return 'Что-то пошло не так. Попробуйте ещё раз.'
}
