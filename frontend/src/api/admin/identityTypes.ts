// DTO админки пользователей. Контракт с бэкендом — см. src/api/admin/identity.ts

export interface Paged<T> {
  items: T[]
  total: number
}

export interface UserListItem {
  id: number
  email: string
  fullName: string | null
  phone: string | null
  avatarUrl: string | null
  isBlocked: boolean
  createdAt: string
  lastLoginAt: string | null
}

export interface UserSession {
  id: number
  deviceId: string
  userAgent: string | null
  createdAt: string
  expiresAt: string
  isRevoked: boolean
}

export interface UserDetails {
  id: number
  email: string
  firstName: string | null
  lastName: string | null
  phone: string | null
  avatarUrl: string | null
  isBlocked: boolean
  createdAt: string
  sessions: UserSession[]
}

export interface UserUpdatePayload {
  firstName: string
  lastName: string
  phone: string
}

export interface UserQuery {
  search?: string
  status?: 'all' | 'active' | 'blocked'
  page: number
  pageSize: number
}

export interface IdentityAdminApi {
  users: {
    list(query: UserQuery): Promise<Paged<UserListItem>>
    get(id: number): Promise<UserDetails>
    update(id: number, payload: UserUpdatePayload): Promise<UserDetails>
    setBlocked(id: number, blocked: boolean): Promise<UserDetails>
    revokeSession(id: number, sessionId: number): Promise<void>
    remove(id: number): Promise<void>
  }
}
