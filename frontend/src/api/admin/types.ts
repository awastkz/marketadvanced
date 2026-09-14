// DTO админки каталога. Контракт с бэкендом — см. src/api/admin/catalog.ts

export interface Paged<T> {
  items: T[]
  total: number
}

/* ---------- Категории ---------- */

export interface Category {
  id: number
  name: string
  slug: string
  imageUrl: string | null
  sortOrder: number
  parentId: number | null
  productsCount: number
}

export interface CategoryPayload {
  name: string
  slug: string
  sortOrder: number
  parentId: number | null
  image?: File | null
  removeImage?: boolean
}

/* ---------- Бренды ---------- */

export interface Brand {
  id: number
  name: string
  slug: string
  description: string | null
  logoUrl: string | null
  productsCount: number
}

export interface BrandPayload {
  name: string
  slug: string
  description: string
  logo?: File | null
  removeLogo?: boolean
}

/* ---------- Атрибуты ---------- */

export interface Attribute {
  id: number
  name: string
  slug: string
  unit: string | null
  sortOrder: number
}

export interface AttributePayload {
  name: string
  slug: string
  unit: string
  sortOrder: number
}

/* ---------- Товары ---------- */

export interface ProductListItem {
  id: number
  name: string
  slug: string
  imageUrl: string | null
  isActive: boolean
  categoryId: number
  categoryName: string
  brandName: string | null
  variantsCount: number
  minPrice: number | null
  totalStock: number
  updatedAt: string | null
  createdAt: string
}

export interface ProductVariant {
  id: number | null
  sku: string
  /** Собирается фронтом из значений признаков: «256 ГБ, Чёрный». Если признаков нет — вводится вручную. */
  name: string
  price: number
  stock: number
  isActive: boolean
  /** Чем этот вариант отличается от других: память, цвет, размер. */
  attributes: ProductAttributeValue[]
}

export interface ProductImage {
  id: number
  url: string
  alt: string | null
  sortOrder: number
  isMain: boolean
}

export interface ProductAttributeValue {
  attributeId: number
  value: string
}

export interface ProductDetails {
  id: number
  name: string
  slug: string
  description: string
  categoryId: number
  brandId: number | null
  isActive: boolean
  createdAt: string
  updatedAt: string | null
  variants: ProductVariant[]
  images: ProductImage[]
  attributes: ProductAttributeValue[]
}

export interface ProductPayload {
  name: string
  slug: string
  description: string
  categoryId: number
  brandId: number | null
  isActive: boolean
  variants: ProductVariant[]
  attributes: ProductAttributeValue[]
}

export interface ProductQuery {
  search?: string
  categoryId?: number | null
  brandId?: number | null
  isActive?: boolean | null
  page: number
  pageSize: number
}

/* ---------- Интерфейс API ---------- */

export interface CatalogAdminApi {
  categories: {
    list(): Promise<Category[]>
    create(payload: CategoryPayload): Promise<Category>
    update(id: number, payload: CategoryPayload): Promise<Category>
    remove(id: number): Promise<void>
  }
  brands: {
    list(): Promise<Brand[]>
    create(payload: BrandPayload): Promise<Brand>
    update(id: number, payload: BrandPayload): Promise<Brand>
    remove(id: number): Promise<void>
  }
  attributes: {
    list(): Promise<Attribute[]>
    create(payload: AttributePayload): Promise<Attribute>
    update(id: number, payload: AttributePayload): Promise<Attribute>
    remove(id: number): Promise<void>
  }
  products: {
    list(query: ProductQuery): Promise<Paged<ProductListItem>>
    get(id: number): Promise<ProductDetails>
    create(payload: ProductPayload): Promise<ProductDetails>
    update(id: number, payload: ProductPayload): Promise<ProductDetails>
    remove(id: number): Promise<void>
    uploadImage(productId: number, file: File): Promise<ProductImage>
    deleteImage(productId: number, imageId: number): Promise<void>
    setMainImage(productId: number, imageId: number): Promise<void>
  }
}
