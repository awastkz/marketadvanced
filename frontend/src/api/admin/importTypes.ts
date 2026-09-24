// DTO массового импорта. Контракт с бэкендом — см. src/api/admin/import.ts

export interface CategoryImportRow {
  name: string
  slug: string
  parentSlug?: string
  sortOrder?: number
}

export interface BrandImportRow {
  name: string
  slug: string
  description?: string
}

export interface AttributeImportRow {
  name: string
  slug: string
  unit?: string
  sortOrder?: number
}

/** Одна строка = товар с одним вариантом. Для остальных вариантов — донастройка в карточке товара после импорта. */
export interface ProductImportRow {
  name: string
  slug: string
  description?: string
  categorySlug: string
  brandSlug?: string
  isActive?: boolean
  sku: string
  price: number
  stock?: number
}

export interface ImportRowError {
  row: number
  message: string
}

export interface ImportResult {
  created: number
  updated: number
  errors: ImportRowError[]
}

export interface ImportAdminApi {
  categories: { import(rows: CategoryImportRow[]): Promise<ImportResult> }
  brands: { import(rows: BrandImportRow[]): Promise<ImportResult> }
  attributes: { import(rows: AttributeImportRow[]): Promise<ImportResult> }
  products: { import(rows: ProductImportRow[]): Promise<ImportResult> }
}
