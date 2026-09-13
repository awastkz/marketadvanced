import type { ReactNode } from 'react'
import Logo from './Logo'
import { IconBag, IconShield, IconZap } from './icons'

interface AuthLayoutProps {
  title: string
  lead: string
  children: ReactNode
}

export default function AuthLayout({ title, lead, children }: AuthLayoutProps) {
  return (
    <div className="auth-layout">
      <aside className="auth-brand">
        <Logo to="/login" />

        <div className="auth-brand-copy">
          <h2>Маркетплейс, который растёт вместе с вами</h2>
          <p>Один аккаунт для покупок, продаж и управления профилем. Быстро, безопасно, без лишних шагов.</p>
          <ul className="auth-features">
            <li>
              <IconShield />
              Защищённый вход и обновление сессии
            </li>
            <li>
              <IconBag />
              Каталог и заказы в одном месте
            </li>
            <li>
              <IconZap />
              Мгновенное обновление профиля
            </li>
          </ul>
        </div>

        <div className="auth-brand-foot">© {new Date().getFullYear()} MarketAdvanced</div>
      </aside>

      <main className="auth-panel">
        <div className="auth-card">
          <div className="auth-mobile-brand">
            <Logo to="/login" size="lg" />
          </div>
          <h1>{title}</h1>
          <p className="auth-card-lead">{lead}</p>
          {children}
        </div>
      </main>
    </div>
  )
}
