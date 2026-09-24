import { NavLink, useNavigate } from 'react-router-dom'
import { isAdmin, useAuthStore } from '../stores/auth'
import { cartItemCount, useCartStore } from '../stores/cart'
import * as authApi from '../api/auth'
import Logo from './Logo'
import Avatar from './Avatar'
import { IconCart, IconLogout } from './icons'

export default function AppHeader() {
  const logout = useAuthStore((s) => s.logout)
  const email = useAuthStore((s) => s.user?.email)
  const admin = useAuthStore((s) => isAdmin(s.user))
  const cartCount = useCartStore((s) => cartItemCount(s.cart))
  const navigate = useNavigate()

  async function onLogout() {
    try {
      await authApi.logout()
    } catch {
      // сервер недоступен или сессия уже невалидна — всё равно разлогиниваем локально
    }
    logout()
    navigate('/login')
  }

  const navClass = ({ isActive }: { isActive: boolean }) => (isActive ? 'is-active' : undefined)

  return (
    <header className="app-header">
      <div className="app-header-inner">
        <Logo />

        <nav className="app-nav" aria-label="Основная навигация">
          <NavLink to="/" end className={navClass}>
            Главная
          </NavLink>
          <NavLink to="/catalog" className={navClass}>
            Каталог
          </NavLink>
          <NavLink to="/profile" className={navClass}>
            Профиль
          </NavLink>
          {admin && (
            <NavLink to="/admin" className={navClass}>
              Админка
            </NavLink>
          )}
        </nav>

        <div className="app-user">
          <NavLink to="/cart" className="btn btn-ghost btn-icon cart-nav-btn" title="Корзина" aria-label="Корзина">
            <IconCart />
            {cartCount > 0 && <span className="cart-nav-badge">{cartCount > 99 ? '99+' : cartCount}</span>}
          </NavLink>
          <NavLink to="/profile" className="app-user-chip" title={email}>
            <Avatar name={email} />
            <span>{email}</span>
          </NavLink>
          <button type="button" className="btn btn-ghost btn-icon" onClick={onLogout} title="Выйти" aria-label="Выйти">
            <IconLogout />
          </button>
        </div>
      </div>
    </header>
  )
}
