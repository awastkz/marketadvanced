import { useEffect } from 'react'
import { Route, Routes } from 'react-router-dom'
import { useAuthStore } from './stores/auth'
import { RequireAuth } from './router/RequireAuth'
import { GuestOnly } from './router/GuestOnly'
import { RequireAdmin } from './router/RequireAdmin'
import AdminShell from './components/admin/AdminShell'
import DashboardView from './views/admin/DashboardView'
import ImportView from './views/admin/import/ImportView'
import AnalyticsView from './views/admin/analytics/AnalyticsView'
import ProductsView from './views/admin/ProductsView'
import ProductEditView from './views/admin/ProductEditView'
import CategoriesView from './views/admin/CategoriesView'
import BrandsView from './views/admin/BrandsView'
import AttributesView from './views/admin/AttributesView'
import UsersView from './views/admin/users/UsersView'
import UserDetailView from './views/admin/users/UserDetailView'
import CartsView from './views/admin/carts/CartsView'
import CartDetailView from './views/admin/carts/CartDetailView'
import OrdersView from './views/admin/orders/OrdersView'
import OrderDetailView from './views/admin/orders/OrderDetailView'
import PaymentsView from './views/admin/payments/PaymentsView'
import PaymentDetailView from './views/admin/payments/PaymentDetailView'
import DictionariesView from './views/admin/dictionaries/DictionariesView'
import HomeView from './views/HomeView'
import ProfileView from './views/ProfileView'
import CartView from './views/CartView'
import CatalogView from './views/CatalogView'
import LoginView from './views/LoginView'
import RegisterView from './views/RegisterView'

function App() {
  const initialized = useAuthStore((s) => s.initialized)
  const initialize = useAuthStore((s) => s.initialize)

  useEffect(() => {
    initialize()
  }, [initialize])

  if (!initialized) return null

  return (
    <Routes>
      <Route
        path="/"
        element={
          <RequireAuth>
            <HomeView />
          </RequireAuth>
        }
      />
      <Route
        path="/profile"
        element={
          <RequireAuth>
            <ProfileView />
          </RequireAuth>
        }
      />
      <Route
        path="/catalog"
        element={
          <RequireAuth>
            <CatalogView />
          </RequireAuth>
        }
      />
      <Route
        path="/cart"
        element={
          <RequireAuth>
            <CartView />
          </RequireAuth>
        }
      />
      <Route
        path="/admin"
        element={
          <RequireAuth>
            <RequireAdmin>
              <AdminShell />
            </RequireAdmin>
          </RequireAuth>
        }
      >
        <Route index element={<DashboardView />} />
        <Route path="products" element={<ProductsView />} />
        <Route path="products/new" element={<ProductEditView />} />
        <Route path="products/:id" element={<ProductEditView />} />
        <Route path="categories" element={<CategoriesView />} />
        <Route path="brands" element={<BrandsView />} />
        <Route path="attributes" element={<AttributesView />} />
        <Route path="users" element={<UsersView />} />
        <Route path="users/:id" element={<UserDetailView />} />
        <Route path="carts" element={<CartsView />} />
        <Route path="carts/:id" element={<CartDetailView />} />
        <Route path="orders" element={<OrdersView />} />
        <Route path="orders/:id" element={<OrderDetailView />} />
        <Route path="payments" element={<PaymentsView />} />
        <Route path="payments/:id" element={<PaymentDetailView />} />
        <Route path="dictionaries" element={<DictionariesView />} />
        <Route path="import" element={<ImportView />} />
        <Route path="analytics" element={<AnalyticsView />} />
      </Route>
      <Route
        path="/login"
        element={
          <GuestOnly>
            <LoginView />
          </GuestOnly>
        }
      />
      <Route
        path="/register"
        element={
          <GuestOnly>
            <RegisterView />
          </GuestOnly>
        }
      />
    </Routes>
  )
}

export default App
