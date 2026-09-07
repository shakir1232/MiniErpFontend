import { useMemo } from 'react'
import { create } from 'zustand'
import { uid } from '@/lib/id'
import { dropById, patchById } from '@/lib/collection'
import {
  itemCategories as seedCategories,
  itemIssues as seedIssues,
  itemReceives as seedReceives,
  storeItems as seedItems,
} from './data/store'
import type { ItemCategory, ItemIssue, ItemReceive, StoreItem } from './types'

type StoreState = {
  categories: ItemCategory[]
  items: StoreItem[]
  receives: ItemReceive[]
  issues: ItemIssue[]

  addCategory: (category: Omit<ItemCategory, 'id'>) => void
  updateCategory: (id: string, patch: Partial<ItemCategory>) => void
  removeCategory: (id: string) => void

  addItem: (item: Omit<StoreItem, 'id'>) => void
  updateItem: (id: string, patch: Partial<StoreItem>) => void
  removeItem: (id: string) => void

  addReceive: (receive: Omit<ItemReceive, 'id'>) => void
  updateReceive: (id: string, patch: Partial<ItemReceive>) => void
  removeReceive: (id: string) => void

  addIssue: (issue: Omit<ItemIssue, 'id'>) => void
  updateIssue: (id: string, patch: Partial<ItemIssue>) => void
  removeIssue: (id: string) => void
}

export const useStoreStore = create<StoreState>()((set) => ({
  categories: seedCategories,
  items: seedItems,
  receives: seedReceives,
  issues: seedIssues,

  addCategory: (category) => set((s) => ({ categories: [...s.categories, { ...category, id: uid('ic') }] })),
  updateCategory: (id, patch) => set((s) => ({ categories: patchById(s.categories, id, patch) })),
  removeCategory: (id) => set((s) => ({ categories: dropById(s.categories, id) })),

  addItem: (item) => set((s) => ({ items: [...s.items, { ...item, id: uid('si') }] })),
  updateItem: (id, patch) => set((s) => ({ items: patchById(s.items, id, patch) })),
  removeItem: (id) => set((s) => ({ items: dropById(s.items, id) })),
  addReceive: (receive) =>
    set((s) => ({
      receives: [{ ...receive, id: uid('rcv') }, ...s.receives],
      items: s.items.map((i) => (i.id === receive.itemId ? { ...i, received: i.received + receive.quantity } : i)),
    })),
  updateReceive: (id, patch) =>
    set((s) => {
      const before = s.receives.find((r) => r.id === id)
      const receives = patchById(s.receives, id, patch)
      const after = receives.find((r) => r.id === id)
      if (!before || !after) return { receives }
      // Keep stock in step with the edited quantity.
      const items = s.items.map((item) => {
        if (item.id === before.itemId && item.id === after.itemId) {
          return { ...item, received: item.received - before.quantity + after.quantity }
        }
        if (item.id === before.itemId) return { ...item, received: item.received - before.quantity }
        if (item.id === after.itemId) return { ...item, received: item.received + after.quantity }
        return item
      })
      return { receives, items }
    }),
  removeReceive: (id) =>
    set((s) => {
      const entry = s.receives.find((r) => r.id === id)
      return {
        receives: dropById(s.receives, id),
        items: entry
          ? s.items.map((i) => (i.id === entry.itemId ? { ...i, received: i.received - entry.quantity } : i))
          : s.items,
      }
    }),

  addIssue: (issue) =>
    set((s) => ({
      issues: [{ ...issue, id: uid('iss') }, ...s.issues],
      items: s.items.map((i) => (i.id === issue.itemId ? { ...i, issued: i.issued + issue.quantity } : i)),
    })),
  updateIssue: (id, patch) =>
    set((s) => {
      const before = s.issues.find((i) => i.id === id)
      const issues = patchById(s.issues, id, patch)
      const after = issues.find((i) => i.id === id)
      if (!before || !after) return { issues }
      const items = s.items.map((item) => {
        if (item.id === before.itemId && item.id === after.itemId) {
          return { ...item, issued: item.issued - before.quantity + after.quantity }
        }
        if (item.id === before.itemId) return { ...item, issued: item.issued - before.quantity }
        if (item.id === after.itemId) return { ...item, issued: item.issued + after.quantity }
        return item
      })
      return { issues, items }
    }),
  removeIssue: (id) =>
    set((s) => {
      const entry = s.issues.find((i) => i.id === id)
      return {
        issues: dropById(s.issues, id),
        items: entry
          ? s.items.map((i) => (i.id === entry.itemId ? { ...i, issued: i.issued - entry.quantity } : i))
          : s.items,
      }
    }),
}))

export function useItemLookup() {
  const items = useStoreStore((s) => s.items)
  return useMemo(() => Object.fromEntries(items.map((i) => [i.id, i])), [items])
}

export function useItemCategoryLookup() {
  const categories = useStoreStore((s) => s.categories)
  return useMemo(() => Object.fromEntries(categories.map((c) => [c.id, c])), [categories])
}

export function closingStock(item: StoreItem) {
  return item.openingStock + item.received - item.issued
}
