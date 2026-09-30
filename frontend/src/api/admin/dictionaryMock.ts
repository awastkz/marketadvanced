// In-memory реализация админ-API справочников для разработки фронта без бэкенда.
// Включается переменной VITE_ADMIN_MOCK=true.

import type { DictionaryAdminApi, DictionaryEntry, DictionaryEntryApi } from './dictionaryTypes'

const delay = (ms = 300) => new Promise<void>((r) => setTimeout(r, ms))

function makeStore(seed: DictionaryEntry[]): DictionaryEntryApi {
  let rows = seed
  let nextId = Math.max(0, ...seed.map((r) => Number(r.id))) + 1

  return {
    async list() {
      await delay()
      return [...rows].sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name)).map((r) => ({ ...r }))
    },
    async create(payload) {
      await delay()
      const entry: DictionaryEntry = { id: String(nextId++), ...payload }
      rows = [...rows, entry]
      return { ...entry }
    },
    async update(id, payload) {
      await delay()
      const entry = rows.find((r) => r.id === id)
      if (!entry) throw new Error('Запись не найдена')
      Object.assign(entry, payload)
      return { ...entry }
    },
    async remove(id) {
      await delay()
      rows = rows.filter((r) => r.id !== id)
    },
  }
}

export const mockDictionaryApi: DictionaryAdminApi = {
  units: makeStore([
    { id: '1', name: 'Штука', code: 'pcs', sortOrder: 1 },
    { id: '2', name: 'Килограмм', code: 'kg', sortOrder: 2 },
    { id: '3', name: 'Метр', code: 'm', sortOrder: 3 },
    { id: '4', name: 'Литр', code: 'l', sortOrder: 4 },
  ]),
  countries: makeStore([
    { id: '1', name: 'Казахстан', code: 'KZ', sortOrder: 1 },
    { id: '2', name: 'Китай', code: 'CN', sortOrder: 2 },
    { id: '3', name: 'Турция', code: 'TR', sortOrder: 3 },
    { id: '4', name: 'США', code: 'US', sortOrder: 4 },
  ]),
  tags: makeStore([
    { id: '1', name: 'Новинка', code: 'new', sortOrder: 1 },
    { id: '2', name: 'Хит продаж', code: 'bestseller', sortOrder: 2 },
    { id: '3', name: 'Распродажа', code: 'sale', sortOrder: 3 },
  ]),
}
