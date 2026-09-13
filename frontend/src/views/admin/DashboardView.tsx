import { Link } from 'react-router-dom'
import { catalogAdmin } from '../../api/admin/catalog'
import { useLoad } from '../../utils/useLoad'
import { formatDate, formatMoney } from '../../utils/format'
import Alert from '../../components/Alert'
import { IconArrowRight, IconBox, IconImage, IconLayers, IconPlus, IconTag } from '../../components/icons'

export default function DashboardView() {
  const { data, loading, error } = useLoad(
    async () => {
      const [recent, active, categories, brands] = await Promise.all([
        catalogAdmin.products.list({ page: 1, pageSize: 6 }),
        catalogAdmin.products.list({ page: 1, pageSize: 1, isActive: true }),
        catalogAdmin.categories.list(),
        catalogAdmin.brands.list(),
      ])
      return { recent, active, categories, brands }
    },
    [],
  )

  const stats = [
    { label: 'Товаров', value: data?.recent.total, icon: IconBox, to: '/admin/products' },
    { label: 'В продаже', value: data?.active.total, icon: IconTag, to: '/admin/products?status=active' },
    { label: 'Категорий', value: data?.categories.length, icon: IconLayers, to: '/admin/categories' },
    { label: 'Брендов', value: data?.brands.length, icon: IconTag, to: '/admin/brands' },
  ]

  return (
    <>
      <div className="page-head">
        <div>
          <span className="eyebrow">Панель управления</span>
          <h1>Обзор</h1>
          <p>Что происходит в каталоге прямо сейчас.</p>
        </div>
        <div className="page-actions">
          <Link to="/admin/products/new" className="btn btn-primary">
            <IconPlus />
            Новый товар
          </Link>
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

      <div className="dash-grid">
        <section className="card">
          <header className="card-head">
            <div>
              <h2>Недавно обновлённые</h2>
              <p>Последние изменения в товарах</p>
            </div>
            <Link to="/admin/products" className="btn btn-ghost btn-sm">
              Все товары
              <IconArrowRight />
            </Link>
          </header>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Товар</th>
                  <th>Категория</th>
                  <th className="num">Цена</th>
                  <th>Обновлён</th>
                </tr>
              </thead>
              <tbody>
                {loading &&
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={4}>
                        <span className="skeleton" />
                      </td>
                    </tr>
                  ))}
                {data?.recent.items.map((p) => (
                  <tr key={p.id} className="is-link" onClick={() => {}}>
                    <td>
                      <Link to={`/admin/products/${p.id}`} className="product-cell">
                        <span className="thumb">{p.imageUrl ? <img src={p.imageUrl} alt="" /> : <IconImage />}</span>
                        <span className="product-cell-text">
                          <span className="product-cell-name">{p.name}</span>
                          <span className="product-cell-sub">{p.slug}</span>
                        </span>
                      </Link>
                    </td>
                    <td>{p.categoryName}</td>
                    <td className="num">{formatMoney(p.minPrice)}</td>
                    <td className="muted">{formatDate(p.updatedAt ?? p.createdAt)}</td>
                  </tr>
                ))}
                {!loading && data && data.recent.items.length === 0 && (
                  <tr>
                    <td colSpan={4} className="muted">
                      Товаров пока нет
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="card">
          <header className="card-head">
            <div>
              <h2>Быстрые действия</h2>
              <p>Частые задачи сотрудников</p>
            </div>
          </header>
          <div className="quick-actions">
            <Link to="/admin/products/new" className="quick-action">
              <span className="tile-icon">
                <IconBox />
              </span>
              <span>
                <strong>Добавить товар</strong>
                <small>Название, варианты, фото, характеристики</small>
              </span>
              <IconArrowRight />
            </Link>
            <Link to="/admin/categories" className="quick-action">
              <span className="tile-icon">
                <IconLayers />
              </span>
              <span>
                <strong>Настроить категории</strong>
                <small>Дерево разделов и порядок вывода</small>
              </span>
              <IconArrowRight />
            </Link>
            <Link to="/admin/brands" className="quick-action">
              <span className="tile-icon">
                <IconTag />
              </span>
              <span>
                <strong>Бренды</strong>
                <small>Логотипы и описания производителей</small>
              </span>
              <IconArrowRight />
            </Link>
          </div>
        </section>
      </div>
    </>
  )
}
