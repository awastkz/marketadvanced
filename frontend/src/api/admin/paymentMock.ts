// In-memory реализация админ-API платежей для разработки фронта без бэкенда.
// Включается переменной VITE_ADMIN_MOCK=true.

import type { PaymentAdminApi, PaymentDetails } from './paymentTypes'

const delay = (ms = 350) => new Promise<void>((r) => setTimeout(r, ms))
const nowIso = () => new Date().toISOString()

let payments: PaymentDetails[] = [
  {
    id: '1',
    orderId: '1',
    orderNumber: 'MA-100231',
    amount: 621990,
    currency: 'KZT',
    method: 'Card',
    status: 'Succeeded',
    transactionId: 'txn_9f8a7b6c',
    provider: 'Kaspi Pay',
    refunds: [],
    createdAt: '2026-09-14T10:05:00Z',
    updatedAt: '2026-09-14T10:05:30Z',
  },
  {
    id: '2',
    orderId: '2',
    orderNumber: 'MA-100232',
    amount: 137970,
    currency: 'KZT',
    method: 'CashOnDelivery',
    status: 'Pending',
    transactionId: null,
    provider: null,
    refunds: [],
    createdAt: '2026-09-16T08:00:10Z',
    updatedAt: null,
  },
  {
    id: '3',
    orderId: '3',
    orderNumber: 'MA-100220',
    amount: 699990,
    currency: 'KZT',
    method: 'Card',
    status: 'Succeeded',
    transactionId: 'txn_1a2b3c4d',
    provider: 'Kaspi Pay',
    refunds: [],
    createdAt: '2026-09-01T10:05:00Z',
    updatedAt: '2026-09-01T10:05:20Z',
  },
  {
    id: '4',
    orderId: '4',
    orderNumber: 'MA-100195',
    amount: 91490,
    currency: 'KZT',
    method: 'Card',
    status: 'Refunded',
    transactionId: 'txn_5e6f7g8h',
    provider: 'Kaspi Pay',
    refunds: [{ id: '1', amount: 91490, reason: 'Отмена заказа по просьбе клиента', createdAt: '2026-08-21T10:10:00Z' }],
    createdAt: '2026-08-20T10:05:00Z',
    updatedAt: '2026-08-21T10:10:00Z',
  },
  {
    id: '5',
    orderId: '5',
    orderNumber: 'MA-100180',
    amount: 54990,
    currency: 'KZT',
    method: 'BankTransfer',
    status: 'Failed',
    transactionId: 'txn_00fail01',
    provider: 'Halyk Bank',
    refunds: [],
    createdAt: '2026-08-10T09:00:00Z',
    updatedAt: '2026-08-10T09:02:00Z',
  },
]

let nextRefundId = 100

function toListItem(p: PaymentDetails) {
  return {
    id: p.id,
    orderId: p.orderId,
    orderNumber: p.orderNumber,
    amount: p.amount,
    method: p.method,
    status: p.status,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  }
}

export const mockPaymentApi: PaymentAdminApi = {
  payments: {
    async list(q) {
      await delay()
      let rows = payments.map(toListItem)
      const s = q.search?.trim().toLowerCase()
      if (s) rows = rows.filter((r) => r.orderNumber.toLowerCase().includes(s) || String(r.id).includes(s))
      if (q.status) rows = rows.filter((r) => r.status === q.status)
      if (q.method) rows = rows.filter((r) => r.method === q.method)
      rows.sort((a, b) => (b.updatedAt ?? b.createdAt).localeCompare(a.updatedAt ?? a.createdAt))
      const start = (q.page - 1) * q.pageSize
      return { items: rows.slice(start, start + q.pageSize), total: rows.length }
    },
    async get(id) {
      await delay()
      const p = payments.find((x) => x.id === id)
      if (!p) throw new Error('Платёж не найден')
      return structuredClone(p)
    },
    async refund(id, amount, reason) {
      await delay(500)
      const p = payments.find((x) => x.id === id)
      if (!p) throw new Error('Платёж не найден')
      if (p.status !== 'Succeeded' && p.status !== 'PartiallyRefunded') throw new Error('Возврат возможен только по успешному платежу')
      const refunded = p.refunds.reduce((s, r) => s + r.amount, 0)
      if (amount <= 0 || amount > p.amount - refunded) throw new Error('Некорректная сумма возврата')
      p.refunds = [...p.refunds, { id: String(++nextRefundId), amount, reason: reason.trim() || null, createdAt: nowIso() }]
      const totalRefunded = p.refunds.reduce((s, r) => s + r.amount, 0)
      p.status = totalRefunded >= p.amount ? 'Refunded' : 'PartiallyRefunded'
      p.updatedAt = nowIso()
      return structuredClone(p)
    },
    async markFailed(id, reason) {
      await delay()
      const p = payments.find((x) => x.id === id)
      if (!p) throw new Error('Платёж не найден')
      if (p.status !== 'Pending') throw new Error('Отметить неудачным можно только ожидающий платёж')
      p.status = 'Failed'
      p.provider = p.provider ?? null
      p.updatedAt = nowIso()
      void reason
      return structuredClone(p)
    },
  },
}
