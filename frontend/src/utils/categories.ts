import type { Category } from '../api/admin/types'

export interface CategoryNode extends Category {
  depth: number
  children: CategoryNode[]
}

/** Строит дерево и возвращает его в порядке обхода (для select и списков). */
export function flattenTree(categories: Category[]): CategoryNode[] {
  const byParent = new Map<number | null, Category[]>()
  for (const c of categories) {
    const list = byParent.get(c.parentId) ?? []
    list.push(c)
    byParent.set(c.parentId, list)
  }
  for (const list of byParent.values()) list.sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name))

  const out: CategoryNode[] = []
  const walk = (parentId: number | null, depth: number): CategoryNode[] =>
    (byParent.get(parentId) ?? []).map((c) => {
      const node: CategoryNode = { ...c, depth, children: [] }
      out.push(node)
      node.children = walk(c.id, depth + 1)
      return node
    })
  walk(null, 0)
  return out
}

/** Все id потомков категории (включая её саму). */
export function descendantIds(categories: Category[], id: number): Set<number> {
  const ids = new Set<number>([id])
  let grew = true
  while (grew) {
    grew = false
    for (const c of categories) {
      if (c.parentId != null && ids.has(c.parentId) && !ids.has(c.id)) {
        ids.add(c.id)
        grew = true
      }
    }
  }
  return ids
}

export function indent(depth: number) {
  return '    '.repeat(depth)
}
