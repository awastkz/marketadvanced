/**
 * Админ-API справочников каталога (единицы измерения, страны, теги).
 *
 * Ожидаемые эндпоинты бэкенда (одинаковая форма для units/countries/tags):
 *   GET    /api/admin/dictionaries/{kind}                -> DictionaryEntry[]
 *   POST   /api/admin/dictionaries/{kind}       (json)   -> DictionaryEntry
 *   PUT    /api/admin/dictionaries/{kind}/{id}  (json)   -> DictionaryEntry
 *   DELETE /api/admin/dictionaries/{kind}/{id}
 *
 * Для просмотра без бэкенда: VITE_ADMIN_MOCK=true в .env.local
 */

import { http } from '../http'
import type { DictionaryAdminApi, DictionaryEntry, DictionaryEntryApi, DictionaryEntryPayload } from './dictionaryTypes'
import { mockDictionaryApi } from './dictionaryMock'

function entryApi(kind: 'units' | 'countries' | 'tags'): DictionaryEntryApi {
  return {
    list: () => http.get<DictionaryEntry[]>(`/api/admin/dictionaries/${kind}`).then((r) => r.data),
    create: (p: DictionaryEntryPayload) => http.post<DictionaryEntry>(`/api/admin/dictionaries/${kind}`, p).then((r) => r.data),
    update: (id, p) => http.put<DictionaryEntry>(`/api/admin/dictionaries/${kind}/${id}`, p).then((r) => r.data),
    remove: (id) => http.delete<void>(`/api/admin/dictionaries/${kind}/${id}`).then(() => undefined),
  }
}

const httpDictionaryApi: DictionaryAdminApi = {
  units: entryApi('units'),
  countries: entryApi('countries'),
  tags: entryApi('tags'),
}

export const dictionaryAdmin: DictionaryAdminApi = import.meta.env.VITE_ADMIN_MOCK === 'true' ? mockDictionaryApi : httpDictionaryApi
