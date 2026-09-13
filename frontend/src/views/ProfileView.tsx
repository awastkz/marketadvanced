import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { useAuthStore } from '../stores/auth'
import * as userApi from '../api/user'
import AppShell from '../components/AppShell'
import Alert from '../components/Alert'
import Avatar from '../components/Avatar'
import { IconCamera, IconMail, IconPhone, IconTrash, IconUser } from '../components/icons'

function extractErrorMessage(e: unknown): string {
  if (typeof e === 'object' && e !== null && 'response' in e) {
    const response = (e as { response?: { data?: { errors?: Record<string, string[]>; message?: string } } })
      .response
    const firstFieldErrors = response?.data?.errors && Object.values(response.data.errors)[0]
    if (firstFieldErrors?.[0]) return firstFieldErrors[0]
    if (response?.data?.message) return response.data.message
  }
  return 'Не удалось сохранить профиль'
}

export default function ProfileView() {
  const authUser = useAuthStore((s) => s.user)

  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [gender, setGender] = useState(1)
  const [avatarUrl, setAvatarUrl] = useState('')
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)

  const avatarFileInputRef = useRef<HTMLInputElement>(null)
  const avatarObjectUrlRef = useRef<string | null>(null)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [removingAvatar, setRemovingAvatar] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const memberSince = authUser?.createdAt
    ? new Date(authUser.createdAt).toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null

  const fullName = [firstName, lastName].filter(Boolean).join(' ')
  const shownAvatar = avatarPreviewUrl || avatarUrl
  const busy = loading || saving || removingAvatar

  function clearAvatarPreview() {
    if (avatarObjectUrlRef.current) URL.revokeObjectURL(avatarObjectUrlRef.current)
    avatarObjectUrlRef.current = null
    setAvatarPreviewUrl('')
    setAvatarFile(null)
    if (avatarFileInputRef.current) avatarFileInputRef.current.value = ''
  }

  function applyProfile(data: userApi.UserProfile) {
    setEmail(data.email ?? '')
    setFirstName(data.firstName ?? '')
    setLastName(data.lastName ?? '')
    setPhone(data.phone ?? '')
    setGender(data.gender ?? 1)
    setAvatarUrl(data.avatarUrl ?? '')
    clearAvatarPreview()
  }

  function onAvatarFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Выберите файл изображения')
      e.target.value = ''
      return
    }

    setError(null)
    if (avatarObjectUrlRef.current) URL.revokeObjectURL(avatarObjectUrlRef.current)
    const objectUrl = URL.createObjectURL(file)
    avatarObjectUrlRef.current = objectUrl
    setAvatarPreviewUrl(objectUrl)
    setAvatarFile(file)
  }

  async function onRemoveAvatar() {
    // ещё не сохранённый локальный выбор — просто отменяем его, на сервер не ходим
    if (avatarFile) {
      clearAvatarPreview()
      return
    }
    if (!avatarUrl) return

    setError(null)
    setRemovingAvatar(true)
    try {
      const { data } = await userApi.removeAvatar()
      applyProfile(data)
    } catch (e) {
      setError(extractErrorMessage(e))
    } finally {
      setRemovingAvatar(false)
    }
  }

  useEffect(() => {
    return () => {
      if (avatarObjectUrlRef.current) URL.revokeObjectURL(avatarObjectUrlRef.current)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    userApi
      .getProfile()
      .then(({ data }) => {
        if (!cancelled) applyProfile(data)
      })
      .catch(() => {
        if (!cancelled) setError('Не удалось загрузить профиль')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function onSave(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSaved(false)
    setSaving(true)
    try {
      const { data } = await userApi.updateProfile({
        email,
        name: firstName,
        surname: lastName,
        phone,
        gender,
        avatar: avatarFile,
      })
      applyProfile(data)
      setSaved(true)
    } catch (e) {
      setError(extractErrorMessage(e))
    } finally {
      setSaving(false)
    }
  }

  return (
    <AppShell>
      <div className="page-head">
        <div>
          <span className="eyebrow">Аккаунт</span>
          <h1>Профиль</h1>
          <p>Как вас видят другие участники площадки.</p>
        </div>
      </div>

      <div className="profile-grid">
        <aside className="card profile-side">
          <div className="card-body">
            <Avatar
              src={shownAvatar || null}
              name={firstName || email}
              className={`profile-avatar${loading ? ' is-loading' : ''}`}
            />

            {loading ? (
              <>
                <span className="skeleton" style={{ width: 140, height: 18 }} />
                <span className="skeleton" style={{ width: 180, margin: '10px 0 22px' }} />
              </>
            ) : (
              <>
                <div className="profile-name">{fullName || 'Без имени'}</div>
                <div className="profile-email">{email}</div>
              </>
            )}

            <div className="profile-avatar-actions">
              <label htmlFor="avatarFile" className={`btn btn-ghost btn-sm${busy ? ' is-disabled' : ''}`}>
                <IconCamera />
                {shownAvatar ? 'Заменить фото' : 'Загрузить фото'}
              </label>
              {shownAvatar && (
                <button type="button" className="btn btn-danger btn-sm" disabled={busy} onClick={onRemoveAvatar}>
                  <IconTrash />
                  {removingAvatar ? 'Удаляем…' : avatarFile ? 'Отменить' : 'Удалить'}
                </button>
              )}
              <input
                id="avatarFile"
                ref={avatarFileInputRef}
                type="file"
                accept="image/*"
                className="visually-hidden"
                disabled={busy}
                onChange={onAvatarFileChange}
              />
            </div>

            {avatarFile && <span className="field-hint">Фото загрузится после сохранения</span>}

            <dl className="kv">
              <div>
                <dt>ID</dt>
                <dd>#{authUser?.id}</dd>
              </div>
              {memberSince && (
                <div>
                  <dt>Регистрация</dt>
                  <dd>{memberSince}</dd>
                </div>
              )}
            </dl>
          </div>
        </aside>

        <form className="card" onSubmit={onSave}>
          <section className="form-section">
            <h2>Контакты</h2>
            <p>Email используется для входа и уведомлений.</p>

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
                  disabled={loading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="phone">Телефон</label>
              <div className="control">
                <IconPhone />
                <input
                  id="phone"
                  className="input"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+7 700 000 00 00"
                  disabled={loading}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>
          </section>

          <section className="form-section">
            <h2>Личные данные</h2>
            <p>Имя показывается рядом с вашими объявлениями и отзывами.</p>

            <div className="field-row">
              <div className="field">
                <label htmlFor="firstName">Имя</label>
                <div className="control">
                  <IconUser />
                  <input
                    id="firstName"
                    className="input"
                    type="text"
                    autoComplete="given-name"
                    disabled={loading}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
              </div>

              <div className="field">
                <label htmlFor="lastName">Фамилия</label>
                <input
                  id="lastName"
                  className="input"
                  type="text"
                  autoComplete="family-name"
                  disabled={loading}
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>

            <div className="field">
              <span className="field-label">Пол</span>
              <div className="segmented" role="radiogroup" aria-label="Пол">
                <label>
                  <input
                    type="radio"
                    name="gender"
                    value={1}
                    checked={gender === 1}
                    disabled={loading}
                    onChange={() => setGender(1)}
                  />
                  Мужской
                </label>
                <label>
                  <input
                    type="radio"
                    name="gender"
                    value={2}
                    checked={gender === 2}
                    disabled={loading}
                    onChange={() => setGender(2)}
                  />
                  Женский
                </label>
              </div>
            </div>
          </section>

          <div className="form-actions">
            <span className={`status${saved ? ' is-success' : ''}`} aria-live="polite">
              {saving ? 'Сохраняем…' : saved ? 'Изменения сохранены' : ''}
            </span>
            <button className="btn btn-primary" type="submit" disabled={loading || saving}>
              {saving ? 'Сохраняем…' : 'Сохранить'}
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  )
}
