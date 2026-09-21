// In-memory реализация админ-API заказов для разработки фронта без бэкенда.
// Включается переменной VITE_ADMIN_MOCK=true.

import type { OrderAdminApi, OrderDetails, OrderItemDetails, OrderStatus } from './orderTypes'

const delay = (ms = 350) => new Promise<void>((r) => setTimeout(r, ms))
const nowIso = () => new Date().toISOString()

function totals(items: OrderItemDetails[], shippingCost: number) {
  const subtotal = items.reduce((s, i) => s + i.lineTotal, 0)
  return { subtotal, total: subtotal + shippingCost }
}

let orders: OrderDetails[] = [
  {
    id: 1,
    number: 'MA-100231',
    status: 'Processing',
    customerName: 'Айгерим Нурланова',
    customerEmail: 'aigerim@example.com',
    customerPhone: '+7 701 000 00 02',
    shippingAddress: 'г. Алматы, ул. Абая 10, кв. 5',
    comment: 'Позвонить перед доставкой',
    items: [
      { id: 1, variantId: 2, productName: 'iPhone 16 Pro', sku: 'IP16P-256-BLK', price: 619990, quantity: 1, lineTotal: 619990 },
    ],
    shippingCost: 2000,
    ...totals([{ id: 1, variantId: 2, productName: 'iPhone 16 Pro', sku: 'IP16P-256-BLK', price: 619990, quantity: 1, lineTotal: 619990 }], 2000),
    history: [
      { status: 'New', changedAt: '2026-09-14T10:00:00Z', comment: null },
      { status: 'Confirmed', changedAt: '2026-09-14T12:30:00Z', comment: null },
      { status: 'Processing', changedAt: '2026-09-15T09:00:00Z', comment: 'Собираем заказ' },
    ],
    createdAt: '2026-09-14T10:00:00Z',
    updatedAt: '2026-09-15T09:00:00Z',
  },
  {
    id: 2,
    number: 'MA-100232',
    status: 'New',
    customerName: 'Данияр Ахметов',
    customerEmail: 'daniyar@example.com',
    customerPhone: null,
    shippingAddress: 'г. Астана, пр. Мангилик Ел 22',
    comment: null,
    items: [
      { id: 2, variantId: 9, productName: 'Nike Air Max 270', sku: 'AM270-41-BLK', price: 64990, quantity: 2, lineTotal: 129980 },
      { id: 3, variantId: 13, productName: 'Садовый шланг 25 м', sku: 'HOSE-25', price: 7990, quantity: 1, lineTotal: 7990 },
    ],
    shippingCost: 1500,
    ...totals(
      [
        { id: 2, variantId: 9, productName: 'Nike Air Max 270', sku: 'AM270-41-BLK', price: 64990, quantity: 2, lineTotal: 129980 },
        { id: 3, variantId: 13, productName: 'Садовый шланг 25 м', sku: 'HOSE-25', price: 7990, quantity: 1, lineTotal: 7990 },
      ],
      1500,
    ),
    history: [{ status: 'New', changedAt: '2026-09-16T08:00:00Z', comment: null }],
    createdAt: '2026-09-16T08:00:00Z',
    updatedAt: null,
  },
  {
    id: 3,
    number: 'MA-100220',
    status: 'Delivered',
    customerName: 'Зарина Ахметова',
    customerEmail: 'zarina@example.com',
    customerPhone: '+7 701 000 00 04',
    shippingAddress: 'г. Шымкент, ул. Тауке хана 3',
    comment: null,
    items: [{ id: 4, variantId: 6, productName: 'MacBook Air 15" M4', sku: 'MBA15-M4-256', price: 699990, quantity: 1, lineTotal: 699990 }],
    shippingCost: 0,
    ...totals([{ id: 4, variantId: 6, productName: 'MacBook Air 15" M4', sku: 'MBA15-M4-256', price: 699990, quantity: 1, lineTotal: 699990 }], 0),
    history: [
      { status: 'New', changedAt: '2026-09-01T10:00:00Z', comment: null },
      { status: 'Confirmed', changedAt: '2026-09-01T11:00:00Z', comment: null },
      { status: 'Shipped', changedAt: '2026-09-02T09:00:00Z', comment: null },
      { status: 'Delivered', changedAt: '2026-09-05T15:00:00Z', comment: null },
    ],
    createdAt: '2026-09-01T10:00:00Z',
    updatedAt: '2026-09-05T15:00:00Z',
  },
  {
    id: 4,
    number: 'MA-100195',
    status: 'Cancelled',
    customerName: 'Айгерим Нурланова',
    customerEmail: 'aigerim@example.com',
    customerPhone: '+7 701 000 00 02',
    shippingAddress: 'г. Алматы, ул. Абая 10, кв. 5',
    comment: 'Отменён по просьбе клиента',
    items: [{ id: 5, variantId: 8, productName: 'Xiaomi Redmi Note 14', sku: 'RN14-128-BLU', price: 89990, quantity: 1, lineTotal: 89990 }],
    shippingCost: 1500,
    ...totals([{ id: 5, variantId: 8, productName: 'Xiaomi Redmi Note 14', sku: 'RN14-128-BLU', price: 89990, quantity: 1, lineTotal: 89990 }], 1500),
    history: [
      { status: 'New', changedAt: '2026-08-20T10:00:00Z', comment: null },
      { status: 'Cancelled', changedAt: '2026-08-21T10:00:00Z', comment: 'Отменён по просьбе клиента' },
    ],
    createdAt: '2026-08-20T10:00:00Z',
    updatedAt: '2026-08-21T10:00:00Z',
  },
]

function toListItem(o: OrderDetails) {
  return {
    id: o.id,
    number: o.number,
    customerName: o.customerName,
    customerEmail: o.customerEmail,
    status: o.status,
    itemsCount: o.items.length,
    total: o.total,
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
  }
}

function applyStatus(o: OrderDetails, status: OrderStatus, comment?: string) {
  o.status = status
  o.updatedAt = nowIso()
  o.history = [...o.history, { status, changedAt: o.updatedAt, comment: comment?.trim() || null }]
}

export const mockOrderApi: OrderAdminApi = {
  orders: {
    async list(q) {
      await delay()
      let rows = orders.map(toListItem)
      const s = q.search?.trim().toLowerCase()
      if (s) rows = rows.filter((r) => r.number.toLowerCase().includes(s) || r.customerName.toLowerCase().includes(s) || r.customerEmail.toLowerCase().includes(s))
      if (q.status) rows = rows.filter((r) => r.status === q.status)
      rows.sort((a, b) => (b.updatedAt ?? b.createdAt).localeCompare(a.updatedAt ?? a.createdAt))
      const start = (q.page - 1) * q.pageSize
      return { items: rows.slice(start, start + q.pageSize), total: rows.length }
    },
    async get(id) {
      await delay()
      const o = orders.find((x) => x.id === id)
      if (!o) throw new Error('Заказ не найден')
      return structuredClone(o)
    },
    async updateStatus(id, status, comment) {
      await delay()
      const o = orders.find((x) => x.id === id)
      if (!o) throw new Error('Заказ не найден')
      if (o.status === 'Cancelled') throw new Error('Заказ отменён, статус изменить нельзя')
      applyStatus(o, status, comment)
      return structuredClone(o)
    },
    async cancel(id, comment) {
      await delay()
      const o = orders.find((x) => x.id === id)
      if (!o) throw new Error('Заказ не найден')
      if (o.status === 'Delivered') throw new Error('Доставленный заказ нельзя отменить')
      applyStatus(o, 'Cancelled', comment)
      return structuredClone(o)
    },
  },
}
