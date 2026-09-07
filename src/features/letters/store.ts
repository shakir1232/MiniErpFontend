import { useMemo } from 'react'
import { create } from 'zustand'
import { uid } from '@/lib/id'
import { dropById, patchById } from '@/lib/collection'
import {
  letterDispatches as seedDispatches,
  letterEntities as seedEntities,
  letterMovements as seedMovements,
  letters as seedLetters,
  memos as seedMemos,
} from './data/letters'
import type { Letter, LetterDispatch, LetterEntity, LetterMovement, Memo } from './types'

type LetterState = {
  letters: Letter[]
  entities: LetterEntity[]
  dispatches: LetterDispatch[]
  movements: LetterMovement[]
  memos: Memo[]

  addLetter: (letter: Omit<Letter, 'id'>) => void
  updateLetter: (id: string, patch: Partial<Letter>) => void
  removeLetter: (id: string) => void
  setLetterStatus: (id: string, status: Letter['status']) => void

  addDispatch: (dispatch: Omit<LetterDispatch, 'id'>) => void
  updateDispatch: (id: string, patch: Partial<LetterDispatch>) => void
  removeDispatch: (id: string) => void

  addMemo: (memo: Omit<Memo, 'id'>) => void
  updateMemo: (id: string, patch: Partial<Memo>) => void
  removeMemo: (id: string) => void
}

export const useLetterStore = create<LetterState>()((set) => ({
  letters: seedLetters,
  entities: seedEntities,
  dispatches: seedDispatches,
  movements: seedMovements,
  memos: seedMemos,

  addLetter: (letter) => set((s) => ({ letters: [{ ...letter, id: uid('ltr') }, ...s.letters] })),
  updateLetter: (id, patch) => set((s) => ({ letters: patchById(s.letters, id, patch) })),
  removeLetter: (id) =>
    set((s) => ({ letters: dropById(s.letters, id), dispatches: s.dispatches.filter((d) => d.letterId !== id) })),
  setLetterStatus: (id, status) => set((s) => ({ letters: patchById(s.letters, id, { status }) })),
  addDispatch: (dispatch) =>
    set((s) => ({
      dispatches: [{ ...dispatch, id: uid('dsp') }, ...s.dispatches],
      letters: s.letters.map((l) => (l.id === dispatch.letterId ? { ...l, status: 'dispatched' } : l)),
    })),
  updateDispatch: (id, patch) => set((s) => ({ dispatches: patchById(s.dispatches, id, patch) })),
  removeDispatch: (id) => set((s) => ({ dispatches: dropById(s.dispatches, id) })),

  addMemo: (memo) => set((s) => ({ memos: [{ ...memo, id: uid('memo') }, ...s.memos] })),
  updateMemo: (id, patch) => set((s) => ({ memos: patchById(s.memos, id, patch) })),
  removeMemo: (id) => set((s) => ({ memos: dropById(s.memos, id) })),
}))

export function useEntityLookup() {
  const entities = useLetterStore((s) => s.entities)
  return useMemo(() => Object.fromEntries(entities.map((e) => [e.id, e])), [entities])
}

export function useLetterLookup() {
  const letters = useLetterStore((s) => s.letters)
  return useMemo(() => Object.fromEntries(letters.map((l) => [l.id, l])), [letters])
}

export function useMovementsOf(letterId: string | undefined) {
  const movements = useLetterStore((s) => s.movements)
  return useMemo(() => (letterId ? movements.filter((m) => m.letterId === letterId) : []), [movements, letterId])
}
