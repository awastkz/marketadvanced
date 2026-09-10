import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../stores/auth'

export function RequireAuth({ children }: { children: ReactNode }) {
  const location = useLocation()
  const isAuthenticated = useAuthStore((s) => !!s.accessToken && !!s.user)

  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />
  }

  return <>{children}</>
}
