import { useMemo } from 'react'
import { create } from 'zustand'
import { uid } from '@/lib/id'
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
  addCategory: (category: Omit<AssetCategory, 'id'>) => void
  addLocation: (location: Omit<AssetLocation, 'id'>) => void
  addChallan: (challan: Omit<DeliveryChallan, 'id'>) => void
  addAsset: (asset: Omit<Asset, 'id'>) => void
  addTransfer: (transfer: Omit<AssetTransfer, 'id'>) => void
}

export const useAssetStore = create<AssetState>()((set) => ({
  suppliers: seedSuppliers,
  categories: seedCategories,
  locations: seedLocations,
  challans: seedChallans,
  assets: seedAssets,
  transfers: seedTransfers,

  addSupplier: (supplier) => set((s) => ({ suppliers: [{ ...supplier, id: uid('sup') }, ...s.suppliers] })),
  addCategory: (category) => set((s) => ({ categories: [...s.categories, { ...category, id: uid('cat') }] })),
  addLocation: (location) => set((s) => ({ locations: [...s.locations, { ...location, id: uid('loc') }] })),
  addChallan: (challan) => set((s) => ({ challans: [{ ...challan, id: uid('chl') }, ...s.challans] })),
  addAsset: (asset) => set((s) => ({ assets: [{ ...asset, id: uid('ast') }, ...s.assets] })),
  addTransfer: (transfer) => set((s) => ({ transfers: [{ ...transfer, id: uid('trf') }, ...s.transfers] })),
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
