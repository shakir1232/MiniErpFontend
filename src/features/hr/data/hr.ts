import type { Designation, DesignationGroup, Employee, EmployeeGroup } from '../types'

export const designationGroups: DesignationGroup[] = [
  { id: 'dg-01', name: 'Management', code: 'MGT', order: 1, description: 'Project director, deputy directors and heads of unit' },
  { id: 'dg-02', name: 'Technical & Professional', code: 'TEC', order: 2, description: 'Specialists, engineers, analysts and consultants' },
  { id: 'dg-03', name: 'Finance & Accounts', code: 'FIN', order: 3, description: 'Accounts, audit and procurement staff' },
  { id: 'dg-04', name: 'Administration', code: 'ADM', order: 4, description: 'Administrative, HR and logistics staff' },
  { id: 'dg-05', name: 'Support Staff', code: 'SUP', order: 5, description: 'Drivers, office assistants and security' },
]

export const designations: Designation[] = [
  { id: 'des-01', title: 'Project Director', code: 'PD', groupId: 'dg-01', grade: 'Grade 3', minSalary: 2_10_000, maxSalary: 2_60_000, headcount: 1 },
  { id: 'des-02', title: 'Deputy Project Director', code: 'DPD', groupId: 'dg-01', grade: 'Grade 4', minSalary: 1_65_000, maxSalary: 2_00_000, headcount: 3 },
  { id: 'des-03', title: 'Assistant Director (Finance)', code: 'AD-FIN', groupId: 'dg-03', grade: 'Grade 6', minSalary: 1_05_000, maxSalary: 1_35_000, headcount: 6 },
  { id: 'des-04', title: 'Senior Accounts Officer', code: 'SAO', groupId: 'dg-03', grade: 'Grade 7', minSalary: 82_000, maxSalary: 1_05_000, headcount: 9 },
  { id: 'des-05', title: 'Accounts Officer', code: 'AO', groupId: 'dg-03', grade: 'Grade 9', minSalary: 58_000, maxSalary: 76_000, headcount: 14 },
  { id: 'des-06', title: 'Monitoring & Evaluation Specialist', code: 'MES', groupId: 'dg-02', grade: 'Grade 5', minSalary: 1_35_000, maxSalary: 1_70_000, headcount: 4 },
  { id: 'des-07', title: 'Training Coordinator', code: 'TC', groupId: 'dg-02', grade: 'Grade 7', minSalary: 84_000, maxSalary: 1_08_000, headcount: 22 },
  { id: 'des-08', title: 'MIS Officer', code: 'MIS', groupId: 'dg-02', grade: 'Grade 9', minSalary: 60_000, maxSalary: 78_000, headcount: 11 },
  { id: 'des-09', title: 'HR Officer', code: 'HRO', groupId: 'dg-04', grade: 'Grade 9', minSalary: 58_000, maxSalary: 74_000, headcount: 5 },
  { id: 'des-10', title: 'Administrative Officer', code: 'ADO', groupId: 'dg-04', grade: 'Grade 9', minSalary: 56_000, maxSalary: 72_000, headcount: 12 },
  { id: 'des-11', title: 'Computer Operator', code: 'CO', groupId: 'dg-04', grade: 'Grade 13', minSalary: 32_000, maxSalary: 44_000, headcount: 18 },
  { id: 'des-12', title: 'Driver', code: 'DRV', groupId: 'dg-05', grade: 'Grade 16', minSalary: 24_000, maxSalary: 33_000, headcount: 26 },
  { id: 'des-13', title: 'Office Assistant', code: 'OA', groupId: 'dg-05', grade: 'Grade 20', minSalary: 18_000, maxSalary: 24_000, headcount: 31 },
]

export const employeeGroups: EmployeeGroup[] = [
  { id: 'eg-01', name: 'PMU — Head Office', code: 'PMU-HO', projectId: 'prj-001', description: 'Programme management unit at Dhaka head office', headcount: 96 },
  { id: 'eg-02', name: 'PIU — Divisional Offices', code: 'PIU-DIV', projectId: 'prj-001', description: 'Project implementation units in 8 divisions', headcount: 148 },
  { id: 'eg-03', name: 'Consultants (Individual)', code: 'CONS', projectId: 'prj-001', description: 'Individual consultants on fixed-term contracts', headcount: 34 },
  { id: 'eg-04', name: 'Support Services', code: 'SUPP', projectId: 'prj-001', description: 'Drivers, office assistants and security personnel', headcount: 88 },
  { id: 'eg-05', name: 'STAR-II Core Team', code: 'STAR-CT', projectId: 'prj-002', description: 'Core project team for STAR Phase II', headcount: 46 },
]

const FIRST = ['Md. Rakibul', 'Farhana', 'Tanvir', 'Sharmin', 'Abdullah Al', 'Nusrat', 'Shahriar', 'Mahfuza', 'Ashraful', 'Sadia', 'Mizanur', 'Rubina', 'Kamrul', 'Israt', 'Jahangir', 'Tahmina', 'Sabbir', 'Rehana', 'Nazmul', 'Farzana']
const LAST = ['Islam', 'Akter', 'Hossain', 'Sultana', 'Mamun', 'Jahan', 'Kabir', 'Khatun', 'Alam', 'Rahman', 'Chowdhury', 'Begum', 'Haque', 'Ferdous', 'Uddin', 'Nasrin', 'Ahmed', 'Parvin', 'Karim', 'Yasmin']
const BANKS: [string, string][] = [
  ['Sonali Bank PLC', 'Ramna Corporate Branch'],
  ['Agrani Bank PLC', 'Motijheel Branch'],
  ['Janata Bank PLC', 'Local Office, Dhaka'],
  ['Rupali Bank PLC', 'Agrabad Branch'],
  ['BRAC Bank PLC', 'Gulshan Branch'],
]
const BLOOD = ['A+', 'B+', 'O+', 'AB+', 'A-', 'B-', 'O-']

/** 60 deterministic employee records — enough to exercise paging, filters and payroll. */
export const employees: Employee[] = Array.from({ length: 60 }, (_, i) => {
  const designation = designations[i % designations.length]
  const group = employeeGroups[i % employeeGroups.length]
  const [bank, branch] = BANKS[i % BANKS.length]
  const female = i % 3 === 1
  const first = FIRST[i % FIRST.length]
  const last = LAST[(i * 7) % LAST.length]
  const salary = designation.minSalary + ((i * 3137) % (designation.maxSalary - designation.minSalary))
  const joinYear = 2016 + (i % 9)
  const endYear = joinYear + 4 + (i % 5)
  const status = endYear < 2026 ? 'expired' : i % 17 === 0 ? 'inactive' : 'active'

  return {
    id: `emp-${String(i + 1).padStart(3, '0')}`,
    code: `SEIP-${String(1001 + i)}`,
    name: `${first} ${last}`,
    fatherName: `${LAST[(i * 3) % LAST.length]} ${FIRST[(i * 5) % FIRST.length]}`,
    gender: female ? 'female' : 'male',
    dateOfBirth: `${1978 + (i % 20)}-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 27) + 1).padStart(2, '0')}`,
    nid: `19${80 + (i % 15)}${String(1000000000 + i * 7919).slice(0, 10)}`,
    tin: String(500000000000 + i * 131),
    mobile: `+8801${7 + (i % 3)}${String(10000000 + i * 65437).slice(0, 8)}`,
    email: `${first.toLowerCase().replace(/[^a-z]/g, '')}.${last.toLowerCase()}${i}@seip-fd.gov.bd`,
    presentAddress: `House ${10 + (i % 80)}, Road ${1 + (i % 22)}, ${['Dhanmondi', 'Uttara', 'Mirpur', 'Banani', 'Mohammadpur'][i % 5]}, Dhaka`,
    designationId: designation.id,
    employeeGroupId: group.id,
    projectId: group.projectId,
    joiningDate: `${joinYear}-${String((i % 12) + 1).padStart(2, '0')}-01`,
    contractEndDate: `${endYear}-${String((i % 12) + 1).padStart(2, '0')}-30`,
    status: status as Employee['status'],
    bank,
    branch,
    accountNo: `${1000 + (i % 900)}-${String(20000000 + i * 3313).slice(0, 8)}`,
    grossSalary: Math.round(salary / 500) * 500,
    bloodGroup: BLOOD[i % BLOOD.length],
  }
})
