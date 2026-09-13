import { useState, type InputHTMLAttributes } from 'react'
import { IconEye, IconEyeOff, IconLock } from './icons'

type PasswordFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string
  label: string
  hint?: string
  hintIsError?: boolean
}

export default function PasswordField({ id, label, hint, hintIsError, className, ...rest }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className="control">
        <IconLock />
        <input id={id} type={visible ? 'text' : 'password'} className={`input${className ? ` ${className}` : ''}`} {...rest} />
        <button
          type="button"
          className="input-affix"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Скрыть пароль' : 'Показать пароль'}
          tabIndex={-1}
        >
          {visible ? <IconEyeOff /> : <IconEye />}
        </button>
      </div>
      {hint && <span className={`field-hint${hintIsError ? ' is-error' : ''}`}>{hint}</span>}
    </div>
  )
}
