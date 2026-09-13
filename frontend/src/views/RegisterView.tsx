import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/auth'
import AuthLayout from '../components/AuthLayout'
import Alert from '../components/Alert'
import PasswordField from '../components/PasswordField'
import { IconMail } from '../components/icons'

export default function RegisterView() {
  const register = useAuthStore((s) => s.register)
  const login = useAuthStore((s) => s.login)
  const authError = useAuthStore((s) => s.error)
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword
  const passwordTooShort = password.length > 0 && password.length < 8
  const displayedError = localError ?? authError

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setLocalError(null)

    if (password !== confirmPassword) {
      setLocalError('Пароли не совпадают')
      return
    }

    setSubmitting(true)
    try {
      await register(email, password, confirmPassword)
      await login(email, password)
      navigate('/')
    } catch {
      // ошибка уже сохранена в auth.error
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout title="Создать аккаунт" lead="Это займёт меньше минуты. Нужны только email и пароль.">
      <form onSubmit={onSubmit}>
        {displayedError && <Alert kind="error">{displayedError}</Alert>}

        <div className="field">
          <label htmlFor="email">Email</label>
          <div className="control">
            <IconMail />
            <input
              id="email"
              className="input"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <PasswordField
          id="password"
          label="Пароль"
          autoComplete="new-password"
          placeholder="Минимум 8 символов"
          minLength={8}
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          hint={passwordTooShort ? 'Пароль должен быть не короче 8 символов' : 'Не короче 8 символов'}
          hintIsError={passwordTooShort}
        />

        <PasswordField
          id="confirmPassword"
          label="Повторите пароль"
          autoComplete="new-password"
          placeholder="Ещё раз"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          hint={passwordsMismatch ? 'Пароли не совпадают' : undefined}
          hintIsError={passwordsMismatch}
        />

        <button className="btn btn-primary btn-block" type="submit" disabled={submitting || passwordsMismatch}>
          {submitting ? 'Создаём аккаунт…' : 'Зарегистрироваться'}
        </button>

        <p className="auth-switch">
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </p>
      </form>
    </AuthLayout>
  )
}
