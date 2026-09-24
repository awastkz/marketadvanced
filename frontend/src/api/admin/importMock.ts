// In-memory реализация импорта для разработки фронта без бэкенда.
// Включается переменной VITE_ADMIN_MOCK=true. Строки уже провалидированы
// клиентом (см. ImportPanel), поэтому мок только имитирует сетевую задержку
// и изредка «находит» коллизию по slug — чтобы экран ошибок было на чём проверить.

import type { ImportAdminApi, ImportResult } from './importTypes'

const delay = (rows: number) => new Promise<void>((r) => setTimeout(r, Math.min(1500, 300 + rows * 4)))

function fakeResult(rows: { slug: string }[]): ImportResult {
  const errors = rows
    .map((row, i) => ({ row, i }))
    .filter(({ row }) => row.slug.length % 17 === 0) // детерминированная «редкая» коллизия для демонстрации
    .map(({ i }) => ({ row: i + 2, message: `Slug «${rows[i].slug}» уже занят` }))

  return { created: rows.length - errors.length, updated: 0, errors }
}

export const mockImportApi: ImportAdminApi = {
  categories: {
    async import(rows) {
      await delay(rows.length)
      return fakeResult(rows)
    },
  },
  brands: {
    async import(rows) {
      await delay(rows.length)
      return fakeResult(rows)
    },
  },
  attributes: {
    async import(rows) {
      await delay(rows.length)
      return fakeResult(rows)
    },
  },
  products: {
    async import(rows) {
      await delay(rows.length)
      return fakeResult(rows)
    },
  },
}
