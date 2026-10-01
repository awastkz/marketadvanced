/**
 * Публичное API каталога (витрина): доступно гостям, только чтение.
 *
 *   GET /api/catalog/categories                                           -> PublicCategory[]
 *   GET /api/catalog/products?search=&categoryId=&brandId=&sort=&page=&pageSize=
 *                                                                         -> Paged<PublicProductCard>
 *   GET /api/catalog/products/{slug}                                      -> PublicProductDetails
 *
 * Показываются только активные товары и варианты, вместо остатка — признак наличия.
 */

import { catalogHttp } from './http'

export interface Paged<T> {
  items: T[]
  total: number
}

export interface PublicCategory {
  id: string
  name: string
  slug: string
  imageUrl: string | null
  sortOrder: number
  parentId: string | null
}

export type PublicProductSort = 'New' | 'PriceAsc' | 'PriceDesc'

export interface PublicProductCard {
  id: string
  name: string
  slug: string
  imageUrl: string | null
  categoryName: string
  brandName: string | null
  variantsCount: number
  minPrice: number
  inStock: boolean
}

export interface PublicAttributeValue {
  attributeId: string
  name: string
  value: string
  unit: string | null
}

export interface PublicProductImage {
  url: string
  alt: string | null
  isMain: boolean
}

export interface PublicProductVariant {
  id: string
  sku: string
  name: string | null
  price: number
  inStock: boolean
  attributes: PublicAttributeValue[]
}

export interface PublicProductDetails {
  id: string
  name: string
  slug: string
  description: string | null
  categoryId: string
  categoryName: string
  brandName: string | null
  images: PublicProductImage[]
  attributes: PublicAttributeValue[]
  variants: PublicProductVariant[]
}

export interface PublicProductQuery {
  search?: string
  categoryId?: string | null
  brandId?: string | null
  sort?: PublicProductSort
  page: number
  pageSize: number
}

export async function listCategories(): Promise<PublicCategory[]> {
  const { data } = await catalogHttp.get<PublicCategory[]>('/api/catalog/categories')
  return data
}

export async function searchProducts(query: PublicProductQuery): Promise<Paged<PublicProductCard>> {
  const params: Record<string, string | number> = { page: query.page, pageSize: query.pageSize }
  if (query.search) params.search = query.search
  if (query.categoryId) params.categoryId = query.categoryId
  if (query.brandId) params.brandId = query.brandId
  if (query.sort) params.sort = query.sort
  const { data } = await catalogHttp.get<Paged<PublicProductCard>>('/api/catalog/products', { params })
  return data
}

export async function getProduct(slug: string): Promise<PublicProductDetails> {
  const { data } = await catalogHttp.get<PublicProductDetails>(`/api/catalog/products/${encodeURIComponent(slug)}`)
  return data
}
