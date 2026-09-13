import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../stores/auth'
import AuthLayout from '../components/AuthLayout'
import Alert from '../components/Alert'
import PasswordField from '../components/PasswordField'
import { IconMail } from '../components/icons'

export default function LoginView() {
  const login = useAuthStore((s) => s.login)
  const error = useAuthStore((s) => s.error)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await login(email, password)
      navigate(searchParams.get('redirect') || '/')
    } catch {
      // ошибка уже сохранена в auth.error
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout title="С возвращением" lead="Войдите, чтобы продолжить работу с MarketAdvanced.">
      <form onSubmit={onSubmit} noValidate={false}>
        {error && <Alert kind="error">{error}</Alert>}

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
          autoComplete="current-password"
          placeholder="••••••••"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="btn btn-primary btn-block" type="submit" disabled={submitting}>
          {submitting ? 'Входим…' : 'Войти'}
        </button>

        <p className="auth-switch">
          Нет аккаунта? <Link to="/register">Создать</Link>
        </p>
      </form>
    </AuthLayout>
  )
}
