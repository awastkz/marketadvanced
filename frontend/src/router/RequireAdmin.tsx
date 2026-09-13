import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../stores/auth'
import { isAdmin } from '../stores/auth'

export function RequireAdmin({ children }: { children: ReactNode }) {
  const user = useAuthStore((s) => s.user)

  if (!isAdmin(user)) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
