export type StipendDisbursement = {
  id: string
  month: string
  agency: string
  sector: string
  trainees: number
  ratePerTrainee: number
  amount: number
  status: 'paid' | 'processing' | 'pending'
}

export type TrainingGrant = {
  id: string
  agency: string
  batch: string
  sector: string
  trainees: number
  instalment: '1st' | '2nd' | 'Final'
  amount: number
  releaseDate: string
  status: 'paid' | 'approved' | 'pending'
}

export type AuditObservation = {
  id: string
  obsNo: string
  auditYear: string
  para: string
  observation: string
  amountInvolved: number
  reply: string
  status: 'settled' | 'under correspondence' | 'unsettled'
}

export type TaxCertificate = {
  id: string
  certNo: string
  party: string
  tin: string
  period: string
  grossAmount: number
  taxDeducted: number
  vatDeducted: number
  issueDate: string
}

const AGENCIES = [
  ['BGMEA Training Institute', 'RMG & Textile'],
  ['BKMEA Skills Centre', 'RMG & Textile'],
  ['LFMEAB Training Academy', 'Leather & Footwear'],
  ['UCEP Bangladesh', 'Light Engineering'],
  ['BASIS Institute of Technology', 'ICT'],
  ['BMET Technical Training Centre', 'Construction'],
]

const MONTHS = ['July 2026', 'August 2026', 'September 2026', 'June 2026', 'May 2026', 'April 2026']

export const stipendDisbursements: StipendDisbursement[] = Array.from({ length: 24 }, (_, i) => {
  const [agency, sector] = AGENCIES[i % AGENCIES.length]
  const trainees = 220 + ((i * 137) % 900)
  const rate = 9_600
  return {
    id: `stp-${String(i + 1).padStart(3, '0')}`,
    month: MONTHS[i % MONTHS.length],
    agency,
    sector,
    trainees,
    ratePerTrainee: rate,
    amount: trainees * rate,
    status: i % 9 === 0 ? 'pending' : i % 5 === 0 ? 'processing' : 'paid',
  }
})

export const trainingGrants: TrainingGrant[] = Array.from({ length: 22 }, (_, i) => {
  const [agency, sector] = AGENCIES[i % AGENCIES.length]
  const trainees = 400 + ((i * 211) % 1_600)
  const instalment = (['1st', '2nd', 'Final'] as const)[i % 3]
  const share = instalment === '1st' ? 0.4 : instalment === '2nd' ? 0.4 : 0.2
  return {
    id: `grt-${String(i + 1).padStart(3, '0')}`,
    agency,
    batch: `Batch ${2026}-${String(i + 1).padStart(2, '0')}`,
    sector,
    trainees,
    instalment,
    amount: Math.round(trainees * 26_500 * share),
    releaseDate: `2026-${String(9 - Math.floor(i / 8)).padStart(2, '0')}-${String((i % 26) + 1).padStart(2, '0')}`,
    status: i % 7 === 0 ? 'pending' : i % 4 === 0 ? 'approved' : 'paid',
  }
})

export const auditObservations: AuditObservation[] = [
  {
    id: 'fap-01',
    obsNo: 'FAPAD/SEIP/2025/14',
    auditYear: 'FY 2024-25',
    para: 'Para 14',
    observation: 'Training grant advance of ৳2.40 crore to two institutes remained unadjusted beyond the stipulated period.',
    amountInvolved: 2_40_00_000,
    reply: 'Adjustment vouchers submitted for ৳1.86 crore; balance under correspondence with the institutes.',
    status: 'under correspondence',
  },
  {
    id: 'fap-02',
    obsNo: 'FAPAD/SEIP/2025/21',
    auditYear: 'FY 2024-25',
    para: 'Para 21',
    observation: 'VAT was not deducted at source on three consultancy payments.',
    amountInvolved: 18_44_000,
    reply: 'VAT deposited through challan VR-202512-5582003 with a copy furnished to audit.',
    status: 'settled',
  },
  {
    id: 'fap-03',
    obsNo: 'FAPAD/SEIP/2024/08',
    auditYear: 'FY 2023-24',
    para: 'Para 8',
    observation: 'Fixed asset register did not reflect 14 items procured under package SEIP/G-01.',
    amountInvolved: 62_00_000,
    reply: 'Register updated and physical verification report attached.',
    status: 'settled',
  },
  {
    id: 'fap-04',
    obsNo: 'FAPAD/SEIP/2026/03',
    auditYear: 'FY 2025-26',
    para: 'Para 3',
    observation: 'Stipend paid to 96 trainees whose attendance records were incomplete.',
    amountInvolved: 9_21_600,
    reply: 'Attendance sheets being collected from the concerned training centres.',
    status: 'unsettled',
  },
]

export const taxCertificates: TaxCertificate[] = Array.from({ length: 16 }, (_, i) => {
  const parties = [
    'Smart Technologies (BD) Ltd.',
    'Uttara Motors Ltd.',
    'Development Insight Ltd.',
    'Padma Printing Press',
    'M/s Karim Enterprise',
    'Navana Furniture',
  ]
  const gross = 6_40_000 + ((i * 317_000) % 42_00_000)
  return {
    id: `tc-${String(i + 1).padStart(3, '0')}`,
    certNo: `SEIP/TAX-CERT/2026/${String(60 + i)}`,
    party: parties[i % parties.length],
    tin: String(400000000000 + i * 977),
    period: MONTHS[i % MONTHS.length],
    grossAmount: gross,
    taxDeducted: Math.round(gross * 0.05),
    vatDeducted: Math.round(gross * 0.075),
    issueDate: `2026-${String(9 - Math.floor(i / 6)).padStart(2, '0')}-${String((i % 25) + 1).padStart(2, '0')}`,
  }
})
