import type { Asset, AssetCategory, AssetLocation, AssetTransfer, DeliveryChallan, Supplier } from '../types'

export const suppliers: Supplier[] = [
  { id: 'sup-01', name: 'Smart Technologies (BD) Ltd.', contactPerson: 'Rezaul Karim', phone: '+880 1711 445566', email: 'sales@smart.com.bd', address: 'Bijoy Nagar, Dhaka-1000', tin: '412556789012', bin: '000123456-0101', status: 'active' },
  { id: 'sup-02', name: 'Uttara Motors Ltd.', contactPerson: 'Shahnaz Parvin', phone: '+880 1713 220099', email: 'corporate@uttaramotors.com', address: 'Tejgaon I/A, Dhaka-1208', tin: '556677889900', bin: '000998877-0202', status: 'active' },
  { id: 'sup-03', name: 'Hatil Complex Ltd.', contactPerson: 'Md. Anwar Hossain', phone: '+880 1755 889900', email: 'corp@hatil.com', address: 'Mirpur, Dhaka-1216', tin: '778899001122', bin: '000445566-0303', status: 'active' },
  { id: 'sup-04', name: 'Padma Printing Press', contactPerson: 'Jashim Uddin', phone: '+880 1819 334455', email: 'padmapress@gmail.com', address: 'Fakirapool, Dhaka-1000', tin: '223344556677', bin: '000112233-0404', status: 'active' },
  { id: 'sup-05', name: 'Rahman Traders', contactPerson: 'Mizanur Rahman', phone: '+880 1670 112244', email: 'rahmantraders@yahoo.com', address: 'Nawabpur Road, Dhaka-1100', tin: '334455667788', bin: '000556677-0505', status: 'inactive' },
  { id: 'sup-06', name: 'Navana Furniture', contactPerson: 'Farid Ahmed', phone: '+880 1911 776655', email: 'info@navanafurniture.com', address: 'Gulshan-1, Dhaka-1212', tin: '445566778899', bin: '000667788-0606', status: 'active' },
]

export const assetCategories: AssetCategory[] = [
  { id: 'cat-01', code: 'IT', name: 'Computer & IT Equipment', depreciationRate: 20, usefulLifeYears: 5, parent: null },
  { id: 'cat-02', code: 'IT-LT', name: 'Laptop', depreciationRate: 20, usefulLifeYears: 5, parent: 'cat-01' },
  { id: 'cat-03', code: 'IT-DT', name: 'Desktop', depreciationRate: 20, usefulLifeYears: 5, parent: 'cat-01' },
  { id: 'cat-04', code: 'IT-PR', name: 'Printer & Scanner', depreciationRate: 20, usefulLifeYears: 4, parent: 'cat-01' },
  { id: 'cat-05', code: 'VEH', name: 'Vehicle', depreciationRate: 10, usefulLifeYears: 10, parent: null },
  { id: 'cat-06', code: 'FUR', name: 'Furniture & Fixtures', depreciationRate: 10, usefulLifeYears: 10, parent: null },
  { id: 'cat-07', code: 'ELEC', name: 'Electrical & Office Appliance', depreciationRate: 15, usefulLifeYears: 7, parent: null },
  { id: 'cat-08', code: 'TRN', name: 'Training Equipment', depreciationRate: 15, usefulLifeYears: 7, parent: null },
]

export const assetLocations: AssetLocation[] = [
  { id: 'loc-01', code: 'HO', name: 'SEIP Head Office', type: 'Head Office', district: 'Dhaka', address: 'Probashi Kallyan Bhaban (Level 12), Eskaton Garden, Dhaka', inCharge: 'Md. Rakibul Islam' },
  { id: 'loc-02', code: 'PIU-CTG', name: 'PIU Chattogram', type: 'PIU', district: 'Chattogram', address: 'Agrabad C/A, Chattogram', inCharge: 'Ashraful Alam' },
  { id: 'loc-03', code: 'PIU-KHL', name: 'PIU Khulna', type: 'PIU', district: 'Khulna', address: 'Boyra, Khulna', inCharge: 'Nazmul Karim' },
  { id: 'loc-04', code: 'PIU-RAJ', name: 'PIU Rajshahi', type: 'PIU', district: 'Rajshahi', address: 'Shaheb Bazar, Rajshahi', inCharge: 'Kamrul Uddin' },
  { id: 'loc-05', code: 'TC-DHK', name: 'Dhaka Training Centre', type: 'Training Centre', district: 'Dhaka', address: 'Mirpur-2, Dhaka', inCharge: 'Sadia Yasmin' },
  { id: 'loc-06', code: 'TC-SYL', name: 'Sylhet Training Centre', type: 'Training Centre', district: 'Sylhet', address: 'Zindabazar, Sylhet', inCharge: 'Tahmina Ahmed' },
  { id: 'loc-07', code: 'STR-HO', name: 'Central Store', type: 'Store', district: 'Dhaka', address: 'Head Office basement, Dhaka', inCharge: 'Sabbir Ahmed' },
]

export const deliveryChallans: DeliveryChallan[] = Array.from({ length: 16 }, (_, i) => ({
  id: `chl-${String(i + 1).padStart(3, '0')}`,
  challanNo: `DC/SEIP/2026/${String(120 + i)}`,
  date: `2026-${String(9 - Math.floor(i / 4)).padStart(2, '0')}-${String((i % 26) + 1).padStart(2, '0')}`,
  supplierId: suppliers[i % suppliers.length].id,
  packageNo: `SEIP/G-0${(i % 5) + 1}/2026`,
  itemCount: 4 + ((i * 3) % 22),
  totalValue: 4_20_000 + i * 3_18_000,
  receivedBy: ['Sabbir Ahmed', 'Md. Rakibul Islam', 'Kamrul Uddin'][i % 3],
  status: i % 9 === 0 ? 'pending' : i % 13 === 0 ? 'returned' : 'received',
}))

const ASSET_NAMES: [string, string, number][] = [
  ['Dell Latitude 5440 Laptop', 'cat-02', 1_28_000],
  ['HP ProDesk 400 G9 Desktop', 'cat-03', 86_000],
  ['HP LaserJet Pro M404dn Printer', 'cat-04', 44_000],
  ['Toyota Hilux Double Cabin', 'cat-05', 68_00_000],
  ['Executive Office Table', 'cat-06', 42_000],
  ['Revolving Chair', 'cat-06', 18_500],
  ['Gree 1.5 Ton Air Conditioner', 'cat-07', 78_000],
  ['Industrial Sewing Machine', 'cat-08', 96_000],
  ['Epson EB-X51 Projector', 'cat-08', 62_000],
  ['Conference Table (12 seat)', 'cat-06', 1_45_000],
]

export const assets: Asset[] = Array.from({ length: 54 }, (_, i) => {
  const [name, categoryId, value] = ASSET_NAMES[i % ASSET_NAMES.length]
  const purchaseYear = 2022 + (i % 5)
  const age = 2026 - purchaseYear
  const category = assetCategories.find((c) => c.id === categoryId)!
  const currentValue = Math.max(Math.round(value * (1 - (category.depreciationRate / 100) * age)), Math.round(value * 0.1))
  const status: Asset['status'] = i % 11 === 0 ? 'in store' : i % 17 === 0 ? 'transferred' : i % 29 === 0 ? 'disposed' : 'assigned'
  return {
    id: `ast-${String(i + 1).padStart(3, '0')}`,
    tag: `SEIP/${category.code}/${String(1001 + i)}`,
    name,
    categoryId,
    supplierId: suppliers[i % suppliers.length].id,
    challanId: deliveryChallans[i % deliveryChallans.length].id,
    purchaseDate: `${purchaseYear}-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 27) + 1).padStart(2, '0')}`,
    purchaseValue: value,
    currentValue,
    locationId: assetLocations[i % assetLocations.length].id,
    assignedTo: status === 'assigned' ? ['Md. Rakibul Islam', 'Farhana Akter', 'Tanvir Hossain', 'Sharmin Sultana', 'Ashraful Alam'][i % 5] : null,
    condition: age === 0 ? 'new' : age > 3 ? 'needs repair' : 'good',
    status,
    serialNo: `SN${String(90000000 + i * 7717)}`,
  }
})

export const assetTransfers: AssetTransfer[] = Array.from({ length: 12 }, (_, i) => ({
  id: `trf-${String(i + 1).padStart(3, '0')}`,
  transferNo: `TR/SEIP/2026/${String(40 + i)}`,
  assetId: assets[(i * 4) % assets.length].id,
  fromLocationId: assetLocations[i % assetLocations.length].id,
  toLocationId: assetLocations[(i + 3) % assetLocations.length].id,
  date: `2026-${String(9 - Math.floor(i / 4)).padStart(2, '0')}-${String((i % 25) + 1).padStart(2, '0')}`,
  reason: ['Officer transferred to new station', 'Equipment reallocated to training centre', 'Returned to central store for repair'][i % 3],
  approvedBy: 'Md. Shafiqul Islam',
  status: i % 7 === 0 ? 'pending' : 'transferred',
}))
