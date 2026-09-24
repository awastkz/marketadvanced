/**
 * Небольшой CSV-парсер и сериализатор для импорта справочников в админке.
 * Поддерживает кавычки, запятые и переносы строк внутри поля (RFC 4180),
 * без внешней зависимости. Разделитель — запятая, кодировка — UTF-8 (BOM снимается).
 */

export function parseCsv(text: string): string[][] {
  const clean = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false

  for (let i = 0; i < clean.length; i++) {
    const ch = clean[i]

    if (inQuotes) {
      if (ch === '"') {
        if (clean[i + 1] === '"') {
          field += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        field += ch
      }
      continue
    }

    if (ch === '"') {
      inQuotes = true
    } else if (ch === ',') {
      row.push(field)
      field = ''
    } else if (ch === '\r') {
      // игнорируем — перенос обработает \n
    } else if (ch === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else {
      field += ch
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field)
    rows.push(row)
  }

  return rows.filter((r) => r.length > 1 || r[0]?.trim() !== '')
}

/** Строки как массив объектов по заголовку первой строки. Пустые ключи (лишние колонки) отбрасываются. */
export function csvToRecords(text: string): Record<string, string>[] {
  const rows = parseCsv(text)
  if (rows.length === 0) return []
  const header = rows[0].map((h) => h.trim())
  return rows.slice(1).map((cells) => {
    const rec: Record<string, string> = {}
    header.forEach((key, i) => {
      if (key) rec[key] = (cells[i] ?? '').trim()
    })
    return rec
  })
}

function escapeCsvField(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`
  return value
}

export function buildCsv(header: string[], rows: (string | number)[][]): string {
  const lines = [header, ...rows].map((r) => r.map((v) => escapeCsvField(String(v))).join(','))
  return '﻿' + lines.join('\r\n') + '\r\n'
}

export function downloadCsv(filename: string, header: string[], rows: (string | number)[][]) {
  const blob = new Blob([buildCsv(header, rows)], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
