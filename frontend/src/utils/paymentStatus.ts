import type { PaymentMethod, PaymentStatus } from '../api/admin/paymentTypes'

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  Pending: 'Ожидает оплаты',
  Succeeded: 'Оплачен',
  Failed: 'Ошибка',
  PartiallyRefunded: 'Частично возвращён',
  Refunded: 'Возвращён',
}

export const PAYMENT_STATUS_PILL: Record<PaymentStatus, string> = {
  Pending: 'pill-warning',
  Succeeded: 'pill-success',
  Failed: 'pill-danger',
  PartiallyRefunded: 'pill-warning',
  Refunded: 'pill-muted',
}

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  Card: 'Карта',
  CashOnDelivery: 'Наличные при получении',
  BankTransfer: 'Банковский перевод',
}
