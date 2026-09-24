import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/auth'
import * as authApi from '../../api/auth'
import Logo from '../Logo'
import Avatar from '../Avatar'
import Toaster from '../Toaster'
import {
  IconBag,
  IconBarChart,
  IconBox,
  IconCard,
  IconExternal,
  IconFolder,
  IconHome,
  IconInbox,
  IconLayers,
  IconLogout,
  IconMenu,
  IconSliders,
  IconTag,
  IconUpload,
  IconUser,
  IconX,
} from '../icons'

const NAV = [
  { to: '/admin', label: 'Обзор', icon: IconHome, end: true },
  { to: '/admin/products', label: 'Товары', icon: IconBox },
  { to: '/admin/categories', label: 'Категории', icon: IconLayers },
  { to: '/admin/brands', label: 'Бренды', icon: IconTag },
  { to: '/admin/attributes', label: 'Атрибуты', icon: IconSliders },
  { to: '/admin/dictionaries', label: 'Справочники', icon: IconFolder },
  { to: '/admin/import', label: 'Импорт/экспорт', icon: IconUpload },
  { to: '/admin/analytics', label: 'Аналитика', icon: IconBarChart },
  { to: '/admin/orders', label: 'Заказы', icon: IconInbox },
  { to: '/admin/payments', label: 'Платежи', icon: IconCard },
  { to: '/admin/carts', label: 'Корзины', icon: IconBag },
  { to: '/admin/users', label: 'Пользователи', icon: IconUser },
]

export default function AdminShell() {
  const email = useAuthStore((s) => s.user?.email)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  async function onLogout() {
    try {
      await authApi.logout()
    } catch {
      // сессия уже невалидна — всё равно выходим локально
    }
    logout()
    navigate('/login')
  }

  const current = NAV.find((n) => (n.end ? location.pathname === n.to : location.pathname.startsWith(n.to)))

  return (
    <div className={`admin${open ? ' is-nav-open' : ''}`}>
      <aside className="admin-sidebar">
        <div className="admin-sidebar-head">
          <Logo to="/admin" />
          <span className="badge badge-accent">Админ</span>
          <button type="button" className="btn btn-ghost btn-icon admin-nav-close" onClick={() => setOpen(false)} aria-label="Закрыть меню">
            <IconX />
          </button>
        </div>

        <nav className="admin-nav" aria-label="Разделы админки">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => (isActive ? 'is-active' : undefined)}>
              <Icon />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar-foot">
          <NavLink to="/" className="admin-site-link">
            <IconExternal />
            Перейти на сайт
          </NavLink>
          <div className="admin-user">
            <Avatar name={email} size={32} />
            <span className="admin-user-email" title={email}>{email}</span>
            <button type="button" className="btn btn-ghost btn-icon btn-sm" onClick={onLogout} title="Выйти" aria-label="Выйти">
              <IconLogout />
            </button>
          </div>
        </div>
      </aside>

      <div className="admin-nav-backdrop" onClick={() => setOpen(false)} />

      <div className="admin-body">
        <header className="admin-topbar">
          <button type="button" className="btn btn-ghost btn-icon admin-nav-toggle" onClick={() => setOpen(true)} aria-label="Открыть меню">
            <IconMenu />
          </button>
          <span className="admin-topbar-title">{current?.label ?? 'Админка'}</span>
          {/* на сайдбар нельзя полагаться: на узких экранах он скрыт за гамбургером — здесь выход виден всегда */}
          <NavLink to="/" className="btn btn-ghost btn-sm admin-topbar-site-link">
            <IconExternal />
            <span>На сайт</span>
          </NavLink>
        </header>
        <main className="admin-main">
          <Outlet />
        </main>
      </div>

      <Toaster />
    </div>
  )
}
