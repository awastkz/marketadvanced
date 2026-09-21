import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { identityAdmin } from '../../../api/admin/identity'
import type { UserDetails } from '../../../api/admin/identityTypes'
import { useLoad } from '../../../utils/useLoad'
import { errorMessage, formatDateTime } from '../../../utils/format'
import { toast } from '../../../stores/toast'
import Alert from '../../../components/Alert'
import Avatar from '../../../components/Avatar'
import Toggle from '../../../components/admin/Toggle'
import ConfirmDialog from '../../../components/admin/ConfirmDialog'
import { IconChevronLeft, IconSave, IconTrash } from '../../../components/icons'

interface FormState {
  firstName: string
  lastName: string
  phone: string
}

function fromUser(u: UserDetails | null): FormState {
  return { firstName: u?.firstName ?? '', lastName: u?.lastName ?? '', phone: u?.phone ?? '' }
}

export default function UserDetailView() {
  const { id } = useParams()
  const userId = Number(id)
  const navigate = useNavigate()

  const user = useLoad(() => identityAdmin.users.get(userId), [userId])

  const [form, setForm] = useState<FormState>(() => fromUser(null))
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [blocking, setBlocking] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [revoking, setRevoking] = useState<number | null>(null)

  useEffect(() => {
    if (user.data) setForm(fromUser(user.data))
  }, [user.data])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSaveError(null)
    try {
      const updated = await identityAdmin.users.update(userId, form)
      user.setData(updated)
      toast.success('Изменения сохранены')
    } catch (err) {
      setSaveError(errorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  async function toggleBlocked() {
    if (!user.data) return
    setBlocking(true)
    try {
      const updated = await identityAdmin.users.setBlocked(userId, !user.data.isBlocked)
      user.setData(updated)
      toast.success(updated.isBlocked ? 'Пользователь заблокирован' : 'Пользователь разблокирован')
    } catch (err) {
      toast.error(errorMessage(err))
    } finally {
      setBlocking(false)
    }
  }

  async function revokeSession(sessionId: number) {
    setRevoking(sessionId)
    try {
      await identityAdmin.users.revokeSession(userId, sessionId)
      user.setData((prev) => (prev ? { ...prev, sessions: prev.sessions.map((s) => (s.id === sessionId ? { ...s, isRevoked: true } : s)) } : prev))
      toast.success('Сессия отозвана')
    } catch (err) {
      toast.error(errorMessage(err))
    } finally {
      setRevoking(null)
    }
  }

  async function onDelete() {
    await identityAdmin.users.remove(userId)
    toast.success('Пользователь удалён')
    navigate('/admin/users', { replace: true })
  }

  if (user.error) {
    return (
      <>
        <BackLink />
        <Alert kind="error">{user.error}</Alert>
      </>
    )
  }

  const u = user.data

  return (
    <form onSubmit={onSubmit} noValidate>
      <BackLink />
      <div className="page-head">
        <div className="product-cell">
          <Avatar src={u?.avatarUrl} name={u ? [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email : undefined} size={44} />
          <div>
            <span className="eyebrow">Пользователь</span>
            <h1>{u ? u.email : '…'}</h1>
            {u && <p>Зарегистрирован {formatDateTime(u.createdAt)}</p>}
          </div>
        </div>
        <div className="page-actions">
          <button type="button" className="btn btn-ghost is-danger" onClick={() => setConfirmDelete(true)} disabled={!u}>
            <IconTrash />
            Удалить
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving || !u}>
            <IconSave />
            {saving ? 'Сохраняем…' : 'Сохранить'}
          </button>
        </div>
      </div>

      {saveError && <Alert kind="error">{saveError}</Alert>}

      <div className="edit-grid">
        <div className="edit-main">
          <section className="card">
            <div className="form-section">
              <h2>Профиль</h2>
              <p>Данные видны пользователю в личном кабинете</p>
              <div className="field-row">
                <div className="field">
                  <label htmlFor="firstName">Имя</label>
                  <input id="firstName" className="input" value={form.firstName} onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))} disabled={!u} />
                </div>
                <div className="field">
                  <label htmlFor="lastName">Фамилия</label>
                  <input id="lastName" className="input" value={form.lastName} onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))} disabled={!u} />
                </div>
              </div>
              <div className="field">
                <label htmlFor="phone">Телефон</label>
                <input id="phone" className="input" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="+7 700 000 00 00" disabled={!u} />
              </div>
              <div className="field">
                <label>Email</label>
                <input className="input" value={u?.email ?? ''} disabled />
                <span className="field-hint">Email нельзя изменить из админки</span>
              </div>
            </div>
          </section>

          <section className="card">
            <div className="form-section">
              <h2>Сессии</h2>
              <p>Устройства, с которых выполнялся вход</p>
              {u && u.sessions.length === 0 && <p className="muted small">Активных сессий нет</p>}
              {u && u.sessions.length > 0 && (
                <div className="table-wrap">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Устройство</th>
                        <th>Вход</th>
                        <th>Истекает</th>
                        <th>Статус</th>
                        <th className="actions" />
                      </tr>
                    </thead>
                    <tbody>
                      {u.sessions.map((s) => (
                        <tr key={s.id}>
                          <td>{s.userAgent ?? s.deviceId}</td>
                          <td className="muted">{formatDateTime(s.createdAt)}</td>
                          <td className="muted">{formatDateTime(s.expiresAt)}</td>
                          <td>
                            <span className={`pill ${s.isRevoked ? 'pill-muted' : 'pill-success'}`}>{s.isRevoked ? 'Отозвана' : 'Активна'}</span>
                          </td>
                          <td className="actions">
                            {!s.isRevoked && (
                              <button type="button" className="btn btn-ghost btn-sm is-danger" onClick={() => revokeSession(s.id)} disabled={revoking === s.id}>
                                {revoking === s.id ? 'Отзываем…' : 'Отозвать'}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        </div>

        <aside className="edit-side">
          <section className="card">
            <div className="form-section">
              <h2>Доступ</h2>
              <p>Заблокированный пользователь не может войти</p>
              <div className="publish-row">
                <Toggle checked={!!u?.isBlocked} onChange={toggleBlocked} disabled={blocking || !u} label={u?.isBlocked ? 'Заблокирован' : 'Активен'} />
                <span className={`pill ${u?.isBlocked ? 'pill-danger' : 'pill-success'}`}>{u?.isBlocked ? 'Блок' : 'Ок'}</span>
              </div>
            </div>
          </section>

          {u && (
            <section className="card">
              <div className="form-section">
                <h2>Сводка</h2>
                <dl className="kv">
                  <div>
                    <dt>ID</dt>
                    <dd>#{u.id}</dd>
                  </div>
                  <div>
                    <dt>Сессий</dt>
                    <dd>{u.sessions.filter((s) => !s.isRevoked).length}</dd>
                  </div>
                </dl>
              </div>
            </section>
          )}
        </aside>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Удалить пользователя?"
        text="Аккаунт и все связанные данные будут удалены безвозвратно."
        onConfirm={onDelete}
        onClose={() => setConfirmDelete(false)}
      />
    </form>
  )
}

function BackLink() {
  return (
    <Link to="/admin/users" className="back-link">
      <IconChevronLeft />
      К списку пользователей
    </Link>
  )
}
