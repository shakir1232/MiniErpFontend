type WithId = { id: string }

/** Replace one record in a list, leaving the rest untouched. */
export function patchById<T extends WithId>(list: T[], id: string, patch: Partial<T>): T[] {
  return list.map((item) => (item.id === id ? { ...item, ...patch } : item))
}

/** Drop one record from a list. */
export function dropById<T extends WithId>(list: T[], id: string): T[] {
  return list.filter((item) => item.id !== id)
}
