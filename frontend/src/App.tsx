import { useEffect } from 'react'
import { Route, Routes } from 'react-router-dom'
import { useAuthStore } from './stores/auth'
import { RequireAuth } from './router/RequireAuth'
import { GuestOnly } from './router/GuestOnly'
import { RequireAdmin } from './router/RequireAdmin'
import AdminShell from './components/admin/AdminShell'
import DashboardView from './views/admin/DashboardView'
import ProductsView from './views/admin/ProductsView'
import ProductEditView from './views/admin/ProductEditView'
import CategoriesView from './views/admin/CategoriesView'
import BrandsView from './views/admin/BrandsView'
import AttributesView from './views/admin/AttributesView'
import HomeView from './views/HomeView'
import ProfileView from './views/ProfileView'
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
