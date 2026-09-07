export type LetterDirection = 'inward' | 'outward'
export type LetterPriority = 'normal' | 'urgent' | 'most urgent'
export type LetterStatus = 'new' | 'in review' | 'approved' | 'dispatched' | 'closed'

export type LetterEntity = {
  id: string
  name: string
  type: 'Ministry' | 'Agency' | 'Development Partner' | 'Training Institute' | 'Other'
  address: string
  focalPerson: string
  email: string
  phone: string
}

export type Letter = {
  id: string
  memoNo: string
  direction: LetterDirection
  subject: string
  entityId: string
  letterDate: string
  receivedDate: string
  priority: LetterPriority
  status: LetterStatus
  assignedTo: string
  attachments: number
  remarks: string
}

export type LetterDispatch = {
  id: string
  letterId: string
  dispatchNo: string
  dispatchDate: string
  mode: 'By hand' | 'Courier' | 'Email' | 'Postal'
  receiverName: string
  trackingNo: string
  status: 'dispatched' | 'delivered' | 'returned'
}

export type LetterMovement = {
  id: string
  letterId: string
  fromUser: string
  toUser: string
  action: 'forwarded' | 'noted' | 'approved' | 'returned'
  note: string
  at: string
}

export type Memo = {
  id: string
  memoNo: string
  subject: string
  body: string
  preparedBy: string
  approvedBy: string | null
  date: string
  status: 'draft' | 'approved' | 'issued'
}
