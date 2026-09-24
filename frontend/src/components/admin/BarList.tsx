interface BarListItem {
  label: string
  value: number
}

interface BarListProps {
  items: BarListItem[]
  /** Форматирует число у края полосы. По умолчанию — как есть. */
  formatValue?: (v: number) => string
}

/**
 * Один измеряемый показатель по категориям (identity) — это magnitude-задача,
 * поэтому один акцентный оттенок на все полосы, а не «радуга» по количеству строк.
 * Значение — прямая подпись у края полосы, легенда не нужна (серия одна).
 */
export default function BarList({ items, formatValue = (v) => String(v) }: BarListProps) {
  const max = Math.max(1, ...items.map((i) => i.value))

  return (
    <ul className="bar-list">
      {items.map((item) => (
        <li key={item.label} className="bar-list-row">
          <span className="bar-list-label" title={item.label}>
            {item.label}
          </span>
          <span className="bar-list-track">
            <span className="bar-list-fill" style={{ width: `${Math.max(2, (item.value / max) * 100)}%` }} />
          </span>
          <span className="bar-list-value">{formatValue(item.value)}</span>
        </li>
      ))}
    </ul>
  )
}
