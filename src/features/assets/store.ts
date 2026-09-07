import { useMemo } from 'react'
import { create } from 'zustand'
import { uid } from '@/lib/id'
import { dropById, patchById } from '@/lib/collection'
import {
  assetCategories as seedCategories,
  assetLocations as seedLocations,
  assetTransfers as seedTransfers,
  assets as seedAssets,
  deliveryChallans as seedChallans,
  suppliers as seedSuppliers,
} from './data/assets'
import type { Asset, AssetCategory, AssetLocation, AssetTransfer, DeliveryChallan, Supplier } from './types'

type AssetState = {
  suppliers: Supplier[]
  categories: AssetCategory[]
  locations: AssetLocation[]
  challans: DeliveryChallan[]
  assets: Asset[]
  transfers: AssetTransfer[]

  addSupplier: (supplier: Omit<Supplier, 'id'>) => void
  updateSupplier: (id: string, patch: Partial<Supplier>) => void
  removeSupplier: (id: string) => void

  addCategory: (category: Omit<AssetCategory, 'id'>) => void
  updateCategory: (id: string, patch: Partial<AssetCategory>) => void
  removeCategory: (id: string) => void

  addLocation: (location: Omit<AssetLocation, 'id'>) => void
  updateLocation: (id: string, patch: Partial<AssetLocation>) => void
  removeLocation: (id: string) => void

  addChallan: (challan: Omit<DeliveryChallan, 'id'>) => void
  updateChallan: (id: string, patch: Partial<DeliveryChallan>) => void
  removeChallan: (id: string) => void

  addAsset: (asset: Omit<Asset, 'id'>) => void
  updateAsset: (id: string, patch: Partial<Asset>) => void
  removeAsset: (id: string) => void

  addTransfer: (transfer: Omit<AssetTransfer, 'id'>) => void
  updateTransfer: (id: string, patch: Partial<AssetTransfer>) => void
  removeTransfer: (id: string) => void
}

export const useAssetStore = create<AssetState>()((set) => ({
  suppliers: seedSuppliers,
  categories: seedCategories,
  locations: seedLocations,
  challans: seedChallans,
  assets: seedAssets,
  transfers: seedTransfers,

  addSupplier: (supplier) => set((s) => ({ suppliers: [{ ...supplier, id: uid('sup') }, ...s.suppliers] })),
  updateSupplier: (id, patch) => set((s) => ({ suppliers: patchById(s.suppliers, id, patch) })),
  removeSupplier: (id) => set((s) => ({ suppliers: dropById(s.suppliers, id) })),

  addCategory: (category) => set((s) => ({ categories: [...s.categories, { ...category, id: uid('cat') }] })),
  updateCategory: (id, patch) => set((s) => ({ categories: patchById(s.categories, id, patch) })),
  removeCategory: (id) => set((s) => ({ categories: dropById(s.categories, id) })),

  addLocation: (location) => set((s) => ({ locations: [...s.locations, { ...location, id: uid('loc') }] })),
  updateLocation: (id, patch) => set((s) => ({ locations: patchById(s.locations, id, patch) })),
  removeLocation: (id) => set((s) => ({ locations: dropById(s.locations, id) })),

  addChallan: (challan) => set((s) => ({ challans: [{ ...challan, id: uid('chl') }, ...s.challans] })),
  updateChallan: (id, patch) => set((s) => ({ challans: patchById(s.challans, id, patch) })),
  removeChallan: (id) => set((s) => ({ challans: dropById(s.challans, id) })),

  addAsset: (asset) => set((s) => ({ assets: [{ ...asset, id: uid('ast') }, ...s.assets] })),
  updateAsset: (id, patch) => set((s) => ({ assets: patchById(s.assets, id, patch) })),
  removeAsset: (id) => set((s) => ({ assets: dropById(s.assets, id) })),

  addTransfer: (transfer) => set((s) => ({ transfers: [{ ...transfer, id: uid('trf') }, ...s.transfers] })),
  updateTransfer: (id, patch) => set((s) => ({ transfers: patchById(s.transfers, id, patch) })),
  removeTransfer: (id) => set((s) => ({ transfers: dropById(s.transfers, id) })),
}))

export function useAssetCategoryLookup() {
  const categories = useAssetStore((s) => s.categories)
  return useMemo(() => Object.fromEntries(categories.map((c) => [c.id, c])), [categories])
}

export function useAssetLocationLookup() {
  const locations = useAssetStore((s) => s.locations)
  return useMemo(() => Object.fromEntries(locations.map((l) => [l.id, l])), [locations])
}

export function useSupplierLookup() {
  const suppliers = useAssetStore((s) => s.suppliers)
  return useMemo(() => Object.fromEntries(suppliers.map((s2) => [s2.id, s2])), [suppliers])
}

export function useAssetLookup() {
  const assets = useAssetStore((s) => s.assets)
  return useMemo(() => Object.fromEntries(assets.map((a) => [a.id, a])), [assets])
}
