import { Link } from 'react-router-dom'
import { catalogAdmin } from '../../../api/admin/catalog'
import { useLoad } from '../../../utils/useLoad'
import Alert from '../../../components/Alert'
import BarList from '../../../components/admin/BarList'
import { IconBox, IconInbox, IconLayers, IconSliders, IconTag } from '../../../components/icons'

const TOP_N = 10

export default function AnalyticsView() {
  const { data, loading, error } = useLoad(async () => {
    const [categories, brands, attributes, total, active] = await Promise.all([
      catalogAdmin.categories.list(),
      catalogAdmin.brands.list(),
      catalogAdmin.attributes.list(),
      catalogAdmin.products.list({ page: 1, pageSize: 1 }),
      catalogAdmin.products.list({ page: 1, pageSize: 1, isActive: true }),
    ])
    return { categories, brands, attributes, totalProducts: total.total, activeProducts: active.total }
  }, [])

  const stats = [
    { label: 'Товаров всего', value: data?.totalProducts, icon: IconBox, to: '/admin/products' },
    { label: 'В продаже', value: data?.activeProducts, icon: IconTag, to: '/admin/products?status=active' },
    { label: 'Скрыто', value: data ? data.totalProducts - data.activeProducts : undefined, icon: IconInbox, to: '/admin/products?status=hidden' },
    { label: 'Категорий', value: data?.categories.length, icon: IconLayers, to: '/admin/categories' },
    { label: 'Брендов', value: data?.brands.length, icon: IconTag, to: '/admin/brands' },
    { label: 'Атрибутов', value: data?.attributes.length, icon: IconSliders, to: '/admin/attributes' },
  ]

  const topCategories = [...(data?.categories ?? [])]
    .filter((c) => c.productsCount > 0)
    .sort((a, b) => b.productsCount - a.productsCount)
    .slice(0, TOP_N)
    .map((c) => ({ label: c.name, value: c.productsCount }))

  const topBrands = [...(data?.brands ?? [])]
    .filter((b) => b.productsCount > 0)
    .sort((a, b) => b.productsCount - a.productsCount)
    .slice(0, TOP_N)
    .map((b) => ({ label: b.name, value: b.productsCount }))

  return (
    <>
      <div className="page-head">
        <div>
          <span className="eyebrow">Каталог</span>
          <h1>Аналитика</h1>
          <p>Срез по каталогу на сейчас. Продажи и выручка появятся, когда заработают заказы.</p>
        </div>
      </div>

      {error && <Alert kind="error">{error}</Alert>}

      <div className="stats">
        {stats.map(({ label, value, icon: Icon, to }) => (
          <Link key={label} to={to} className="card stat">
            <span className="stat-icon">
              <Icon />
            </span>
            <span className="stat-label">{label}</span>
            {loading ? <span className="skeleton stat-skeleton" /> : <span className="stat-value">{value ?? '—'}</span>}
          </Link>
        ))}
      </div>

      <div className="analytics-grid">
        <section className="card">
          <header className="card-head">
            <div>
              <h2>Товаров по категориям</h2>
              <p>Топ {TOP_N} категорий по количеству товаров</p>
            </div>
          </header>
          <div className="card-body">
            {loading && <span className="skeleton" style={{ display: 'block', height: 220 }} />}
            {!loading && topCategories.length === 0 && <p className="muted">Пока нет товаров ни в одной категории.</p>}
            {!loading && topCategories.length > 0 && <BarList items={topCategories} />}
          </div>
        </section>

        <section className="card">
          <header className="card-head">
            <div>
              <h2>Товаров по брендам</h2>
              <p>Топ {TOP_N} брендов по количеству товаров</p>
            </div>
          </header>
          <div className="card-body">
            {loading && <span className="skeleton" style={{ display: 'block', height: 220 }} />}
            {!loading && topBrands.length === 0 && <p className="muted">У товаров пока не указаны бренды.</p>}
            {!loading && topBrands.length > 0 && <BarList items={topBrands} />}
          </div>
        </section>
      </div>
    </>
  )
}
