/** Минимум, нужный для дерева: подходят и админские, и публичные категории. */
interface TreeCategory {
  id: string
  name: string
  sortOrder: number
  parentId: string | null
}

export type CategoryNode<T extends TreeCategory = TreeCategory> = T & {
  depth: number
  children: CategoryNode<T>[]
}

/** Строит дерево и возвращает его в порядке обхода (для select и списков). */
export function flattenTree<T extends TreeCategory>(categories: T[]): CategoryNode<T>[] {
  const byParent = new Map<string | null, T[]>()
  for (const c of categories) {
    const list = byParent.get(c.parentId) ?? []
    list.push(c)
    byParent.set(c.parentId, list)
  }
  for (const list of byParent.values()) list.sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name))

  const out: CategoryNode<T>[] = []
  const walk = (parentId: string | null, depth: number): CategoryNode<T>[] =>
    (byParent.get(parentId) ?? []).map((c) => {
      const node: CategoryNode<T> = { ...c, depth, children: [] }
      out.push(node)
      node.children = walk(c.id, depth + 1)
      return node
    })
  walk(null, 0)
  return out
}

/** Все id потомков категории (включая её саму). */
export function descendantIds(categories: TreeCategory[], id: string): Set<string> {
  const ids = new Set<string>([id])
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
