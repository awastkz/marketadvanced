import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/auth'

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
    <div className="auth-page">
      <form className="auth-card" onSubmit={onSubmit}>
        <h1>Регистрация</h1>

        {displayedError && <p className="error-message">{displayedError}</p>}

        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="password">Пароль</label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="confirmPassword">Повторите пароль</label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <button className="primary" type="submit" disabled={submitting || passwordsMismatch}>
          {submitting ? 'Создаём аккаунт…' : 'Зарегистрироваться'}
        </button>

        <p className="auth-switch">
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </p>
      </form>
    </div>
  )
}
