import { useMemo } from 'react'
import { create } from 'zustand'
import { uid } from '@/lib/id'
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
  addItem: (item: Omit<StoreItem, 'id'>) => void
  addReceive: (receive: Omit<ItemReceive, 'id'>) => void
  addIssue: (issue: Omit<ItemIssue, 'id'>) => void
}

export const useStoreStore = create<StoreState>()((set) => ({
  categories: seedCategories,
  items: seedItems,
  receives: seedReceives,
  issues: seedIssues,

  addCategory: (category) => set((s) => ({ categories: [...s.categories, { ...category, id: uid('ic') }] })),
  addItem: (item) => set((s) => ({ items: [...s.items, { ...item, id: uid('si') }] })),
  addReceive: (receive) =>
    set((s) => ({
      receives: [{ ...receive, id: uid('rcv') }, ...s.receives],
      items: s.items.map((i) => (i.id === receive.itemId ? { ...i, received: i.received + receive.quantity } : i)),
    })),
  addIssue: (issue) =>
    set((s) => ({
      issues: [{ ...issue, id: uid('iss') }, ...s.issues],
      items: s.items.map((i) => (i.id === issue.itemId ? { ...i, issued: i.issued + issue.quantity } : i)),
    })),
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
