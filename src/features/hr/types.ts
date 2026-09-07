export type EmploymentStatus = 'active' | 'inactive' | 'expired'
export type Gender = 'male' | 'female' | 'other'

export type EmployeeGroup = {
  id: string
  name: string
  code: string
  projectId: string
  description: string
  headcount: number
}

export type DesignationGroup = {
  id: string
  name: string
  code: string
  order: number
  description: string
}

export type Designation = {
  id: string
  title: string
  code: string
  groupId: string
  grade: string
  /** Consolidated monthly remuneration band, BDT. */
  minSalary: number
  maxSalary: number
  headcount: number
}

export type Employee = {
  id: string
  code: string
  name: string
  fatherName: string
  gender: Gender
  dateOfBirth: string
  nid: string
  tin: string
  mobile: string
  email: string
  presentAddress: string
  designationId: string
  employeeGroupId: string
  projectId: string
  joiningDate: string
  contractEndDate: string
  status: EmploymentStatus
  bank: string
  branch: string
  accountNo: string
  grossSalary: number
  bloodGroup: string
}
