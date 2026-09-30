// DTO админки пользователей. Контракт с бэкендом — см. src/api/admin/identity.ts

export interface Paged<T> {
  items: T[]
  total: number
}

export interface UserListItem {
  id: string
  email: string
  fullName: string | null
  phone: string | null
  avatarUrl: string | null
  isBlocked: boolean
  createdAt: string
  lastLoginAt: string | null
}

export interface UserSession {
  id: string
  deviceId: string
  userAgent: string | null
  createdAt: string
  expiresAt: string
  isRevoked: boolean
}

export interface UserDetails {
  id: string
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
    get(id: string): Promise<UserDetails>
    update(id: string, payload: UserUpdatePayload): Promise<UserDetails>
    setBlocked(id: string, blocked: boolean): Promise<UserDetails>
    revokeSession(id: string, sessionId: string): Promise<void>
    remove(id: string): Promise<void>
  }
}
