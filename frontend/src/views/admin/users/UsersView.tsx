import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { identityAdmin } from '../../../api/admin/identity'
import { useLoad } from '../../../utils/useLoad'
import { formatDate, formatDateTime } from '../../../utils/format'
import Alert from '../../../components/Alert'
import Avatar from '../../../components/Avatar'
import Pagination from '../../../components/admin/Pagination'
import EmptyState from '../../../components/admin/EmptyState'
import { IconSearch, IconUser, IconX } from '../../../components/icons'

const PAGE_SIZE = 20

export default function UsersView() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()

  const search = params.get('q') ?? ''
  const status = (params.get('status') as 'all' | 'active' | 'blocked') ?? 'all'
  const page = Number(params.get('page') ?? '1') || 1

  const [searchInput, setSearchInput] = useState(search)

  function patch(next: Record<string, string | null>) {
    const p = new URLSearchParams(params)
    for (const [k, v] of Object.entries(next)) {
      if (v == null || v === '' || (k === 'page' && v === '1') || (k === 'status' && v === 'all')) p.delete(k)
      else p.set(k, v)
    }
    setParams(p, { replace: true })
  }

  useEffect(() => {
    const t = setTimeout(() => {
      if (searchInput !== search) patch({ q: searchInput, page: null })
    }, 300)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput])

  const list = useLoad(() => identityAdmin.users.list({ search, status, page, pageSize: PAGE_SIZE }), [search, status, page])

  const hasFilters = !!search || status !== 'all'

  return (
    <>
      <div className="page-head">
        <div>
          <span className="eyebrow">Пользователи</span>
          <h1>Клиенты</h1>
          <p>{list.data ? `${list.data.total} пользователей` : 'Все зарегистрированные пользователи'}</p>
        </div>
      </div>

      <div className="toolbar">
        <div className="control toolbar-search">
          <IconSearch />
          <input className="input" placeholder="Поиск по имени или email" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
          {searchInput && (
            <button type="button" className="input-affix" onClick={() => setSearchInput('')} aria-label="Очистить">
              <IconX />
            </button>
          )}
        </div>
        <div className="segmented toolbar-status">
          {[
            ['all', 'Все'],
            ['active', 'Активные'],
            ['blocked', 'Заблокированные'],
          ].map(([v, l]) => (
            <label key={v}>
              <input type="radio" name="status" value={v} checked={status === v} onChange={() => patch({ status: v, page: null })} />
              {l}
            </label>
          ))}
        </div>
      </div>

      {list.error && <Alert kind="error">{list.error}</Alert>}

      <div className="card">
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Пользователь</th>
                <th>Телефон</th>
                <th>Статус</th>
                <th>Регистрация</th>
                <th>Последний вход</th>
                <th className="actions" />
              </tr>
            </thead>
            <tbody>
              {list.loading &&
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6}>
                      <span className="skeleton" />
                    </td>
                  </tr>
                ))}
              {!list.loading &&
                list.data?.items.map((u) => (
                  <tr key={u.id} className="is-link" onClick={() => navigate(`/admin/users/${u.id}`)}>
                    <td>
                      <span className="product-cell">
                        <Avatar src={u.avatarUrl} name={u.fullName ?? u.email} size={36} />
                        <span className="product-cell-text">
                          <span className="product-cell-name">{u.fullName ?? '—'}</span>
                          <span className="product-cell-sub">{u.email}</span>
                        </span>
                      </span>
                    </td>
                    <td className={u.phone ? undefined : 'muted'}>{u.phone ?? '—'}</td>
                    <td>
                      <span className={`pill ${u.isBlocked ? 'pill-danger' : 'pill-success'}`}>{u.isBlocked ? 'Заблокирован' : 'Активен'}</span>
                    </td>
                    <td className="muted">{formatDate(u.createdAt)}</td>
                    <td className="muted">{formatDateTime(u.lastLoginAt)}</td>
                    <td className="actions" />
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {!list.loading && list.data?.items.length === 0 && (
          <EmptyState
            icon={<IconUser />}
            title={hasFilters ? 'Ничего не найдено' : 'Пользователей пока нет'}
            text={hasFilters ? 'Попробуйте изменить фильтры или поисковый запрос.' : 'Здесь появятся все, кто зарегистрируется на площадке.'}
            action={
              hasFilters ? (
                <button type="button" className="btn btn-ghost" onClick={() => { setSearchInput(''); setParams({}, { replace: true }) }}>
                  Сбросить фильтры
                </button>
              ) : undefined
            }
          />
        )}

        {list.data && <Pagination page={page} pageSize={PAGE_SIZE} total={list.data.total} onChange={(p) => patch({ page: String(p) })} />}
      </div>
    </>
  )
}
