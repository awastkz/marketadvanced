import { useEffect, useId, useState } from 'react'
import { IconTrash, IconUpload } from '../icons'

interface ImagePickerProps {
  label: string
  currentUrl: string | null
  file: File | null
  removed: boolean
  onFile: (file: File | null) => void
  onRemove: () => void
  hint?: string
  shape?: 'square' | 'wide'
}

/** Одиночное изображение с превью: для категории, логотипа бренда. */
export default function ImagePicker({ label, currentUrl, file, removed, onFile, onRemove, hint, shape = 'square' }: ImagePickerProps) {
  const id = useId()
  const [preview, setPreview] = useState<string | null>(null)

  useEffect(() => {
    if (!file) {
      setPreview(null)
      return
    }
    const url = URL.createObjectURL(file)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const shown = preview ?? (removed ? null : currentUrl)

  return (
    <div className="field">
      <span className="field-label">{label}</span>
      <div className={`image-picker is-${shape}`}>
        <label htmlFor={id} className="image-picker-drop">
          {shown ? <img src={shown} alt="" /> : (
            <span className="image-picker-placeholder">
              <IconUpload />
              <span>Выбрать файл</span>
            </span>
          )}
          <input id={id} type="file" accept="image/*" className="visually-hidden" onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
        </label>
        {shown && (
          <button type="button" className="btn btn-ghost btn-sm" onClick={onRemove}>
            <IconTrash />
            Убрать
          </button>
        )}
      </div>
      {hint && <span className="field-hint">{hint}</span>}
    </div>
  )
}
