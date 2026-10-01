import { useState } from 'react'
import { Link } from 'react-router-dom'
import AppShell from '../components/AppShell'
import ProductCard from '../components/ProductCard'
import ProductQuickView from '../components/ProductQuickView'
import { useAuthStore } from '../stores/auth'
import { cartItemCount, useCartStore } from '../stores/cart'
import * as catalogApi from '../api/catalog'
import { useLoad } from '../utils/useLoad'
import { flattenTree } from '../utils/categories'
import { IconArrowRight, IconBag, IconCart, IconGrid, IconUser } from '../components/icons'

const POPULAR_COUNT = 8

function greeting() {
  const h = new Date().getHours()
  if (h < 6) return 'Доброй ночи'
  if (h < 12) return 'Доброе утро'
  if (h < 18) return 'Добрый день'
  return 'Добрый вечер'
}

export default function HomeView() {
  const user = useAuthStore((s) => s.user)
  const cartCount = useCartStore((s) => cartItemCount(s.cart))
  const [openProductSlug, setOpenProductSlug] = useState<string | null>(null)

  const categories = useLoad(() => catalogApi.listCategories(), [])
  const topCategories = categories.data ? flattenTree(categories.data).filter((c) => c.depth === 0).slice(0, 8) : []

  const products = useLoad(
    () => catalogApi.searchProducts({ page: 1, pageSize: POPULAR_COUNT }),
    [],
  )

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' })
    : '—'

  return (
    <AppShell>
      {user ? (
        <section className="hero">
          <span className="eyebrow" style={{ color: 'rgba(255,255,255,.8)' }}>
            Личный кабинет
          </span>
          <h1>{greeting()}!</h1>
          <p>
            Вы вошли как <strong>{user.email}</strong>. Заполните профиль, чтобы продавцы и покупатели видели, с кем
            имеют дело.
          </p>
          <div className="hero-actions">
            <Link to="/profile" className="btn btn-primary">
              Открыть профиль
              <IconArrowRight />
            </Link>
          </div>
        </section>
      ) : (
        <section className="hero">
          <span className="eyebrow" style={{ color: 'rgba(255,255,255,.8)' }}>
            MarketAdvanced
          </span>
          <h1>{greeting()}!</h1>
          <p>Выбирайте товары и оформляйте заказ без регистрации. Войдите, чтобы видеть историю заказов.</p>
          <div className="hero-actions">
            <Link to="/catalog" className="btn btn-primary">
              Перейти в каталог
              <IconArrowRight />
            </Link>
            <Link to="/login" className="btn btn-ghost">
              Войти
            </Link>
          </div>
        </section>
      )}

      <div className="tiles">
        {user && (
          <Link to="/profile" className="card tile">
            <span className="tile-icon">
              <IconUser />
            </span>
            <h3>Профиль</h3>
            <p>Имя, телефон, фотография. Всё, что видят другие участники площадки.</p>
            <span className="tile-meta">Редактировать →</span>
          </Link>
        )}

        <Link to="/cart" className="card tile">
          {cartCount > 0 && <span className="badge badge-accent">{cartCount}</span>}
          <span className="tile-icon">
            <IconCart />
          </span>
          <h3>Корзина</h3>
          <p>{cartCount > 0 ? `Товаров в корзине: ${cartCount}` : 'Пока пусто — добавьте что-нибудь.'}</p>
          <span className="tile-meta">Перейти в корзину →</span>
        </Link>

        <Link to="/catalog" className="card tile">
          <span className="tile-icon">
            <IconGrid />
          </span>
          <h3>Каталог</h3>
          <p>Все товары площадки: категории, поиск и покупка в пару кликов.</p>
          <span className="tile-meta">Смотреть каталог →</span>
        </Link>

        <div className="card tile is-soon">
          <span className="badge">Скоро</span>
          <span className="tile-icon">
            <IconBag />
          </span>
          <h3>Заказы</h3>
          <p>История покупок и продаж, статусы доставки и уведомления.</p>
        </div>

        {user && (
          <div className="card tile">
            <h3>Аккаунт</h3>
            <dl className="kv">
              <div>
                <dt>ID</dt>
                <dd>#{user?.id}</dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>{user?.email}</dd>
              </div>
              <div>
                <dt>С нами с</dt>
                <dd>{memberSince}</dd>
              </div>
            </dl>
          </div>
        )}
      </div>

      {topCategories.length > 0 && (
        <section className="home-section">
          <div className="home-section-head">
            <h2>Категории</h2>
            <Link to="/catalog" className="tile-meta">
              Весь каталог →
            </Link>
          </div>
          <nav className="home-categories" aria-label="Категории товаров">
            {topCategories.map((c) => (
              <Link key={c.id} to={`/catalog?category=${c.id}`} className="home-category-chip">
                {c.name}
              </Link>
            ))}
          </nav>
        </section>
      )}

      {(products.loading || (products.data && products.data.items.length > 0)) && (
        <section className="home-section">
          <div className="home-section-head">
            <h2>Товары</h2>
            <Link to="/catalog" className="tile-meta">
              Весь каталог →
            </Link>
          </div>
          <div className="product-grid">
            {products.loading &&
              Array.from({ length: 4 }).map((_, i) => (
                <div className="card product-card-skeleton" key={i}>
                  <span className="skeleton" style={{ display: 'block', height: 160 }} />
                </div>
              ))}
            {!products.loading &&
              products.data?.items.map((p) => <ProductCard key={p.id} product={p} onOpen={setOpenProductSlug} />)}
          </div>
        </section>
      )}

      <ProductQuickView productSlug={openProductSlug} onClose={() => setOpenProductSlug(null)} />
    </AppShell>
  )
}
