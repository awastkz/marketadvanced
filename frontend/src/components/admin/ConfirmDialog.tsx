import { useState } from 'react'
import Modal from './Modal'
import Alert from '../Alert'
import { errorMessage } from '../../utils/format'

interface ConfirmDialogProps {
  open: boolean
  title: string
  text: string
  confirmLabel?: string
  onConfirm: () => Promise<void> | void
  onClose: () => void
}

export default function ConfirmDialog({ open, title, text, confirmLabel = 'Удалить', onConfirm, onClose }: ConfirmDialogProps) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function confirm() {
    setBusy(true)
    setError(null)
    try {
      await onConfirm()
      onClose()
    } catch (e) {
      setError(errorMessage(e))
    } finally {
      setBusy(false)
    }
  }

  function close() {
    if (busy) return
    setError(null)
    onClose()
  }

  return (
    <Modal
      open={open}
      title={title}
      onClose={close}
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={close} disabled={busy}>
            Отмена
          </button>
          <button type="button" className="btn btn-danger" onClick={confirm} disabled={busy}>
            {busy ? 'Удаляем…' : confirmLabel}
          </button>
        </>
      }
    >
      {error && <Alert kind="error">{error}</Alert>}
      <p className="modal-text">{text}</p>
    </Modal>
  )
}
