export type Supplier = {
  id: string
  name: string
  contactPerson: string
  phone: string
  email: string
  address: string
  tin: string
  bin: string
  status: 'active' | 'inactive'
}

export type AssetCategory = {
  id: string
  code: string
  name: string
  depreciationRate: number
  usefulLifeYears: number
  parent: string | null
}

export type AssetLocation = {
  id: string
  code: string
  name: string
  type: 'Head Office' | 'PIU' | 'Training Centre' | 'Store'
  district: string
  address: string
  inCharge: string
}

export type DeliveryChallan = {
  id: string
  challanNo: string
  date: string
  supplierId: string
  packageNo: string
  itemCount: number
  totalValue: number
  receivedBy: string
  status: 'received' | 'pending' | 'returned'
}

export type Asset = {
  id: string
  tag: string
  name: string
  categoryId: string
  supplierId: string
  challanId: string | null
  purchaseDate: string
  purchaseValue: number
  currentValue: number
  locationId: string
  assignedTo: string | null
  condition: 'new' | 'good' | 'needs repair' | 'condemned'
  status: 'assigned' | 'in store' | 'transferred' | 'disposed'
  serialNo: string
}

export type AssetTransfer = {
  id: string
  transferNo: string
  assetId: string
  fromLocationId: string
  toLocationId: string
  date: string
  reason: string
  approvedBy: string
  status: 'transferred' | 'pending' | 'cancelled'
}
