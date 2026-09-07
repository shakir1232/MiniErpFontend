export type ItemCategory = {
  id: string
  code: string
  name: string
  description: string
}

export type StoreItem = {
  id: string
  code: string
  name: string
  categoryId: string
  unit: string
  reorderLevel: number
  unitPrice: number
  openingStock: number
  received: number
  issued: number
}

export type ItemReceive = {
  id: string
  grn: string
  date: string
  supplier: string
  challanNo: string
  itemId: string
  quantity: number
  unitPrice: number
  receivedBy: string
  remarks: string
}

export type ItemIssue = {
  id: string
  issueNo: string
  date: string
  itemId: string
  quantity: number
  issuedTo: string
  department: string
  purpose: string
  approvedBy: string
}
