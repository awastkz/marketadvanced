import { create } from 'zustand'
import * as cartApi from '../api/cart'
import type { Cart } from '../api/cart'
import { errorMessage } from '../utils/format'

interface CartState {
  cart: Cart | null
  loading: boolean
  error: string | null
  load: () => Promise<void>
  addItem: (variantId: string, quantity: number) => Promise<void>
  setQuantity: (variantId: string, quantity: number) => Promise<void>
  removeItem: (variantId: string) => Promise<void>
  clear: () => Promise<void>
  reset: () => void
}

async function fetchCart(): Promise<Cart> {
  const { data } = await cartApi.getCart()
  return data
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: null,
  loading: false,
  error: null,

  async load() {
    set({ loading: true, error: null })
    try {
      const cart = await fetchCart()
      set({ cart, loading: false })
    } catch (e) {
      set({ error: errorMessage(e), loading: false })
    }
  },

  async addItem(variantId, quantity) {
    await cartApi.addItem(variantId, quantity)
    set({ cart: await fetchCart() })
  },

  // Эндпоинта «поставить количество N» на бэкенде нет: AddItem только прибавляет
  // к текущему количеству, RemoveItem удаляет позицию целиком.
  async setQuantity(variantId, quantity) {
    const current = get().cart?.items.find((i) => i.variantId === variantId)?.quantity ?? 0
    if (quantity === current) return

    if (quantity > current) {
      // увеличение — это родное поведение AddItem (просто прибавляет к строке),
      // Id и место позиции в списке не меняются
      await cartApi.addItem(variantId, quantity - current)
    } else {
      // уменьшения на бэкенде нет вовсе — только «удалить позицию целиком».
      // Пересобираем нужное количество вручную: после этого у позиции будет
      // новый Id, и она может сместиться в списке (GetCart отдаёт items в
      // порядке строк в БД, а не в порядке, в котором их видел покупатель)
      await cartApi.removeItem(variantId)
      if (quantity > 0) await cartApi.addItem(variantId, quantity)
    }
    set({ cart: await fetchCart() })
  },

  async removeItem(variantId) {
    await cartApi.removeItem(variantId)
    set({ cart: await fetchCart() })
  },

  async clear() {
    await cartApi.clearCart()
    set({ cart: await fetchCart() })
  },

  reset() {
    set({ cart: null, loading: false, error: null })
  },
}))

/** Суммарное количество товаров в корзине — для бейджа в шапке. */
export function cartItemCount(cart: Cart | null): number {
  return cart?.items.reduce((n, i) => n + i.quantity, 0) ?? 0
}
