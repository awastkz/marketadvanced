import { useToastStore } from '../stores/toast'
import { IconAlert, IconCheck, IconX } from './icons'

export default function Toaster() {
  const toasts = useToastStore((s) => s.toasts)
  const dismiss = useToastStore((s) => s.dismiss)

  if (!toasts.length) return null

  return (
    <div className="toaster" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.kind}`} role={t.kind === 'error' ? 'alert' : 'status'}>
          {t.kind === 'error' ? <IconAlert /> : <IconCheck />}
          <span>{t.text}</span>
          <button type="button" className="toast-close" onClick={() => dismiss(t.id)} aria-label="Закрыть">
            <IconX />
          </button>
        </div>
      ))}
    </div>
  )
}
