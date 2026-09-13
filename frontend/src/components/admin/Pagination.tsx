import { IconChevronLeft, IconChevronRight } from '../icons'

interface PaginationProps {
  page: number
  pageSize: number
  total: number
  onChange: (page: number) => void
}

export default function Pagination({ page, pageSize, total, onChange }: PaginationProps) {
  const pages = Math.max(1, Math.ceil(total / pageSize))
  if (total === 0) return null

  const from = (page - 1) * pageSize + 1
  const to = Math.min(total, page * pageSize)

  return (
    <div className="pagination">
      <span className="pagination-info">
        {from}–{to} из {total}
      </span>
      <div className="pagination-controls">
        <button type="button" className="btn btn-ghost btn-icon btn-sm" disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Назад">
          <IconChevronLeft />
        </button>
        <span className="pagination-page">
          {page} / {pages}
        </span>
        <button type="button" className="btn btn-ghost btn-icon btn-sm" disabled={page >= pages} onClick={() => onChange(page + 1)} aria-label="Вперёд">
          <IconChevronRight />
        </button>
      </div>
    </div>
  )
}
