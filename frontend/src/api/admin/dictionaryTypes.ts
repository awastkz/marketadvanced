// DTO админки справочников каталога. Контракт с бэкендом — см. src/api/admin/dictionary.ts

export interface DictionaryEntry {
  id: string
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
  update(id: string, payload: DictionaryEntryPayload): Promise<DictionaryEntry>
  remove(id: string): Promise<void>
}

export interface DictionaryAdminApi {
  units: DictionaryEntryApi
  countries: DictionaryEntryApi
  tags: DictionaryEntryApi
}
