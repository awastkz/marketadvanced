// In-memory реализация админ-API пользователей для разработки фронта без бэкенда.
// Включается переменной VITE_ADMIN_MOCK=true.

import type { IdentityAdminApi, UserDetails, UserListItem } from './identityTypes'

const delay = (ms = 350) => new Promise<void>((r) => setTimeout(r, ms))
const pic = (seed: string, size = 200) => `https://picsum.photos/seed/${seed}/${size}/${size}`

interface StoredUser extends UserDetails {
  lastLoginAt: string | null
}

let users: StoredUser[] = [
  {
    id: '00000000-0000-4000-8000-000000000001',
    email: 'admin@marketadvanced.kz',
    firstName: 'Азамат',
    lastName: 'Каримов',
    phone: '+7 701 000 00 01',
    avatarUrl: pic('user-1'),
    isBlocked: false,
    createdAt: '2026-06-01T09:00:00Z',
    lastLoginAt: '2026-09-16T08:30:00Z',
    sessions: [
      { id: '1', deviceId: 'device-a1', userAgent: 'Chrome / Windows', createdAt: '2026-09-16T08:30:00Z', expiresAt: '2026-10-16T08:30:00Z', isRevoked: false },
    ],
  },
  {
    id: '00000000-0000-4000-8000-000000000002',
    email: 'aigerim@example.com',
    firstName: 'Айгерим',
    lastName: 'Нурланова',
    phone: '+7 701 000 00 02',
    avatarUrl: pic('user-2'),
    isBlocked: false,
    createdAt: '2026-06-20T12:00:00Z',
    lastLoginAt: '2026-09-14T18:12:00Z',
    sessions: [
      { id: '2', deviceId: 'device-b1', userAgent: 'Safari / iPhone', createdAt: '2026-09-14T18:12:00Z', expiresAt: '2026-10-14T18:12:00Z', isRevoked: false },
      { id: '3', deviceId: 'device-b2', userAgent: 'Chrome / Android', createdAt: '2026-08-01T10:00:00Z', expiresAt: '2026-09-01T10:00:00Z', isRevoked: true },
    ],
  },
  {
    id: '00000000-0000-4000-8000-000000000003',
    email: 'daniyar@example.com',
    firstName: 'Данияр',
    lastName: null,
    phone: null,
    avatarUrl: null,
    isBlocked: true,
    createdAt: '2026-07-05T15:00:00Z',
    lastLoginAt: '2026-08-20T09:00:00Z',
    sessions: [],
  },
  {
    id: '00000000-0000-4000-8000-000000000004',
    email: 'zarina@example.com',
    firstName: 'Зарина',
    lastName: 'Ахметова',
    phone: '+7 701 000 00 04',
    avatarUrl: pic('user-4'),
    isBlocked: false,
    createdAt: '2026-08-11T11:00:00Z',
    lastLoginAt: null,
    sessions: [],
  },
]

function toListItem(u: StoredUser): UserListItem {
  const fullName = [u.firstName, u.lastName].filter(Boolean).join(' ') || null
  return {
    id: u.id,
    email: u.email,
    fullName,
    phone: u.phone,
    avatarUrl: u.avatarUrl,
    isBlocked: u.isBlocked,
    createdAt: u.createdAt,
    lastLoginAt: u.lastLoginAt,
  }
}

export const mockIdentityApi: IdentityAdminApi = {
  users: {
    async list(q) {
      await delay()
      let rows = users.map(toListItem)
      const s = q.search?.trim().toLowerCase()
      if (s) rows = rows.filter((r) => r.email.toLowerCase().includes(s) || (r.fullName ?? '').toLowerCase().includes(s))
      if (q.status === 'active') rows = rows.filter((r) => !r.isBlocked)
      if (q.status === 'blocked') rows = rows.filter((r) => r.isBlocked)
      rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      const start = (q.page - 1) * q.pageSize
      return { items: rows.slice(start, start + q.pageSize), total: rows.length }
    },
    async get(id) {
      await delay()
      const u = users.find((x) => x.id === id)
      if (!u) throw new Error('Пользователь не найден')
      return structuredClone(u)
    },
    async update(id, payload) {
      await delay()
      const u = users.find((x) => x.id === id)
      if (!u) throw new Error('Пользователь не найден')
      u.firstName = payload.firstName || null
      u.lastName = payload.lastName || null
      u.phone = payload.phone || null
      return structuredClone(u)
    },
    async setBlocked(id, blocked) {
      await delay()
      const u = users.find((x) => x.id === id)
      if (!u) throw new Error('Пользователь не найден')
      u.isBlocked = blocked
      return structuredClone(u)
    },
    async revokeSession(id, sessionId) {
      await delay()
      const u = users.find((x) => x.id === id)
      if (!u) return
      const s = u.sessions.find((x) => x.id === sessionId)
      if (s) s.isRevoked = true
    },
    async remove(id) {
      await delay()
      users = users.filter((u) => u.id !== id)
    },
  },
}
