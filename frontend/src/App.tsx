import { useEffect } from 'react'
import { Route, Routes } from 'react-router-dom'
import { useAuthStore } from './stores/auth'
import { RequireAuth } from './router/RequireAuth'
import { GuestOnly } from './router/GuestOnly'
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
