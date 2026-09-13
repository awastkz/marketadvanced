/**
 * Админ-API каталога.
 *
 * Ожидаемые эндпоинты бэкенда:
 *   GET    /api/admin/categories                      -> Category[]
 *   POST   /api/admin/categories        (multipart)   -> Category
 *   PUT    /api/admin/categories/{id}   (multipart)   -> Category
 *   DELETE /api/admin/categories/{id}
 *
 *   GET    /api/admin/brands                          -> Brand[]
 *   POST   /api/admin/brands            (multipart)   -> Brand
 *   PUT    /api/admin/brands/{id}       (multipart)   -> Brand
 *   DELETE /api/admin/brands/{id}
 *
 *   GET    /api/admin/attributes                      -> Attribute[]
 *   POST   /api/admin/attributes        (json)        -> Attribute
 *   PUT    /api/admin/attributes/{id}   (json)        -> Attribute
 *   DELETE /api/admin/attributes/{id}
 *
 *   GET    /api/admin/products?search=&categoryId=&brandId=&isActive=&page=&pageSize=
 *                                                     -> Paged<ProductListItem>
 *   GET    /api/admin/products/{id}                   -> ProductDetails
 *   POST   /api/admin/products          (json)        -> ProductDetails
 *   PUT    /api/admin/products/{id}     (json)        -> ProductDetails
 *   DELETE /api/admin/products/{id}
 *   POST   /api/admin/products/{id}/images (multipart, поле "file") -> ProductImage
 *   DELETE /api/admin/products/{id}/images/{imageId}
 *   PUT    /api/admin/products/{id}/images/{imageId}/main
 *
 * Для просмотра без бэкенда: VITE_ADMIN_MOCK=true в .env.local
 */

import { http } from '../http'
import type {
  Attribute,
  AttributePayload,
  Brand,
  BrandPayload,
  CatalogAdminApi,
  Category,
  CategoryPayload,
  Paged,
  ProductDetails,
  ProductImage,
  ProductListItem,
  ProductPayload,
  ProductQuery,
} from './types'
import { mockCatalogApi } from './mock'

function categoryForm(p: CategoryPayload) {
  const form = new FormData()
  form.append('Name', p.name)
  form.append('Slug', p.slug)
  form.append('SortOrder', String(p.sortOrder))
  if (p.parentId != null) form.append('ParentId', String(p.parentId))
  if (p.image) form.append('Image', p.image)
  if (p.removeImage) form.append('RemoveImage', 'true')
  return form
}

function brandForm(p: BrandPayload) {
  const form = new FormData()
  form.append('Name', p.name)
  form.append('Slug', p.slug)
  form.append('Description', p.description)
  if (p.logo) form.append('Logo', p.logo)
  if (p.removeLogo) form.append('RemoveLogo', 'true')
  return form
}

const httpCatalogApi: CatalogAdminApi = {
  categories: {
    list: () => http.get<Category[]>('/api/admin/categories').then((r) => r.data),
    create: (p) => http.post<Category>('/api/admin/categories', categoryForm(p)).then((r) => r.data),
    update: (id, p) => http.put<Category>(`/api/admin/categories/${id}`, categoryForm(p)).then((r) => r.data),
    remove: (id) => http.delete<void>(`/api/admin/categories/${id}`).then(() => undefined),
  },
  brands: {
    list: () => http.get<Brand[]>('/api/admin/brands').then((r) => r.data),
    create: (p) => http.post<Brand>('/api/admin/brands', brandForm(p)).then((r) => r.data),
    update: (id, p) => http.put<Brand>(`/api/admin/brands/${id}`, brandForm(p)).then((r) => r.data),
    remove: (id) => http.delete<void>(`/api/admin/brands/${id}`).then(() => undefined),
  },
  attributes: {
    list: () => http.get<Attribute[]>('/api/admin/attributes').then((r) => r.data),
    create: (p: AttributePayload) => http.post<Attribute>('/api/admin/attributes', p).then((r) => r.data),
    update: (id, p) => http.put<Attribute>(`/api/admin/attributes/${id}`, p).then((r) => r.data),
    remove: (id) => http.delete<void>(`/api/admin/attributes/${id}`).then(() => undefined),
  },
  products: {
    list: (q: ProductQuery) =>
      http
        .get<Paged<ProductListItem>>('/api/admin/products', {
          params: {
            search: q.search || undefined,
            categoryId: q.categoryId ?? undefined,
            brandId: q.brandId ?? undefined,
            isActive: q.isActive ?? undefined,
            page: q.page,
            pageSize: q.pageSize,
          },
        })
        .then((r) => r.data),
    get: (id) => http.get<ProductDetails>(`/api/admin/products/${id}`).then((r) => r.data),
    create: (p: ProductPayload) => http.post<ProductDetails>('/api/admin/products', p).then((r) => r.data),
    update: (id, p) => http.put<ProductDetails>(`/api/admin/products/${id}`, p).then((r) => r.data),
    remove: (id) => http.delete<void>(`/api/admin/products/${id}`).then(() => undefined),
    uploadImage: (productId, file) => {
      const form = new FormData()
      form.append('File', file)
      return http.post<ProductImage>(`/api/admin/products/${productId}/images`, form).then((r) => r.data)
    },
    deleteImage: (productId, imageId) =>
      http.delete<void>(`/api/admin/products/${productId}/images/${imageId}`).then(() => undefined),
    setMainImage: (productId, imageId) =>
      http.put<void>(`/api/admin/products/${productId}/images/${imageId}/main`).then(() => undefined),
  },
}

export const catalogAdmin: CatalogAdminApi = import.meta.env.VITE_ADMIN_MOCK === 'true' ? mockCatalogApi : httpCatalogApi
