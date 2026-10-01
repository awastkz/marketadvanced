const KEY = 'guestId'

let memory: string | null = null

/**
 * Id гостя для корзины без логина (заголовок X-Guest-Id). Живёт в localStorage,
 * чтобы корзина переживала перезагрузку. Если хранилище недоступно (приватный режим),
 * держим id в памяти на время вкладки.
 */
export function getGuestId(): string {
  if (memory) return memory
  try {
    const saved = localStorage.getItem(KEY)
    if (saved) return (memory = saved)
    const id = crypto.randomUUID()
    localStorage.setItem(KEY, id)
    return (memory = id)
  } catch {
    return (memory = crypto.randomUUID())
  }
}
