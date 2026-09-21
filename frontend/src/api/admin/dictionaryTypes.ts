// DTO админки справочников каталога. Контракт с бэкендом — см. src/api/admin/dictionary.ts

export interface DictionaryEntry {
  id: number
  name: string
  code: string
  sortOrder: number
}

export interface DictionaryEntryPayload {
  name: string
  code: string
  sortOrder: number
}

export interface DictionaryEntryApi {
  list(): Promise<DictionaryEntry[]>
  create(payload: DictionaryEntryPayload): Promise<DictionaryEntry>
  update(id: number, payload: DictionaryEntryPayload): Promise<DictionaryEntry>
  remove(id: number): Promise<void>
}

export interface DictionaryAdminApi {
  units: DictionaryEntryApi
  countries: DictionaryEntryApi
  tags: DictionaryEntryApi
}
