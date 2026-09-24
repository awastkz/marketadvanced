import { useEffect, type ReactNode } from 'react'
import AppHeader from './AppHeader'
import Toaster from './Toaster'
import { useCartStore } from '../stores/cart'

export default function AppShell({ children }: { children: ReactNode }) {
  const cart = useCartStore((s) => s.cart)
  const load = useCartStore((s) => s.load)

  // Корзина нужна и шапке (бейдж), и странице /cart — грузим один раз на сеанс.
  useEffect(() => {
    if (!cart) load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="app-shell">
      <AppHeader />
      <main className="app-main">{children}</main>
      <footer className="app-footer">© {new Date().getFullYear()} MarketAdvanced</footer>
      <Toaster />
    </div>
  )
}
