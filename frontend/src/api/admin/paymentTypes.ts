// DTO админки платежей. Контракт с бэкендом — см. src/api/admin/payment.ts

export interface Paged<T> {
  items: T[]
  total: number
}

export const PAYMENT_STATUSES = ['Pending', 'Succeeded', 'Failed', 'PartiallyRefunded', 'Refunded'] as const
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number]

export const PAYMENT_METHODS = ['Card', 'CashOnDelivery', 'BankTransfer'] as const
export type PaymentMethod = (typeof PAYMENT_METHODS)[number]

export interface PaymentListItem {
  id: string
  orderId: string
  orderNumber: string
  amount: number
  method: PaymentMethod
  status: PaymentStatus
  createdAt: string
  updatedAt: string | null
}

export interface RefundRecord {
  id: string
  amount: number
  reason: string | null
  createdAt: string
}

export interface PaymentDetails {
  id: string
  orderId: string
  orderNumber: string
  amount: number
  currency: string
  method: PaymentMethod
  status: PaymentStatus
  transactionId: string | null
  provider: string | null
  refunds: RefundRecord[]
  createdAt: string
  updatedAt: string | null
}

export interface PaymentQuery {
  search?: string
  status?: PaymentStatus | null
  method?: PaymentMethod | null
  page: number
  pageSize: number
}

export interface PaymentAdminApi {
  payments: {
    list(query: PaymentQuery): Promise<Paged<PaymentListItem>>
    get(id: string): Promise<PaymentDetails>
    refund(id: string, amount: number, reason: string): Promise<PaymentDetails>
    markFailed(id: string, reason: string): Promise<PaymentDetails>
  }
}
