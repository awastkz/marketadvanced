import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/auth'
import * as userApi from '../api/user'

export default function AppHeader() {
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  async function onLogout() {
    try {
      await userApi.logout()
    } catch {
      // сервер недоступен или сессия уже невалидна — всё равно разлогиниваем локально
    }
    logout()
    navigate('/login')
  }

  return (
    <header className="app-header">
      <strong>MarketAdvanced</strong>
      <nav className="app-nav">
        <NavLink to="/" end className={({ isActive }) => (isActive ? 'router-link-active' : undefined)}>
          Главная
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) => (isActive ? 'router-link-active' : undefined)}>
          Профиль
        </NavLink>
      </nav>
      <button onClick={onLogout}>Выйти</button>
    </header>
  )
}
