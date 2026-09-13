import type { ReactNode } from 'react'
import { IconAlert, IconCheck } from './icons'

interface AlertProps {
  kind: 'error' | 'success'
  children: ReactNode
}

export default function Alert({ kind, children }: AlertProps) {
  return (
    <div className={`alert alert-${kind}`} role={kind === 'error' ? 'alert' : 'status'}>
      {kind === 'error' ? <IconAlert /> : <IconCheck />}
      <div>{children}</div>
    </div>
  )
}
