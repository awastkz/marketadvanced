/**
 * Админ-API массового импорта. Бэкенда пока нет — эндпоинты ниже это контракт,
 * под который написан фронт; строки на вход уже провалидированы на клиенте
 * (см. ImportPanel), от бэкенда нужен только bulk-insert и отчёт по строкам.
 *
 * Ожидаемые эндпоинты (Catalog-сервис, тот же порт, что и остальной api/admin/*):
 *   POST /api/admin/categories/import  { items: CategoryImportRow[] }  -> ImportResult
 *   POST /api/admin/brands/import      { items: BrandImportRow[] }     -> ImportResult
 *   POST /api/admin/attributes/import  { items: AttributeImportRow[] } -> ImportResult
 *   POST /api/admin/products/import    { items: ProductImportRow[] }   -> ImportResult
 *
 * ImportResult: { created: number, updated: number, errors: { row: number, message: string }[] }
 * row в errors — номер строки в исходном CSV (с учётом заголовка, считая с 2).
 * Существующая запись с тем же slug — обновление (updated++), а не ошибка.
 *
 * Для просмотра без бэкенда: VITE_ADMIN_MOCK=true в .env.local
 */

import { catalogHttp } from '../http'
import type { ImportAdminApi, ImportResult } from './importTypes'
import { mockImportApi } from './importMock'

const httpImportApi: ImportAdminApi = {
  categories: {
    import: (items) => catalogHttp.post<ImportResult>('/api/admin/categories/import', { items }).then((r) => r.data),
  },
  brands: {
    import: (items) => catalogHttp.post<ImportResult>('/api/admin/brands/import', { items }).then((r) => r.data),
  },
  attributes: {
    import: (items) => catalogHttp.post<ImportResult>('/api/admin/attributes/import', { items }).then((r) => r.data),
  },
  products: {
    import: (items) => catalogHttp.post<ImportResult>('/api/admin/products/import', { items }).then((r) => r.data),
  },
}

export const importAdmin: ImportAdminApi = import.meta.env.VITE_ADMIN_MOCK === 'true' ? mockImportApi : httpImportApi
