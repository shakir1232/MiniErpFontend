import { MODULES } from '@/config/navigation'
import type { AppRole, AppUser, MenuPermission } from '../types'

export const roles: AppRole[] = [
  {
    id: 'role-01',
    name: 'System Administrator',
    code: 'ADMIN',
    description: 'Unrestricted access to every module and setting',
    modules: MODULES.map((m) => m.key),
    userCount: 3,
    system: true,
  },
  {
    id: 'role-02',
    name: 'Project Director',
    code: 'PD',
    description: 'Approves vouchers, payroll and budget revisions',
    modules: ['dashboard', 'projects', 'budget', 'accounting', 'payroll', 'hr', 'assets', 'letters'],
    userCount: 2,
    system: true,
  },
  {
    id: 'role-03',
    name: 'Accounts Officer',
    code: 'ACC',
    description: 'Prepares vouchers, registers and financial statements',
    modules: ['dashboard', 'projects', 'budget', 'accounting', 'payroll', 'settings'],
    userCount: 9,
    system: false,
  },
  {
    id: 'role-04',
    name: 'HR Officer',
    code: 'HR',
    description: 'Maintains employees, contracts and payroll inputs',
    modules: ['dashboard', 'hr', 'payroll', 'letters'],
    userCount: 5,
    system: false,
  },
  {
    id: 'role-05',
    name: 'Store Keeper',
    code: 'STORE',
    description: 'Handles asset and consumable store movements',
    modules: ['dashboard', 'assets', 'store'],
    userCount: 4,
    system: false,
  },
  {
    id: 'role-06',
    name: 'Viewer',
    code: 'VIEW',
    description: 'Read-only access to dashboards and reports',
    modules: ['dashboard', 'projects', 'budget'],
    userCount: 12,
    system: false,
  },
]

const NAMES = [
  ['Md. Hafijur Rahman', 'System Administrator'],
  ['Md. Shafiqul Islam', 'Project Director'],
  ['Nasrin Sultana', 'Deputy Project Director'],
  ['Farhana Akter', 'Assistant Director (Finance)'],
  ['Tanvir Hossain', 'HR Officer'],
  ['Md. Rakibul Islam', 'Administrative Officer'],
  ['Sabbir Ahmed', 'Store Keeper'],
  ['Sharmin Sultana', 'Senior Accounts Officer'],
  ['Ashraful Alam', 'MIS Officer'],
  ['Rina Chowdhury', 'Computer Operator'],
  ['Kamrul Uddin', 'Accounts Officer'],
  ['Tahmina Ahmed', 'Training Coordinator'],
  ['Nazmul Karim', 'M&E Specialist'],
  ['Sadia Yasmin', 'Administrative Officer'],
]

export const appUsers: AppUser[] = NAMES.map(([fullName, designation], i) => ({
  id: `usr-${String(i + 1).padStart(3, '0')}`,
  username: fullName.split(' ').slice(-1)[0].toLowerCase() + (i + 1),
  fullName,
  email: `${fullName.split(' ').slice(-1)[0].toLowerCase()}${i + 1}@seip-fd.gov.bd`,
  designation,
  roleId: roles[i % roles.length].id,
  employeeCode: `SEIP-${1001 + i}`,
  lastLogin: `2026-09-${String(((i * 3) % 7) + 1).padStart(2, '0')}T${String(9 + (i % 8)).padStart(2, '0')}:${String((i * 7) % 60).padStart(2, '0')}:00`,
  status: i % 11 === 0 ? 'locked' : i % 7 === 0 ? 'inactive' : 'active',
}))

/** Screen-level permission matrix, seeded per module. */
export const menuPermissions: MenuPermission[] = MODULES.flatMap((module) =>
  module.sections.flatMap((section) =>
    section.items.map((item, i) => ({
      moduleKey: module.key,
      screen: item.title,
      path: item.to,
      view: true,
      create: i % 4 !== 3,
      edit: i % 3 !== 2,
      approve: i % 5 === 0,
    })),
  ),
)
