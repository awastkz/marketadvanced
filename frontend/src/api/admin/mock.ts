// In-memory реализация админ-API для разработки фронта без бэкенда.
// Включается переменной VITE_ADMIN_MOCK=true.

import type {
  Attribute,
  Brand,
  CatalogAdminApi,
  Category,
  ProductDetails,
  ProductImage,
  ProductListItem,
} from './types'

const delay = (ms = 350) => new Promise<void>((r) => setTimeout(r, ms))
const pic = (seed: string, size = 480) => `https://picsum.photos/seed/${seed}/${size}/${size}`
const nowIso = () => new Date().toISOString()

let categories: Category[] = [
  { id: 1, name: 'Электроника', slug: 'elektronika', imageUrl: pic('cat-1'), sortOrder: 1, parentId: null, productsCount: 0 },
  { id: 2, name: 'Смартфоны', slug: 'smartfony', imageUrl: pic('cat-2'), sortOrder: 1, parentId: 1, productsCount: 0 },
  { id: 3, name: 'Ноутбуки', slug: 'noutbuki', imageUrl: pic('cat-3'), sortOrder: 2, parentId: 1, productsCount: 0 },
  { id: 4, name: 'Одежда', slug: 'odezhda', imageUrl: null, sortOrder: 2, parentId: null, productsCount: 0 },
  { id: 5, name: 'Кроссовки', slug: 'krossovki', imageUrl: pic('cat-5'), sortOrder: 1, parentId: 4, productsCount: 0 },
  { id: 6, name: 'Дом и сад', slug: 'dom-i-sad', imageUrl: null, sortOrder: 3, parentId: null, productsCount: 0 },
]

let brands: Brand[] = [
  { id: 1, name: 'Apple', slug: 'apple', description: 'Техника из Купертино', logoUrl: pic('brand-apple', 200), productsCount: 0 },
  { id: 2, name: 'Samsung', slug: 'samsung', description: null, logoUrl: pic('brand-samsung', 200), productsCount: 0 },
  { id: 3, name: 'Nike', slug: 'nike', description: 'Just do it', logoUrl: null, productsCount: 0 },
  { id: 4, name: 'Xiaomi', slug: 'xiaomi', description: null, logoUrl: pic('brand-xiaomi', 200), productsCount: 0 },
]

let attributes: Attribute[] = [
  { id: 1, name: 'Цвет', slug: 'color', unit: null, sortOrder: 1 },
  { id: 2, name: 'Диагональ экрана', slug: 'screen-size', unit: '″', sortOrder: 2 },
  { id: 3, name: 'Объём памяти', slug: 'storage', unit: 'ГБ', sortOrder: 3 },
  { id: 4, name: 'Вес', slug: 'weight', unit: 'г', sortOrder: 4 },
  { id: 5, name: 'Материал', slug: 'material', unit: null, sortOrder: 5 },
]

let products: ProductDetails[] = [
  {
    id: 1,
    name: 'iPhone 16 Pro',
    slug: 'iphone-16-pro',
    description: 'Титановый корпус, чип A18 Pro, камера 48 Мп.',
    categoryId: 2,
    brandId: 1,
    isActive: true,
    createdAt: '2026-08-02T10:00:00Z',
    updatedAt: '2026-09-10T14:20:00Z',
    variants: [
      { id: 1, sku: 'IP16P-128-BLK', name: '128 ГБ, чёрный титан', price: 549990, oldPrice: 599990, stock: 12, isActive: true },
      { id: 2, sku: 'IP16P-256-BLK', name: '256 ГБ, чёрный титан', price: 619990, oldPrice: null, stock: 4, isActive: true },
      { id: 3, sku: 'IP16P-256-WHT', name: '256 ГБ, белый титан', price: 619990, oldPrice: null, stock: 0, isActive: false },
    ],
    images: [
      { id: 1, url: pic('p1-a'), alt: null, sortOrder: 0, isMain: true },
      { id: 2, url: pic('p1-b'), alt: null, sortOrder: 1, isMain: false },
      { id: 3, url: pic('p1-c'), alt: null, sortOrder: 2, isMain: false },
    ],
    attributes: [
      { attributeId: 1, value: 'Чёрный титан' },
      { attributeId: 2, value: '6.3' },
      { attributeId: 4, value: '199' },
    ],
  },
  {
    id: 2,
    name: 'Samsung Galaxy S25 Ultra',
    slug: 'samsung-galaxy-s25-ultra',
    description: 'Флагман с S Pen и камерой 200 Мп.',
    categoryId: 2,
    brandId: 2,
    isActive: true,
    createdAt: '2026-08-05T09:00:00Z',
    updatedAt: null,
    variants: [
      { id: 4, sku: 'S25U-256-GRY', name: '256 ГБ, серый', price: 489990, oldPrice: null, stock: 7, isActive: true },
      { id: 5, sku: 'S25U-512-GRY', name: '512 ГБ, серый', price: 549990, oldPrice: null, stock: 2, isActive: true },
    ],
    images: [{ id: 4, url: pic('p2-a'), alt: null, sortOrder: 0, isMain: true }],
    attributes: [
      { attributeId: 1, value: 'Серый' },
      { attributeId: 2, value: '6.9' },
    ],
  },
  {
    id: 3,
    name: 'MacBook Air 15" M4',
    slug: 'macbook-air-15-m4',
    description: 'Тонкий и лёгкий ноутбук на чипе M4.',
    categoryId: 3,
    brandId: 1,
    isActive: true,
    createdAt: '2026-08-11T12:00:00Z',
    updatedAt: '2026-09-01T08:00:00Z',
    variants: [
      { id: 6, sku: 'MBA15-M4-256', name: '16/256 ГБ', price: 699990, oldPrice: null, stock: 5, isActive: true },
      { id: 7, sku: 'MBA15-M4-512', name: '16/512 ГБ', price: 799990, oldPrice: 849990, stock: 3, isActive: true },
    ],
    images: [
      { id: 5, url: pic('p3-a'), alt: null, sortOrder: 0, isMain: true },
      { id: 6, url: pic('p3-b'), alt: null, sortOrder: 1, isMain: false },
    ],
    attributes: [
      { attributeId: 2, value: '15.3' },
      { attributeId: 4, value: '1510' },
    ],
  },
  {
    id: 4,
    name: 'Xiaomi Redmi Note 14',
    slug: 'xiaomi-redmi-note-14',
    description: '',
    categoryId: 2,
    brandId: 4,
    isActive: false,
    createdAt: '2026-08-20T12:00:00Z',
    updatedAt: null,
    variants: [{ id: 8, sku: 'RN14-128-BLU', name: '128 ГБ, синий', price: 89990, oldPrice: null, stock: 40, isActive: true }],
    images: [],
    attributes: [{ attributeId: 1, value: 'Синий' }],
  },
  {
    id: 5,
    name: 'Nike Air Max 270',
    slug: 'nike-air-max-270',
    description: 'Легендарная модель с большой воздушной подушкой.',
    categoryId: 5,
    brandId: 3,
    isActive: true,
    createdAt: '2026-08-25T12:00:00Z',
    updatedAt: '2026-09-12T10:00:00Z',
    variants: [
      { id: 9, sku: 'AM270-41-BLK', name: '41, чёрные', price: 64990, oldPrice: 79990, stock: 6, isActive: true },
      { id: 10, sku: 'AM270-42-BLK', name: '42, чёрные', price: 64990, oldPrice: 79990, stock: 9, isActive: true },
      { id: 11, sku: 'AM270-43-BLK', name: '43, чёрные', price: 64990, oldPrice: 79990, stock: 0, isActive: true },
      { id: 12, sku: 'AM270-42-WHT', name: '42, белые', price: 64990, oldPrice: null, stock: 3, isActive: true },
    ],
    images: [
      { id: 7, url: pic('p5-a'), alt: null, sortOrder: 0, isMain: true },
      { id: 8, url: pic('p5-b'), alt: null, sortOrder: 1, isMain: false },
    ],
    attributes: [
      { attributeId: 1, value: 'Чёрный' },
      { attributeId: 5, value: 'Текстиль, синтетика' },
    ],
  },
  {
    id: 6,
    name: 'Садовый шланг 25 м',
    slug: 'sadovyj-shlang-25-m',
    description: '',
    categoryId: 6,
    brandId: null,
    isActive: true,
    createdAt: '2026-09-03T12:00:00Z',
    updatedAt: null,
    variants: [{ id: 13, sku: 'HOSE-25', name: '', price: 7990, oldPrice: null, stock: 120, isActive: true }],
    images: [{ id: 9, url: pic('p6-a'), alt: null, sortOrder: 0, isMain: true }],
    attributes: [{ attributeId: 5, value: 'ПВХ' }],
  },
]

let nextId = 100
const id = () => nextId++

function fileUrl(file: File) {
  return URL.createObjectURL(file)
}

function countProducts() {
  for (const c of categories) c.productsCount = products.filter((p) => p.categoryId === c.id).length
  for (const b of brands) b.productsCount = products.filter((p) => p.brandId === b.id).length
}
countProducts()

function toListItem(p: ProductDetails): ProductListItem {
  const active = p.variants.filter((v) => v.isActive)
  const prices = (active.length ? active : p.variants).map((v) => v.price)
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    imageUrl: p.images.find((i) => i.isMain)?.url ?? p.images[0]?.url ?? null,
    isActive: p.isActive,
    categoryId: p.categoryId,
    categoryName: categories.find((c) => c.id === p.categoryId)?.name ?? '—',
    brandName: brands.find((b) => b.id === p.brandId)?.name ?? null,
    variantsCount: p.variants.length,
    minPrice: prices.length ? Math.min(...prices) : null,
    totalStock: p.variants.reduce((s, v) => s + v.stock, 0),
    updatedAt: p.updatedAt,
    createdAt: p.createdAt,
  }
}

export const mockCatalogApi: CatalogAdminApi = {
  categories: {
    async list() {
      await delay()
      return categories.map((c) => ({ ...c }))
    },
    async create(p) {
      await delay()
      const c: Category = {
        id: id(),
        name: p.name,
        slug: p.slug,
        sortOrder: p.sortOrder,
        parentId: p.parentId,
        imageUrl: p.image ? fileUrl(p.image) : null,
        productsCount: 0,
      }
      categories = [...categories, c]
      return { ...c }
    },
    async update(cid, p) {
      await delay()
      const c = categories.find((x) => x.id === cid)
      if (!c) throw new Error('Категория не найдена')
      Object.assign(c, { name: p.name, slug: p.slug, sortOrder: p.sortOrder, parentId: p.parentId })
      if (p.image) c.imageUrl = fileUrl(p.image)
      if (p.removeImage) c.imageUrl = null
      return { ...c }
    },
    async remove(cid) {
      await delay()
      if (categories.some((c) => c.parentId === cid)) throw new Error('Сначала удалите подкатегории')
      if (products.some((p) => p.categoryId === cid)) throw new Error('В категории есть товары')
      categories = categories.filter((c) => c.id !== cid)
    },
  },

  brands: {
    async list() {
      await delay()
      return brands.map((b) => ({ ...b }))
    },
    async create(p) {
      await delay()
      const b: Brand = {
        id: id(),
        name: p.name,
        slug: p.slug,
        description: p.description || null,
        logoUrl: p.logo ? fileUrl(p.logo) : null,
        productsCount: 0,
      }
      brands = [...brands, b]
      return { ...b }
    },
    async update(bid, p) {
      await delay()
      const b = brands.find((x) => x.id === bid)
      if (!b) throw new Error('Бренд не найден')
      Object.assign(b, { name: p.name, slug: p.slug, description: p.description || null })
      if (p.logo) b.logoUrl = fileUrl(p.logo)
      if (p.removeLogo) b.logoUrl = null
      return { ...b }
    },
    async remove(bid) {
      await delay()
      if (products.some((p) => p.brandId === bid)) throw new Error('У бренда есть товары')
      brands = brands.filter((b) => b.id !== bid)
    },
  },

  attributes: {
    async list() {
      await delay()
      return attributes.map((a) => ({ ...a }))
    },
    async create(p) {
      await delay()
      const a: Attribute = { id: id(), name: p.name, slug: p.slug, unit: p.unit || null, sortOrder: p.sortOrder }
      attributes = [...attributes, a]
      return { ...a }
    },
    async update(aid, p) {
      await delay()
      const a = attributes.find((x) => x.id === aid)
      if (!a) throw new Error('Атрибут не найден')
      Object.assign(a, { name: p.name, slug: p.slug, unit: p.unit || null, sortOrder: p.sortOrder })
      return { ...a }
    },
    async remove(aid) {
      await delay()
      attributes = attributes.filter((a) => a.id !== aid)
      for (const p of products) p.attributes = p.attributes.filter((v) => v.attributeId !== aid)
    },
  },

  products: {
    async list(q) {
      await delay()
      let rows = products.map(toListItem)
      const s = q.search?.trim().toLowerCase()
      if (s) rows = rows.filter((r) => r.name.toLowerCase().includes(s) || r.slug.includes(s))
      if (q.categoryId != null) {
        const ids = new Set<number>([q.categoryId])
        let grew = true
        while (grew) {
          grew = false
          for (const c of categories) {
            if (c.parentId != null && ids.has(c.parentId) && !ids.has(c.id)) {
              ids.add(c.id)
              grew = true
            }
          }
        }
        rows = rows.filter((r) => ids.has(r.categoryId))
      }
      if (q.brandId != null) {
        const name = brands.find((b) => b.id === q.brandId)?.name
        rows = rows.filter((r) => r.brandName === name)
      }
      if (q.isActive != null) rows = rows.filter((r) => r.isActive === q.isActive)
      rows.sort((a, b) => (b.updatedAt ?? b.createdAt).localeCompare(a.updatedAt ?? a.createdAt))
      const start = (q.page - 1) * q.pageSize
      return { items: rows.slice(start, start + q.pageSize), total: rows.length }
    },
    async get(pid) {
      await delay()
      const p = products.find((x) => x.id === pid)
      if (!p) throw new Error('Товар не найден')
      return structuredClone(p)
    },
    async create(payload) {
      await delay(500)
      const p: ProductDetails = {
        id: id(),
        ...payload,
        variants: payload.variants.map((v) => ({ ...v, id: v.id ?? id() })),
        images: [],
        createdAt: nowIso(),
        updatedAt: null,
      }
      products = [p, ...products]
      countProducts()
      return structuredClone(p)
    },
    async update(pid, payload) {
      await delay(500)
      const p = products.find((x) => x.id === pid)
      if (!p) throw new Error('Товар не найден')
      Object.assign(p, payload, {
        variants: payload.variants.map((v) => ({ ...v, id: v.id ?? id() })),
        updatedAt: nowIso(),
      })
      countProducts()
      return structuredClone(p)
    },
    async remove(pid) {
      await delay()
      products = products.filter((p) => p.id !== pid)
      countProducts()
    },
    async uploadImage(pid, file) {
      await delay(600)
      const p = products.find((x) => x.id === pid)
      if (!p) throw new Error('Товар не найден')
      const img: ProductImage = { id: id(), url: fileUrl(file), alt: null, sortOrder: p.images.length, isMain: p.images.length === 0 }
      p.images.push(img)
      return { ...img }
    },
    async deleteImage(pid, imageId) {
      await delay()
      const p = products.find((x) => x.id === pid)
      if (!p) return
      const wasMain = p.images.find((i) => i.id === imageId)?.isMain
      p.images = p.images.filter((i) => i.id !== imageId)
      if (wasMain && p.images[0]) p.images[0].isMain = true
    },
    async setMainImage(pid, imageId) {
      await delay(200)
      const p = products.find((x) => x.id === pid)
      if (!p) return
      for (const i of p.images) i.isMain = i.id === imageId
    },
  },
}
