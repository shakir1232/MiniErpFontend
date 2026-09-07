export type FiscalYear = {
  id: string
  label: string
  start: string
  end: string
  current: boolean
}

/** Bangladeshi fiscal year runs 1 July – 30 June. */
export const fiscalYears: FiscalYear[] = [
  { id: 'fy-2022-23', label: 'FY 2022-23', start: '2022-07-01', end: '2023-06-30', current: false },
  { id: 'fy-2023-24', label: 'FY 2023-24', start: '2023-07-01', end: '2024-06-30', current: false },
  { id: 'fy-2024-25', label: 'FY 2024-25', start: '2024-07-01', end: '2025-06-30', current: false },
  { id: 'fy-2025-26', label: 'FY 2025-26', start: '2025-07-01', end: '2026-06-30', current: false },
  { id: 'fy-2026-27', label: 'FY 2026-27', start: '2026-07-01', end: '2027-06-30', current: true },
]

export const currentFiscalYear = fiscalYears.find((f) => f.current) ?? fiscalYears[fiscalYears.length - 1]

export const MONTHS = [
  'July', 'August', 'September', 'October', 'November', 'December',
  'January', 'February', 'March', 'April', 'May', 'June',
] as const

export type FiscalMonth = (typeof MONTHS)[number]
