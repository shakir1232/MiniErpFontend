import { useMemo } from 'react'
import { create } from 'zustand'
import { uid } from '@/lib/id'
import * as seed from './data/settings'
import type {
  AssociationGroup,
  Bank,
  BankBranch,
  Currency,
  FundCategory,
  FundSource,
  FundingAgency,
  ImplementingAgency,
  Ministry,
  MinistryDirectorate,
  ProjectSector,
  ProjectType,
  SignatureSetup,
} from './types'

/** One store for every reference-data list the ERP maintains. */
type SettingsState = {
  implementingAgencies: ImplementingAgency[]
  fundingAgencies: FundingAgency[]
  fundSources: FundSource[]
  fundCategories: FundCategory[]
  projectTypes: ProjectType[]
  projectSectors: ProjectSector[]
  ministries: Ministry[]
  ministryDirectorates: MinistryDirectorate[]
  currencies: Currency[]
  banks: Bank[]
  bankBranches: BankBranch[]
  signatures: SignatureSetup[]
  associationGroups: AssociationGroup[]

  add: <K extends CollectionKey>(collection: K, record: Omit<SettingsState[K][number], 'id'>) => void
  update: <K extends CollectionKey>(collection: K, id: string, patch: Partial<SettingsState[K][number]>) => void
  remove: (collection: CollectionKey, id: string) => void
}

export type CollectionKey =
  | 'implementingAgencies'
  | 'fundingAgencies'
  | 'fundSources'
  | 'fundCategories'
  | 'projectTypes'
  | 'projectSectors'
  | 'ministries'
  | 'ministryDirectorates'
  | 'currencies'
  | 'banks'
  | 'bankBranches'
  | 'signatures'
  | 'associationGroups'

export const useSettingsStore = create<SettingsState>()((set) => ({
  implementingAgencies: seed.implementingAgencies,
  fundingAgencies: seed.fundingAgencies,
  fundSources: seed.fundSources,
  fundCategories: seed.fundCategories,
  projectTypes: seed.projectTypes,
  projectSectors: seed.projectSectors,
  ministries: seed.ministries,
  ministryDirectorates: seed.ministryDirectorates,
  currencies: seed.currencies,
  banks: seed.banks,
  bankBranches: seed.bankBranches,
  signatures: seed.signatureSetups,
  associationGroups: seed.associationGroups,

  add: (collection, record) =>
    set((state) => ({
      [collection]: [...(state[collection] as any[]), { ...(record as object), id: uid(collection.slice(0, 3)) }],
    }) as any),
  update: (collection, id, patch) =>
    set((state) => ({
      [collection]: (state[collection] as any[]).map((r) => (r.id === id ? { ...r, ...(patch as object) } : r)),
    }) as any),
  remove: (collection, id) =>
    set((state) => ({ [collection]: (state[collection] as any[]).filter((r) => r.id !== id) }) as any),
}))

export function useLookup<T extends { id: string }>(records: T[]) {
  return useMemo(() => Object.fromEntries(records.map((r) => [r.id, r])) as Record<string, T>, [records])
}
