import type { ItemCategory, ItemIssue, ItemReceive, StoreItem } from '../types'

export const itemCategories: ItemCategory[] = [
  { id: 'ic-01', code: 'STN', name: 'Stationery', description: 'Paper, pens, files and general office stationery' },
  { id: 'ic-02', code: 'CMP', name: 'Computer Consumables', description: 'Toner, cartridges, cables and storage media' },
  { id: 'ic-03', code: 'CLN', name: 'Cleaning & Housekeeping', description: 'Cleaning agents and housekeeping supplies' },
  { id: 'ic-04', code: 'ELE', name: 'Electrical Consumables', description: 'Bulbs, switches, extension cords and batteries' },
  { id: 'ic-05', code: 'TRN', name: 'Training Materials', description: 'Trainee kits, manuals and workshop consumables' },
]

const ITEM_SEED: [string, string, string, string, number, number, number][] = [
  ['STN-001', 'A4 Offset Paper (80 gsm)', 'ic-01', 'Ream', 60, 480, 1_200],
  ['STN-002', 'Ball Point Pen (Blue)', 'ic-01', 'Piece', 200, 12, 4_800],
  ['STN-003', 'Box File', 'ic-01', 'Piece', 80, 140, 900],
  ['STN-004', 'Stapler Pin (24/6)', 'ic-01', 'Box', 50, 35, 640],
  ['STN-005', 'Whiteboard Marker', 'ic-01', 'Piece', 100, 55, 1_100],
  ['CMP-001', 'HP 88A Toner Cartridge', 'ic-02', 'Piece', 12, 8_200, 96],
  ['CMP-002', 'USB Flash Drive 32GB', 'ic-02', 'Piece', 25, 720, 210],
  ['CMP-003', 'HDMI Cable 3m', 'ic-02', 'Piece', 15, 640, 84],
  ['CLN-001', 'Floor Cleaner 5L', 'ic-03', 'Bottle', 20, 620, 180],
  ['CLN-002', 'Hand Wash 500ml', 'ic-03', 'Bottle', 40, 210, 360],
  ['CLN-003', 'Tissue Roll', 'ic-03', 'Pack', 60, 340, 720],
  ['ELE-001', 'LED Bulb 12W', 'ic-04', 'Piece', 50, 260, 480],
  ['ELE-002', 'Extension Cord 5m', 'ic-04', 'Piece', 15, 850, 96],
  ['ELE-003', 'AA Battery (4 pack)', 'ic-04', 'Pack', 40, 180, 320],
  ['TRN-001', 'Trainee Notebook Kit', 'ic-05', 'Set', 500, 320, 12_000],
  ['TRN-002', 'Safety Gloves (pair)', 'ic-05', 'Pair', 300, 145, 6_400],
  ['TRN-003', 'Sewing Thread Cone', 'ic-05', 'Cone', 200, 95, 3_800],
]

export const storeItems: StoreItem[] = ITEM_SEED.map(([code, name, categoryId, unit, reorderLevel, unitPrice, opening], i) => ({
  id: `si-${String(i + 1).padStart(3, '0')}`,
  code,
  name,
  categoryId,
  unit,
  reorderLevel,
  unitPrice,
  openingStock: opening,
  received: Math.round(opening * (0.4 + ((i * 7) % 40) / 100)),
  issued: Math.round(opening * (0.55 + ((i * 11) % 45) / 100)),
}))

export const itemReceives: ItemReceive[] = Array.from({ length: 26 }, (_, i) => {
  const item = storeItems[i % storeItems.length]
  return {
    id: `rcv-${String(i + 1).padStart(3, '0')}`,
    grn: `GRN-2609-${String(20 + i).padStart(4, '0')}`,
    date: `2026-${String(9 - Math.floor(i / 9)).padStart(2, '0')}-${String((i % 27) + 1).padStart(2, '0')}`,
    supplier: ['Rahman Traders', 'Padma Printing Press', 'Smart Technologies (BD) Ltd.', 'M/s Karim Enterprise'][i % 4],
    challanNo: `DC/${2026}/${String(400 + i)}`,
    itemId: item.id,
    quantity: 20 + ((i * 17) % 400),
    unitPrice: item.unitPrice,
    receivedBy: 'Sabbir Ahmed',
    remarks: ['Against purchase order', 'Emergency purchase', 'Quarterly indent'][i % 3],
  }
})

export const itemIssues: ItemIssue[] = Array.from({ length: 30 }, (_, i) => {
  const item = storeItems[(i * 3) % storeItems.length]
  return {
    id: `iss-${String(i + 1).padStart(3, '0')}`,
    issueNo: `ISS-2609-${String(50 + i).padStart(4, '0')}`,
    date: `2026-${String(9 - Math.floor(i / 11)).padStart(2, '0')}-${String((i % 26) + 1).padStart(2, '0')}`,
    itemId: item.id,
    quantity: 5 + ((i * 13) % 120),
    issuedTo: ['Md. Rakibul Islam', 'Farhana Akter', 'Tanvir Hossain', 'Sharmin Sultana', 'Ashraful Alam'][i % 5],
    department: ['Administration', 'Finance & Accounts', 'Training', 'MIS', 'Procurement'][i % 5],
    purpose: ['Regular office use', 'Training batch supply', 'Workshop consumable'][i % 3],
    approvedBy: 'Md. Rakibul Islam',
  }
})
