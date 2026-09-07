import { useMemo } from 'react'
import { create } from 'zustand'
import { uid } from '@/lib/id'
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
  setLetterStatus: (id: string, status: Letter['status']) => void
  addDispatch: (dispatch: Omit<LetterDispatch, 'id'>) => void
  addMemo: (memo: Omit<Memo, 'id'>) => void
}

export const useLetterStore = create<LetterState>()((set) => ({
  letters: seedLetters,
  entities: seedEntities,
  dispatches: seedDispatches,
  movements: seedMovements,
  memos: seedMemos,

  addLetter: (letter) => set((s) => ({ letters: [{ ...letter, id: uid('ltr') }, ...s.letters] })),
  setLetterStatus: (id, status) =>
    set((s) => ({ letters: s.letters.map((l) => (l.id === id ? { ...l, status } : l)) })),
  addDispatch: (dispatch) =>
    set((s) => ({
      dispatches: [{ ...dispatch, id: uid('dsp') }, ...s.dispatches],
      letters: s.letters.map((l) => (l.id === dispatch.letterId ? { ...l, status: 'dispatched' } : l)),
    })),
  addMemo: (memo) => set((s) => ({ memos: [{ ...memo, id: uid('memo') }, ...s.memos] })),
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
