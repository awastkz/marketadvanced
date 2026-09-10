import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { useAuthStore } from '../stores/auth'
import * as userApi from '../api/user'
import AppHeader from '../components/AppHeader'

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
    <div>
      <AppHeader />
      <main className="profile-page">
        <div className="profile-card">
          <h1>Профиль</h1>

          <div className="profile-avatar">
            <div className="profile-avatar-inner">
              {avatarPreviewUrl || avatarUrl ? (
                <img src={avatarPreviewUrl || avatarUrl} alt="Аватар" className="profile-avatar-img" />
              ) : (
                <div className="profile-avatar-placeholder">
                  {(firstName || email || '?').charAt(0).toUpperCase()}
                </div>
              )}

              <label
                htmlFor="avatarFile"
                className="avatar-action avatar-action-upload"
                title="Загрузить фото"
                aria-label="Загрузить фото"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                  <circle cx="12" cy="13" r="3" />
                </svg>
              </label>

              {(avatarPreviewUrl || avatarUrl) && (
                <button
                  type="button"
                  className="avatar-action avatar-action-remove"
                  title="Удалить фото"
                  aria-label="Удалить фото"
                  disabled={loading || saving || removingAvatar}
                  onClick={onRemoveAvatar}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 6h18" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    <line x1="10" y1="11" x2="10" y2="17" />
                    <line x1="14" y1="11" x2="14" y2="17" />
                  </svg>
                </button>
              )}
            </div>

            <input
              id="avatarFile"
              ref={avatarFileInputRef}
              type="file"
              accept="image/*"
              className="avatar-file-input"
              disabled={loading}
              onChange={onAvatarFileChange}
            />
          </div>

          <dl className="profile-fields">
            <div className="profile-field">
              <dt>ID</dt>
              <dd>{authUser?.id}</dd>
            </div>
            {memberSince && (
              <div className="profile-field">
                <dt>Дата регистрации</dt>
                <dd>{memberSince}</dd>
              </div>
            )}
          </dl>

          <form className="profile-edit" onSubmit={onSave}>
            {error && <p className="error-message">{error}</p>}
            {saved && <p className="success-message">Сохранено</p>}

            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                disabled={loading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="firstName">Имя</label>
              <input
                id="firstName"
                type="text"
                disabled={loading}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="lastName">Фамилия</label>
              <input
                id="lastName"
                type="text"
                disabled={loading}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="phone">Телефон</label>
              <input
                id="phone"
                type="tel"
                disabled={loading}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="gender">Пол</label>
              <select
                id="gender"
                disabled={loading}
                value={gender}
                onChange={(e) => setGender(Number(e.target.value))}
              >
                <option value={1}>Мужской</option>
                <option value={2}>Женский</option>
              </select>
            </div>

            <button className="primary" type="submit" disabled={loading || saving}>
              {saving ? 'Сохраняем…' : 'Сохранить'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
