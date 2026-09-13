import type { ReactNode } from 'react'
import AppHeader from './AppHeader'

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell">
      <AppHeader />
      <main className="app-main">{children}</main>
      <footer className="app-footer">© {new Date().getFullYear()} MarketAdvanced</footer>
    </div>
  )
}
