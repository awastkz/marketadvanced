import { create } from 'zustand'
import * as authApi from '../api/auth'
import type { User } from '../api/auth'

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
    } catch (e) {
      set({ error: extractErrorMessage(e) })
      throw e
    }
  },

  async refresh() {
    try {
      const { data } = await authApi.refreshTokens()
      get().setSession(data.access_token, data.user)
      return data.access_token
    } catch {
      get().logout()
      return null
    }
  },

  async initialize() {
    if (get().initialized) return
    await get().refresh()
    set({ initialized: true })
  },

  logout() {
    set({ accessToken: null, user: null })
  },
}))

function extractErrorMessage(e: unknown): string {
  if (typeof e === 'object' && e !== null && 'response' in e) {
    const response = (e as { response?: { data?: { message?: string } } }).response
    if (response?.data?.message) return response.data.message
  }
  return 'Что-то пошло не так. Попробуйте ещё раз.'
}
