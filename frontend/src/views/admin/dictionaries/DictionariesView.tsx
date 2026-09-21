import { useState, type FormEvent } from 'react'
import { dictionaryAdmin } from '../../../api/admin/dictionary'
import type { DictionaryEntry, DictionaryEntryApi, DictionaryEntryPayload } from '../../../api/admin/dictionaryTypes'
import { useLoad } from '../../../utils/useLoad'
import { errorMessage } from '../../../utils/format'
import { toast } from '../../../stores/toast'
import Alert from '../../../components/Alert'
import Modal from '../../../components/admin/Modal'
import ConfirmDialog from '../../../components/admin/ConfirmDialog'
import EmptyState from '../../../components/admin/EmptyState'
import { IconEdit, IconFolder, IconPlus, IconTrash } from '../../../components/icons'

type Kind = 'units' | 'countries' | 'tags'

const TABS: { kind: Kind; label: string; codeLabel: string; codePlaceholder: string }[] = [
  { kind: 'units', label: 'Единицы измерения', codeLabel: 'Код', codePlaceholder: 'kg' },
  { kind: 'countries', label: 'Страны', codeLabel: 'ISO-код', codePlaceholder: 'KZ' },
  { kind: 'tags', label: 'Теги', codeLabel: 'Slug', codePlaceholder: 'new' },
]

export default function DictionariesView() {
  const [kind, setKind] = useState<Kind>('units')
  const tab = TABS.find((t) => t.kind === kind)!

  return (
    <>
      <div className="page-head">
        <div>
          <span className="eyebrow">Справочники</span>
          <h1>Справочники каталога</h1>
          <p>Единицы измерения, страны производства и теги для товаров</p>
        </div>
      </div>

      <div className="segmented" style={{ maxWidth: 480, marginBottom: 16 }}>
        {TABS.map((t) => (
          <label key={t.kind}>
            <input type="radio" name="dictionary-tab" value={t.kind} checked={kind === t.kind} onChange={() => setKind(t.kind)} />
            {t.label}
          </label>
        ))}
      </div>

      <EntryList key={tab.kind} api={dictionaryAdmin[tab.kind]} title={tab.label} codeLabel={tab.codeLabel} codePlaceholder={tab.codePlaceholder} />
    </>
  )
}

function EntryList({ api, title, codeLabel, codePlaceholder }: { api: DictionaryEntryApi; title: string; codeLabel: string; codePlaceholder: string }) {
  const { data, loading, error, reload } = useLoad(() => api.list(), [api])
  const [editing, setEditing] = useState<{ entry: DictionaryEntry | null } | null>(null)
  const [toDelete, setToDelete] = useState<DictionaryEntry | null>(null)

  async function remove(entry: DictionaryEntry) {
    await api.remove(entry.id)
    toast.success(`«${entry.name}» удалено`)
    reload()
  }

  const rows = [...(data ?? [])].sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name))

  return (
    <>
      <div className="page-actions" style={{ justifyContent: 'flex-end', marginBottom: 12 }}>
        <button type="button" className="btn btn-primary" onClick={() => setEditing({ entry: null })}>
          <IconPlus />
          Добавить
        </button>
      </div>

      {error && <Alert kind="error">{error}</Alert>}

      <div className="card">
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Название</th>
                <th>{codeLabel}</th>
                <th className="num">Порядок</th>
                <th className="actions" />
              </tr>
            </thead>
            <tbody>
              {loading &&
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={4}>
                      <span className="skeleton" />
                    </td>
                  </tr>
                ))}
              {rows.map((e) => (
                <tr key={e.id} className="is-link" onClick={() => setEditing({ entry: e })}>
                  <td>
                    <span className="product-cell-name">{e.name}</span>
                  </td>
                  <td className="mono muted">{e.code}</td>
                  <td className="num">{e.sortOrder}</td>
                  <td className="actions" onClick={(ev) => ev.stopPropagation()}>
                    <button type="button" className="btn btn-ghost btn-icon btn-sm" title="Редактировать" onClick={() => setEditing({ entry: e })}>
                      <IconEdit />
                    </button>
                    <button type="button" className="btn btn-ghost btn-icon btn-sm is-danger" title="Удалить" onClick={() => setToDelete(e)}>
                      <IconTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && rows.length === 0 && (
          <EmptyState
            icon={<IconFolder />}
            title={`${title}: пока пусто`}
            text="Добавьте первую запись справочника."
            action={
              <button type="button" className="btn btn-primary" onClick={() => setEditing({ entry: null })}>
                <IconPlus />
                Добавить
              </button>
            }
          />
        )}
      </div>

      {editing && (
        <EntryModal
          api={api}
          entry={editing.entry}
          codeLabel={codeLabel}
          codePlaceholder={codePlaceholder}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null)
            reload()
          }}
        />
      )}

      <ConfirmDialog
        open={!!toDelete}
        title="Удалить запись?"
        text={`«${toDelete?.name}» будет удалено из справочника.`}
        onConfirm={() => (toDelete ? remove(toDelete) : undefined)}
        onClose={() => setToDelete(null)}
      />
    </>
  )
}

function EntryModal({
  api,
  entry,
  codeLabel,
  codePlaceholder,
  onClose,
  onSaved,
}: {
  api: DictionaryEntryApi
  entry: DictionaryEntry | null
  codeLabel: string
  codePlaceholder: string
  onClose: () => void
  onSaved: () => void
}) {
  const [form, setForm] = useState({ name: entry?.name ?? '', code: entry?.code ?? '', sortOrder: entry?.sortOrder ?? 0 })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!form.name.trim() || !form.code.trim()) {
      setError('Название и код обязательны')
      return
    }
    setBusy(true)
    setError(null)
    const payload: DictionaryEntryPayload = { name: form.name.trim(), code: form.code.trim(), sortOrder: form.sortOrder }
    try {
      if (entry) await api.update(entry.id, payload)
      else await api.create(payload)
      toast.success(entry ? 'Сохранено' : 'Добавлено')
      onSaved()
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal
      open
      title={entry ? 'Редактировать запись' : 'Новая запись'}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose} disabled={busy}>
            Отмена
          </button>
          <button type="submit" form="dict-entry-form" className="btn btn-primary" disabled={busy}>
            {busy ? 'Сохраняем…' : entry ? 'Сохранить' : 'Создать'}
          </button>
        </>
      }
    >
      <form id="dict-entry-form" onSubmit={submit} noValidate>
        {error && <Alert kind="error">{error}</Alert>}
        <div className="field">
          <label htmlFor="e-name">Название</label>
          <input id="e-name" className="input" value={form.name} autoFocus onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
        </div>
        <div className="field-row">
          <div className="field">
            <label htmlFor="e-code">{codeLabel}</label>
            <input id="e-code" className="input mono" value={form.code} placeholder={codePlaceholder} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} />
          </div>
          <div className="field">
            <label htmlFor="e-order">Порядок</label>
            <input id="e-order" type="number" className="input" value={form.sortOrder} onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))} />
          </div>
        </div>
      </form>
    </Modal>
  )
}
