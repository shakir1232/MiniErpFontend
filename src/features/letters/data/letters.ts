import type { Letter, LetterDispatch, LetterEntity, LetterMovement, Memo } from '../types'

export const letterEntities: LetterEntity[] = [
  { id: 'ent-01', name: 'Finance Division, Ministry of Finance', type: 'Ministry', address: 'Bangladesh Secretariat, Dhaka-1000', focalPerson: 'Joint Secretary (Development)', email: 'dev@finance.gov.bd', phone: '+880 2 9515151' },
  { id: 'ent-02', name: 'Implementation Monitoring & Evaluation Division (IMED)', type: 'Ministry', address: 'Sher-e-Bangla Nagar, Dhaka-1207', focalPerson: 'Director (Sector-4)', email: 'sector4@imed.gov.bd', phone: '+880 2 9180077' },
  { id: 'ent-03', name: 'Economic Relations Division (ERD)', type: 'Ministry', address: 'Sher-e-Bangla Nagar, Dhaka-1207', focalPerson: 'Deputy Secretary (ADB Wing)', email: 'adb@erd.gov.bd', phone: '+880 2 9180088' },
  { id: 'ent-04', name: 'Asian Development Bank — Bangladesh Resident Mission', type: 'Development Partner', address: 'Plot E-31, Sher-e-Bangla Nagar, Dhaka-1207', focalPerson: 'Senior Project Officer', email: 'brm@adb.org', phone: '+880 2 5566 7000' },
  { id: 'ent-05', name: 'BGMEA Training Institute', type: 'Training Institute', address: 'Karwan Bazar, Dhaka-1215', focalPerson: 'Principal', email: 'training@bgmea.com.bd', phone: '+880 2 8140000' },
  { id: 'ent-06', name: 'Bangladesh Technical Education Board (BTEB)', type: 'Agency', address: 'Agargaon, Dhaka-1207', focalPerson: 'Controller of Examinations', email: 'exam@bteb.gov.bd', phone: '+880 2 8181818' },
  { id: 'ent-07', name: 'Office of the Comptroller & Auditor General', type: 'Agency', address: 'Audit Bhaban, Segunbagicha, Dhaka', focalPerson: 'Director (FAPAD)', email: 'fapad@cagbd.org', phone: '+880 2 9334455' },
]

const SUBJECTS_IN = [
  'Approval of the revised annual development programme allocation',
  'Submission of quarterly progress report for Q4 FY 2025-26',
  'Query on stipend disbursement for the leather sector batch',
  'Audit observation on training grant advance adjustment',
  'Request for nomination to the national skills workshop',
  'Clarification sought on procurement package SEIP/G-02/2026',
]

const SUBJECTS_OUT = [
  'Submission of monthly financial progress report — August 2026',
  'Request for release of the fourth tranche under Loan 3140-BAN',
  'Forwarding of certified trainee list for the RMG sector',
  'Reply to audit observation no. 14 of FAPAD',
  'Nomination of officers for the industry linkage workshop',
  'Request for extension of contract for individual consultants',
]

const OFFICERS = ['Md. Rakibul Islam', 'Farhana Akter', 'Tanvir Hossain', 'Sharmin Sultana', 'Rina Chowdhury']

export const letters: Letter[] = Array.from({ length: 42 }, (_, i) => {
  const direction: Letter['direction'] = i % 2 === 0 ? 'inward' : 'outward'
  const subjects = direction === 'inward' ? SUBJECTS_IN : SUBJECTS_OUT
  const month = 9 - Math.floor(i / 15)
  const day = ((i * 5) % 27) + 1
  const status: Letter['status'] =
    i % 9 === 0 ? 'new' : i % 7 === 0 ? 'in review' : i % 5 === 0 ? 'approved' : direction === 'outward' ? 'dispatched' : 'closed'
  return {
    id: `ltr-${String(i + 1).padStart(3, '0')}`,
    memoNo: `SEIP/${direction === 'inward' ? 'IN' : 'OUT'}/2026/${String(500 + i)}`,
    direction,
    subject: subjects[i % subjects.length],
    entityId: letterEntities[i % letterEntities.length].id,
    letterDate: `2026-${String(Math.max(month, 7)).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    receivedDate: `2026-${String(Math.max(month, 7)).padStart(2, '0')}-${String(Math.min(day + 2, 28)).padStart(2, '0')}`,
    priority: i % 11 === 0 ? 'most urgent' : i % 4 === 0 ? 'urgent' : 'normal',
    status,
    assignedTo: OFFICERS[i % OFFICERS.length],
    attachments: i % 4,
    remarks: ['Placed before the Project Director', 'Awaiting reply from the training institute', 'Filed after action taken'][i % 3],
  }
})

export const letterDispatches: LetterDispatch[] = letters
  .filter((l) => l.direction === 'outward' && l.status === 'dispatched')
  .map((letter, i) => ({
    id: `dsp-${String(i + 1).padStart(3, '0')}`,
    letterId: letter.id,
    dispatchNo: `DSP/2026/${String(300 + i)}`,
    dispatchDate: letter.letterDate,
    mode: (['By hand', 'Courier', 'Email', 'Postal'] as const)[i % 4],
    receiverName: ['Reception Desk', 'Sundarban Courier', 'Email gateway', 'GPO Dhaka'][i % 4],
    trackingNo: `TRK${String(778800 + i * 13)}`,
    status: i % 8 === 0 ? 'returned' : i % 3 === 0 ? 'dispatched' : 'delivered',
  }))

export const letterMovements: LetterMovement[] = letters.slice(0, 18).flatMap((letter, i) => [
  {
    id: `mv-${letter.id}-1`,
    letterId: letter.id,
    fromUser: 'Receiving Desk',
    toUser: OFFICERS[i % OFFICERS.length],
    action: 'forwarded' as const,
    note: 'Forwarded for necessary action',
    at: `${letter.receivedDate}T10:${String((i * 7) % 60).padStart(2, '0')}:00`,
  },
  {
    id: `mv-${letter.id}-2`,
    letterId: letter.id,
    fromUser: OFFICERS[i % OFFICERS.length],
    toUser: 'Md. Shafiqul Islam',
    action: (i % 3 === 0 ? 'noted' : 'approved') as 'noted' | 'approved',
    note: i % 3 === 0 ? 'Noted and placed for approval' : 'Approved for onward action',
    at: `${letter.receivedDate}T15:${String((i * 11) % 60).padStart(2, '0')}:00`,
  },
])

export const memos: Memo[] = Array.from({ length: 12 }, (_, i) => ({
  id: `memo-${String(i + 1).padStart(3, '0')}`,
  memoNo: `SEIP/MEMO/2026/${String(80 + i)}`,
  subject: [
    'Office order on the constitution of the procurement evaluation committee',
    'Circular on submission of monthly expenditure statements',
    'Notice for the quarterly project steering committee meeting',
    'Office order on assignment of additional responsibilities',
  ][i % 4],
  body:
    'All concerned officers are requested to take note of the following and ensure compliance within the stipulated time. Any deviation must be reported to the Project Director with justification.',
  preparedBy: OFFICERS[i % OFFICERS.length],
  approvedBy: i % 3 === 0 ? null : 'Md. Shafiqul Islam',
  date: `2026-${String(9 - Math.floor(i / 5)).padStart(2, '0')}-${String((i % 26) + 1).padStart(2, '0')}`,
  status: i % 3 === 0 ? 'draft' : i % 5 === 0 ? 'approved' : 'issued',
}))
