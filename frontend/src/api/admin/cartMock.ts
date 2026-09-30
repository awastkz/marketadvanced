// In-memory реализация админ-API корзин для разработки фронта без бэкенда.
// Включается переменной VITE_ADMIN_MOCK=true.

import type { CartAdminApi, CartDetails, CartItemDetails } from './cartTypes'

const delay = (ms = 350) => new Promise<void>((r) => setTimeout(r, ms))

interface StoredCart extends CartDetails {}

function itemsSummary(items: CartItemDetails[]) {
  return {
    itemsCount: items.length,
    totalQuantity: items.reduce((s, i) => s + i.quantity, 0),
    totalAmount: items.reduce((s, i) => s + i.lineTotal, 0),
  }
}

let carts: StoredCart[] = [
  {
    id: '1',
    ownerLabel: 'Пользователь #2',
    userId: '00000000-0000-4000-8000-000000000002',
    guestId: null,
    updatedAt: '2026-09-16T10:00:00Z',
    expiresAt: null,
    items: [
      { id: '1', variantId: '2', productName: 'iPhone 16 Pro', sku: 'IP16P-256-BLK', price: 619990, quantity: 1, lineTotal: 619990 },
      { id: '2', variantId: '9', productName: 'Nike Air Max 270', sku: 'AM270-41-BLK', price: 64990, quantity: 2, lineTotal: 129980 },
    ],
  },
  {
    id: '2',
    ownerLabel: 'Гость',
    userId: null,
    guestId: 'b3e2b6a0-1c2d-4e5f-8a9b-1234567890ab',
    updatedAt: '2026-09-15T21:40:00Z',
    expiresAt: '2026-09-22T21:40:00Z',
    items: [{ id: '3', variantId: '6', productName: 'MacBook Air 15" M4', sku: 'MBA15-M4-256', price: 699990, quantity: 1, lineTotal: 699990 }],
  },
  {
    id: '3',
    ownerLabel: 'Пользователь #4',
    userId: '00000000-0000-4000-8000-000000000004',
    guestId: null,
    updatedAt: '2026-09-10T08:00:00Z',
    expiresAt: null,
    items: [],
  },
  {
    id: '4',
    ownerLabel: 'Гость',
    userId: null,
    guestId: 'f1a2b3c4-d5e6-4789-90ab-cdef01234567',
    updatedAt: '2026-09-12T14:00:00Z',
    expiresAt: '2026-09-19T14:00:00Z',
    items: [{ id: '4', variantId: '13', productName: 'Садовый шланг 25 м', sku: 'HOSE-25', price: 7990, quantity: 3, lineTotal: 23970 }],
  },
]

function toListItem(c: StoredCart) {
  const { itemsCount, totalQuantity, totalAmount } = itemsSummary(c.items)
  return {
    id: c.id,
    ownerLabel: c.ownerLabel,
    userId: c.userId,
    guestId: c.guestId,
    itemsCount,
    totalQuantity,
    totalAmount,
    updatedAt: c.updatedAt,
    expiresAt: c.expiresAt,
  }
}

export const mockCartApi: CartAdminApi = {
  carts: {
    async list(q) {
      await delay()
      let rows = carts.map(toListItem)
      const s = q.search?.trim().toLowerCase()
      if (s) rows = rows.filter((r) => r.ownerLabel.toLowerCase().includes(s) || (r.guestId ?? '').toLowerCase().includes(s) || String(r.userId ?? '').includes(s))
      if (q.onlyNonEmpty) rows = rows.filter((r) => r.itemsCount > 0)
      rows.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      const start = (q.page - 1) * q.pageSize
      return { items: rows.slice(start, start + q.pageSize), total: rows.length }
    },
    async get(id) {
      await delay()
      const c = carts.find((x) => x.id === id)
      if (!c) throw new Error('Корзина не найдена')
      return structuredClone(c)
    },
    async updateItemQuantity(cartId, itemId, quantity) {
      await delay()
      const c = carts.find((x) => x.id === cartId)
      if (!c) throw new Error('Корзина не найдена')
      const item = c.items.find((i) => i.id === itemId)
      if (item) {
        item.quantity = Math.max(1, quantity)
        item.lineTotal = item.price * item.quantity
        c.updatedAt = new Date().toISOString()
      }
      return structuredClone(c)
    },
    async removeItem(cartId, itemId) {
      await delay()
      const c = carts.find((x) => x.id === cartId)
      if (!c) throw new Error('Корзина не найдена')
      c.items = c.items.filter((i) => i.id !== itemId)
      c.updatedAt = new Date().toISOString()
      return structuredClone(c)
    },
    async clear(cartId) {
      await delay()
      const c = carts.find((x) => x.id === cartId)
      if (!c) return
      c.items = []
      c.updatedAt = new Date().toISOString()
    },
  },
}
