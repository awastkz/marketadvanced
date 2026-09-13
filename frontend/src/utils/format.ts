const money = new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'KZT', maximumFractionDigits: 0 })

export function formatMoney(value: number | null | undefined) {
  if (value == null) return '—'
  return money.format(value)
}

export function formatDate(value: string | null | undefined) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) return '—'
  return new Date(value).toLocaleString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export function errorMessage(e: unknown, fallback = 'Что-то пошло не так. Попробуйте ещё раз.'): string {
  if (typeof e === 'object' && e !== null) {
    const r = (e as { response?: { data?: { message?: string; title?: string } } }).response
    if (r?.data?.message) return r.data.message
    if (r?.data?.title) return r.data.title
    if ('message' in e && typeof (e as { message: unknown }).message === 'string') return (e as { message: string }).message
  }
  return fallback
}
