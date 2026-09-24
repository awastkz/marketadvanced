import { catalogAdmin } from '../../../api/admin/catalog'

export interface ExportFetchResult {
  rows: (string | number)[][]
  /** Сколько строк должно было получиться по счётчику сервера — для сверки с rows.length. */
  expectedTotal: number
}

export interface ExportSpec {
  key: string
  label: string
  description: string
  filename: string
  header: string[]
  /** onProgress — только для товаров, где выгрузка идёт постранично. */
  fetchRows: (onProgress?: (done: number, total: number) => void) => Promise<ExportFetchResult>
}

export function makeCategoryExportSpec(): ExportSpec {
  return {
    key: 'categories',
    label: 'Категории',
    description: 'Все категории. Формат совпадает с шаблоном импорта — файл можно загрузить обратно.',
    filename: 'categories-export.csv',
    header: ['name', 'slug', 'parentSlug', 'sortOrder'],
    async fetchRows() {
      const categories = await catalogAdmin.categories.list()
      const slugById = new Map(categories.map((c) => [c.id, c.slug]))
      const rows = categories.map((c) => [c.name, c.slug, c.parentId != null ? (slugById.get(c.parentId) ?? '') : '', c.sortOrder])
      return { rows, expectedTotal: rows.length }
    },
  }
}

export function makeBrandExportSpec(): ExportSpec {
  return {
    key: 'brands',
    label: 'Бренды',
    description: 'Все бренды. Формат совпадает с шаблоном импорта.',
    filename: 'brands-export.csv',
    header: ['name', 'slug', 'description'],
    async fetchRows() {
      const brands = await catalogAdmin.brands.list()
      const rows = brands.map((b) => [b.name, b.slug, b.description ?? ''])
      return { rows, expectedTotal: rows.length }
    },
  }
}

export function makeAttributeExportSpec(): ExportSpec {
  return {
    key: 'attributes',
    label: 'Атрибуты',
    description: 'Все атрибуты. Формат совпадает с шаблоном импорта.',
    filename: 'attributes-export.csv',
    header: ['name', 'slug', 'unit', 'sortOrder'],
    async fetchRows() {
      const attributes = await catalogAdmin.attributes.list()
      const rows = attributes.map((a) => [a.name, a.slug, a.unit ?? '', a.sortOrder])
      return { rows, expectedTotal: rows.length }
    },
  }
}

// Бэкенд сам клампит pageSize к 100 (см. Math.Clamp в SearchProductsQuery на сервере) —
// сколько бы мы ни попросили, за раз реально приезжает не больше 100 строк.
// Поэтому страницы считаем честно по факту, а не по тому, что запросили, и берём
// с запасом по конкурентности, чтобы не тащить 90 000 строк по одной странице в секунду.
const PAGE_SIZE = 100
const CONCURRENCY = 6

function toRow(p: Awaited<ReturnType<typeof catalogAdmin.products.list>>['items'][number]): (string | number)[] {
  return [
    p.name,
    p.slug,
    p.categoryName,
    p.brandName ?? '',
    p.isActive ? 'true' : 'false',
    p.minPrice ?? '',
    p.variantsCount,
    p.totalStock,
    p.updatedAt ?? p.createdAt,
  ]
}

export interface ProductExportFilter {
  categoryId: number | null
  isActive: boolean | null
}

/**
 * Товаров может быть много, поэтому выгрузка идёт постранично, пачками по
 * CONCURRENCY страниц параллельно, с прогрессом. Колонки — сводные, для
 * отчёта/бэкапа, а не для обратной загрузки в импорт (там у товара один
 * вариант на строку, здесь — агрегат по всем вариантам).
 *
 * ВАЖНО: сортировка в SearchProductsQuery на сервере идёт по
 * UpdatedAt ?? CreatedAt без добавочного ключа (например, Id). Когда много
 * товаров имеют одинаковый таймстамп (например, после массовой вставки),
 * повторный запрос той же страницы отдаёт РАЗНЫЙ набор товаров — проверено
 * вручную (page=50 трижды подряд дало три разных набора id). Из-за этого при
 * обходе всех страниц часть товаров дублируется, а часть не попадает ни на
 * одну страницу вовсе. Здесь дублей по slug убираем, а вот с недостающими
 * строками ничего не можем сделать на фронте — нужен ThenBy(Id) на сервере.
 */
export function makeProductExportSpec(filter: ProductExportFilter): ExportSpec {
  const fetchPage = (page: number) =>
    catalogAdmin.products.list({
      search: '',
      categoryId: filter.categoryId,
      brandId: null,
      isActive: filter.isActive,
      page,
      pageSize: PAGE_SIZE,
    })

  return {
    key: 'products',
    label: 'Товары',
    description: 'Сводка по товарам: категория, бренд, цена от, остаток, число вариантов. Учитывает фильтры ниже.',
    filename: 'products-export.csv',
    header: ['name', 'slug', 'category', 'brand', 'isActive', 'minPrice', 'variantsCount', 'totalStock', 'updatedAt'],
    async fetchRows(onProgress) {
      const bySlug = new Map<string, Parameters<typeof toRow>[0]>()

      const first = await fetchPage(1)
      const total = first.total
      for (const p of first.items) bySlug.set(p.slug, p)
      onProgress?.(bySlug.size, total)

      const pageCount = Math.ceil(total / PAGE_SIZE)
      let page = 2

      while (page <= pageCount) {
        const batch = Array.from({ length: Math.min(CONCURRENCY, pageCount - page + 1) }, (_, i) => fetchPage(page + i))
        const results = await Promise.all(batch)
        for (const res of results) for (const p of res.items) bySlug.set(p.slug, p)
        onProgress?.(bySlug.size, total)
        page += batch.length
      }

      return { rows: [...bySlug.values()].map(toRow), expectedTotal: total }
    },
  }
}
