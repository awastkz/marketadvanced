import type { ImportSpec } from '../../../components/admin/ImportPanel'
import { importAdmin } from '../../../api/admin/import'
import type { CategoryImportRow, BrandImportRow, AttributeImportRow, ProductImportRow } from '../../../api/admin/importTypes'
import type { Category, Brand } from '../../../api/admin/types'

const SLUG_RE = /^[a-z0-9-]+$/
const FALSY = new Set(['false', '0', 'нет', 'no'])

function num(raw: string | undefined, fallback: number): { ok: true; value: number } | { ok: false } {
  if (!raw) return { ok: true, value: fallback }
  const n = Number(raw)
  return Number.isFinite(n) ? { ok: true, value: n } : { ok: false }
}

export function makeCategorySpec(): ImportSpec<CategoryImportRow> {
  return {
    key: 'categories',
    label: 'Категории',
    description:
      'name и slug обязательны. parentSlug — slug уже существующей родительской категории, пусто = категория верхнего уровня.',
    templateFilename: 'categories-template.csv',
    templateHeader: ['name', 'slug', 'parentSlug', 'sortOrder'],
    templateExample: ['Электроника', 'elektronika', '', '1'],
    parseRow(rec) {
      const name = rec.name?.trim()
      const slug = rec.slug?.trim()
      if (!name) return { error: 'Не указано name' }
      if (!slug) return { error: 'Не указан slug' }
      if (!SLUG_RE.test(slug)) return { error: 'slug: только латиница, цифры и дефис' }
      const sortOrder = num(rec.sortOrder, 0)
      if (!sortOrder.ok) return { error: 'sortOrder должен быть числом' }
      return { value: { name, slug, parentSlug: rec.parentSlug || undefined, sortOrder: sortOrder.value } }
    },
    doImport: (rows) => importAdmin.categories.import(rows),
  }
}

export function makeBrandSpec(): ImportSpec<BrandImportRow> {
  return {
    key: 'brands',
    label: 'Бренды',
    description: 'name и slug обязательны, description — опционально.',
    templateFilename: 'brands-template.csv',
    templateHeader: ['name', 'slug', 'description'],
    templateExample: ['Apple', 'apple', 'Техника из Купертино'],
    parseRow(rec) {
      const name = rec.name?.trim()
      const slug = rec.slug?.trim()
      if (!name) return { error: 'Не указано name' }
      if (!slug) return { error: 'Не указан slug' }
      if (!SLUG_RE.test(slug)) return { error: 'slug: только латиница, цифры и дефис' }
      return { value: { name, slug, description: rec.description || undefined } }
    },
    doImport: (rows) => importAdmin.brands.import(rows),
  }
}

export function makeAttributeSpec(): ImportSpec<AttributeImportRow> {
  return {
    key: 'attributes',
    label: 'Атрибуты',
    description: 'name и slug обязательны. unit — единица измерения («ГБ», «см»), опционально.',
    templateFilename: 'attributes-template.csv',
    templateHeader: ['name', 'slug', 'unit', 'sortOrder'],
    templateExample: ['Объём памяти', 'storage', 'ГБ', '1'],
    parseRow(rec) {
      const name = rec.name?.trim()
      const slug = rec.slug?.trim()
      if (!name) return { error: 'Не указано name' }
      if (!slug) return { error: 'Не указан slug' }
      if (!SLUG_RE.test(slug)) return { error: 'slug: только латиница, цифры и дефис' }
      const sortOrder = num(rec.sortOrder, 0)
      if (!sortOrder.ok) return { error: 'sortOrder должен быть числом' }
      return { value: { name, slug, unit: rec.unit || undefined, sortOrder: sortOrder.value } }
    },
    doImport: (rows) => importAdmin.attributes.import(rows),
  }
}

/**
 * Одна строка = товар с одним вариантом (sku/price/stock). Остальные варианты
 * добавляются потом вручную в карточке товара — многовариантный CSV усложнил бы
 * формат сильнее, чем оправдано для массового импорта.
 */
export function makeProductSpec(categories: Category[], brands: Brand[]): ImportSpec<ProductImportRow> {
  const categoryBySlug = new Set(categories.map((c) => c.slug))
  const brandBySlug = new Set(brands.map((b) => b.slug))

  return {
    key: 'products',
    label: 'Товары',
    description:
      'categorySlug должен совпадать с slug уже существующей категории (сперва импортируйте категории). brandSlug — опционально. Строка описывает товар с одним вариантом: sku, price, stock.',
    templateFilename: 'products-template.csv',
    templateHeader: ['name', 'slug', 'description', 'categorySlug', 'brandSlug', 'isActive', 'sku', 'price', 'stock'],
    templateExample: ['Смартфон X1', 'smartfon-x1', '', 'elektronika', 'apple', 'true', 'X1-128-BLK', '199990', '10'],
    parseRow(rec) {
      const name = rec.name?.trim()
      const slug = rec.slug?.trim()
      const categorySlug = rec.categorySlug?.trim()
      const brandSlug = rec.brandSlug?.trim()
      const sku = rec.sku?.trim()

      if (!name) return { error: 'Не указано name' }
      if (!slug) return { error: 'Не указан slug' }
      if (!SLUG_RE.test(slug)) return { error: 'slug: только латиница, цифры и дефис' }
      if (!categorySlug) return { error: 'Не указан categorySlug' }
      if (!categoryBySlug.has(categorySlug)) return { error: `Категория «${categorySlug}» не найдена` }
      if (brandSlug && !brandBySlug.has(brandSlug)) return { error: `Бренд «${brandSlug}» не найден` }
      if (!sku) return { error: 'Не указан sku' }

      const price = Number(rec.price)
      if (!rec.price || !Number.isFinite(price) || price <= 0) return { error: 'price должен быть положительным числом' }

      const stock = num(rec.stock, 0)
      if (!stock.ok) return { error: 'stock должен быть числом' }

      const isActive = rec.isActive ? !FALSY.has(rec.isActive.trim().toLowerCase()) : true

      return {
        value: {
          name,
          slug,
          description: rec.description || undefined,
          categorySlug,
          brandSlug: brandSlug || undefined,
          isActive,
          sku,
          price,
          stock: stock.value,
        },
      }
    },
    doImport: (rows) => importAdmin.products.import(rows),
  }
}
