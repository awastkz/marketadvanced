import { useState, type ReactNode } from 'react'
import { downloadCsv } from '../../utils/csv'
import { toast } from '../../stores/toast'
import { errorMessage } from '../../utils/format'
import Alert from '../Alert'
import type { ExportSpec } from '../../views/admin/import/exportSpecs'
import { IconDownload } from '../icons'

interface ExportPanelProps {
  spec: ExportSpec
  /** Доп. фильтры (сейчас — только у товаров), рисуются над кнопкой. */
  filters?: ReactNode
}

export default function ExportPanel({ spec, filters }: ExportPanelProps) {
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null)
  const [shortfall, setShortfall] = useState<{ got: number; expected: number } | null>(null)

  async function onExport() {
    setBusy(true)
    setProgress(null)
    setShortfall(null)
    try {
      const { rows, expectedTotal } = await spec.fetchRows((done, total) => setProgress({ done, total }))
      if (rows.length === 0) {
        toast.error('Нечего выгружать — под текущие фильтры ничего не найдено')
        return
      }
      downloadCsv(spec.filename, spec.header, rows)
      if (rows.length < expectedTotal) {
        setShortfall({ got: rows.length, expected: expectedTotal })
        toast.error(`${spec.label}: в файле ${rows.length} строк, а должно быть ${expectedTotal} — часть не выгрузилась`)
      } else {
        toast.success(`${spec.label}: выгружено строк — ${rows.length}`)
      }
    } catch (e) {
      toast.error(errorMessage(e))
    } finally {
      setBusy(false)
      setProgress(null)
    }
  }

  return (
    <div className="card export-panel">
      <div className="card-body">
        <p className="card-subtitle">{spec.description}</p>
        {filters}
        <button type="button" className="btn btn-primary" onClick={onExport} disabled={busy}>
          <IconDownload />
          {busy ? (progress ? `Выгружаем ${progress.done} из ${progress.total}…` : 'Выгружаем…') : 'Скачать CSV'}
        </button>
        {shortfall && (
          <Alert kind="error">
            Файл скачан, но в нём {shortfall.got} строк вместо {shortfall.expected}. Причина на сервере: постраничная
            выборка не гарантирует, что каждый товар попадёт хотя бы на одну страницу, когда у многих товаров совпадает
            дата создания/изменения. Нужен фикс сортировки на бэкенде.
          </Alert>
        )}
      </div>
    </div>
  )
}
