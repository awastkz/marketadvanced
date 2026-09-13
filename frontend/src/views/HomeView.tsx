import { Link } from 'react-router-dom'
import AppShell from '../components/AppShell'
import { useAuthStore } from '../stores/auth'
import { IconArrowRight, IconBag, IconGrid, IconUser } from '../components/icons'

function greeting() {
  const h = new Date().getHours()
  if (h < 6) return 'Доброй ночи'
  if (h < 12) return 'Доброе утро'
  if (h < 18) return 'Добрый день'
  return 'Добрый вечер'
}

export default function HomeView() {
  const user = useAuthStore((s) => s.user)

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' })
    : '—'

  return (
    <AppShell>
      <section className="hero">
        <span className="eyebrow" style={{ color: 'rgba(255,255,255,.8)' }}>
          Личный кабинет
        </span>
        <h1>{greeting()}!</h1>
        <p>
          Вы вошли как <strong>{user?.email}</strong>. Заполните профиль, чтобы продавцы и покупатели видели, с кем имеют
          дело.
        </p>
        <div className="hero-actions">
          <Link to="/profile" className="btn btn-primary">
            Открыть профиль
            <IconArrowRight />
          </Link>
        </div>
      </section>

      <div className="tiles">
        <Link to="/profile" className="card tile">
          <span className="tile-icon">
            <IconUser />
          </span>
          <h3>Профиль</h3>
          <p>Имя, телефон, фотография. Всё, что видят другие участники площадки.</p>
          <span className="tile-meta">Редактировать →</span>
        </Link>

        <div className="card tile is-soon">
          <span className="badge">Скоро</span>
          <span className="tile-icon">
            <IconGrid />
          </span>
          <h3>Каталог</h3>
          <p>Товары, категории и поиск по площадке появятся в следующем релизе.</p>
        </div>

        <div className="card tile is-soon">
          <span className="badge">Скоро</span>
          <span className="tile-icon">
            <IconBag />
          </span>
          <h3>Заказы</h3>
          <p>История покупок и продаж, статусы доставки и уведомления.</p>
        </div>

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
      </div>
    </AppShell>
  )
}
