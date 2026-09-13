import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon: ReactNode
  title: string
  text?: string
  action?: ReactNode
}

export default function EmptyState({ icon, title, text, action }: EmptyStateProps) {
  return (
    <div className="empty">
      <span className="empty-icon">{icon}</span>
      <h3>{title}</h3>
      {text && <p>{text}</p>}
      {action && <div className="empty-action">{action}</div>}
    </div>
  )
}
