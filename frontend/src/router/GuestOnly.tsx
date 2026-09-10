import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../stores/auth'

export function GuestOnly({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((s) => !!s.accessToken && !!s.user)

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
