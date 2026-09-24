import { useRef, useState } from 'react'
import { csvToRecords, downloadCsv } from '../../utils/csv'
import { toast } from '../../stores/toast'
import { errorMessage } from '../../utils/format'
import type { ImportResult } from '../../api/admin/importTypes'
import EmptyState from './EmptyState'
import { IconAlert, IconCheck, IconDownload, IconUpload } from '../icons'

const PREVIEW_LIMIT = 200

interface ParsedRow<T> {
  index: number
  raw: Record<string, string>
  value?: T
  error?: string
}

export interface ImportSpec<T> {
  key: string
  label: string
  description: string
  templateFilename: string
  templateHeader: string[]
  templateExample: (string | number)[]
  /** Валидация и приведение типов одной строки CSV. Ошибка — строка не пойдёт в импорт. */
  parseRow: (rec: Record<string, string>) => { value: T } | { error: string }
  doImport: (rows: T[]) => Promise<ImportResult>
}

export default function ImportPanel<T>({ spec }: { spec: ImportSpec<T> }) {
  const [fileName, setFileName] = useState<string | null>(null)
  const [rows, setRows] = useState<ParsedRow<T>[]>([])
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const validRows = rows.filter((r): r is ParsedRow<T> & { value: T } => r.value !== undefined)
  const invalidCount = rows.length - validRows.length

  async function onFile(file: File) {
    setResult(null)
    setFileName(file.name)
    const text = await file.text()
    const records = csvToRecords(text)
    const parsed: ParsedRow<T>[] = records.map((rec, i) => {
      const outcome = spec.parseRow(rec)
      return 'error' in outcome ? { index: i, raw: rec, error: outcome.error } : { index: i, raw: rec, value: outcome.value }
    })
    setRows(parsed)
  }

  async function onImport() {
    if (validRows.length === 0) return
    setImporting(true)
    try {
      const res = await spec.doImport(validRows.map((r) => r.value))
      setResult(res)
      const parts = [`создано ${res.created}`]
      if (res.updated > 0) parts.push(`обновлено ${res.updated}`)
      if (res.errors.length > 0) parts.push(`ошибок ${res.errors.length}`)
      toast[res.errors.length > 0 ? 'error' : 'success'](`${spec.label}: ${parts.join(', ')}`)
    } catch (e) {
      toast.error(errorMessage(e))
    } finally {
      setImporting(false)
    }
  }

  function downloadTemplate() {
    downloadCsv(spec.templateFilename, spec.templateHeader, [spec.templateExample])
  }

  function downloadErrors() {
    if (!result || result.errors.length === 0) return
    downloadCsv(`errors-${spec.templateFilename}`, ['row', 'message'], result.errors.map((e) => [e.row, e.message]))
  }

  function reset() {
    setFileName(null)
    setRows([])
    setResult(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="import-panel">
      <div className="import-head">
        <p>{spec.description}</p>
        <button type="button" className="btn btn-ghost btn-sm" onClick={downloadTemplate}>
          <IconDownload />
          Скачать шаблон CSV
        </button>
      </div>

      <label className="import-drop">
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          className="visually-hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) onFile(file)
          }}
        />
        <IconUpload />
        <span>{fileName ?? 'Выберите CSV-файл или перетащите его сюда'}</span>
        {fileName && (
          <span className="import-drop-meta">
            {rows.length} строк · {validRows.length} валидных
            {invalidCount > 0 ? ` · ${invalidCount} с ошибками` : ''}
          </span>
        )}
      </label>

      {rows.length === 0 && !fileName && (
        <EmptyState icon={<IconUpload />} title="Файл ещё не выбран" text="Скачайте шаблон, заполните и загрузите обратно." />
      )}

      {rows.length > 0 && (
        <>
          <div className="card">
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th className="num">#</th>
                    {spec.templateHeader.map((h) => (
                      <th key={h}>{h}</th>
                    ))}
                    <th>Статус</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, PREVIEW_LIMIT).map((r) => (
                    <tr key={r.index} className={r.error ? 'is-invalid-row' : undefined}>
                      <td className="num muted">{r.index + 2}</td>
                      {spec.templateHeader.map((h) => (
                        <td key={h}>{r.raw[h] || <span className="muted">—</span>}</td>
                      ))}
                      <td>
                        {r.error ? (
                          <span className="pill pill-danger" title={r.error}>
                            <IconAlert /> {r.error}
                          </span>
                        ) : (
                          <span className="pill pill-success">
                            <IconCheck /> ок
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {rows.length > PREVIEW_LIMIT && (
              <p className="import-preview-note">Показаны первые {PREVIEW_LIMIT} строк из {rows.length}.</p>
            )}
          </div>

          <div className="import-actions">
            <button type="button" className="btn btn-ghost" onClick={reset} disabled={importing}>
              Выбрать другой файл
            </button>
            <button type="button" className="btn btn-primary" onClick={onImport} disabled={importing || validRows.length === 0}>
              {importing ? 'Импортируем…' : `Импортировать ${validRows.length} строк`}
            </button>
          </div>
        </>
      )}

      {result && (
        <div className={`alert ${result.errors.length > 0 ? 'alert-error' : 'alert-success'}`}>
          {result.errors.length > 0 ? <IconAlert /> : <IconCheck />}
          <div>
            <p>
              Создано: {result.created}
              {result.updated > 0 && `, обновлено: ${result.updated}`}
              {result.errors.length > 0 && `, ошибок: ${result.errors.length}`}
            </p>
            {result.errors.length > 0 && (
              <button type="button" className="btn btn-ghost btn-sm" onClick={downloadErrors}>
                <IconDownload />
                Скачать строки с ошибками
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
