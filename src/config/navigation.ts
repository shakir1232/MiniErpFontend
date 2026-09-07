import type { LucideIcon } from 'lucide-react'
import {
  Banknote,
  BookOpenCheck,
  Boxes,
  Building2,
  ClipboardList,
  FileSpreadsheet,
  FolderKanban,
  LayoutDashboard,
  Mail,
  Package,
  Settings2,
  ShieldCheck,
  Users,
  Wallet,
} from 'lucide-react'

export type NavItem = {
  title: string
  to: string
  /** Marks screens that are placeholders in the prototype. */
  planned?: boolean
}

export type NavSection = {
  title: string
  items: NavItem[]
}

export type ModuleKey =
  | 'dashboard'
  | 'projects'
  | 'budget'
  | 'accounting'
  | 'payroll'
  | 'hr'
  | 'assets'
  | 'store'
  | 'letters'
  | 'settings'
  | 'users'

export type ModuleDef = {
  key: ModuleKey
  title: string
  short: string
  description: string
  icon: LucideIcon
  /** Route prefix; also the module's landing route. */
  basePath: string
  sections: NavSection[]
}

export const MODULES: ModuleDef[] = [
  {
    key: 'dashboard',
    title: 'Dashboard',
    short: 'Home',
    description: 'Programme-wide financial and delivery overview',
    icon: LayoutDashboard,
    basePath: '/dashboard',
    sections: [
      {
        title: 'Overview',
        items: [
          { title: 'Executive Summary', to: '/dashboard' },
          { title: 'Fund Utilisation', to: '/dashboard/fund-utilisation' },
          { title: 'Activity Feed', to: '/dashboard/activity' },
        ],
      },
    ],
  },
  {
    key: 'projects',
    title: 'Project',
    short: 'Project',
    description: 'Project profile, agencies, funding and bank accounts',
    icon: FolderKanban,
    basePath: '/projects',
    sections: [
      {
        title: 'Project',
        items: [
          { title: 'Projects Info', to: '/projects' },
          { title: 'Project Organization', to: '/projects/organization' },
        ],
      },
    ],
  },
  {
    key: 'budget',
    title: 'Budget',
    short: 'Budget',
    description: 'DPP / RDPP / ADP budgeting, allocation and IMED reporting',
    icon: Wallet,
    basePath: '/budget',
    sections: [
      {
        title: 'Budget Setup',
        items: [
          { title: 'Original DPP Setup', to: '/budget/dpp-setup' },
          { title: 'Original RDPP Budget', to: '/budget/rdpp' },
          { title: 'Yearly ADP Budget Setup', to: '/budget/adp-setup' },
        ],
      },
      {
        title: 'Budget Views',
        items: [
          { title: 'RDPP Yearly Budget', to: '/budget/rdpp-yearly' },
          { title: 'RDPP Code Wise Budget', to: '/budget/rdpp-code-wise' },
          { title: 'ADP Yearly Budget', to: '/budget/adp-yearly' },
          { title: 'RADP Yearly Budget', to: '/budget/radp-yearly' },
        ],
      },
      {
        title: 'Allocation & Expenditure',
        items: [
          { title: 'Tranche Wise Allocation', to: '/budget/tranche-allocation' },
          { title: 'Tranche Mapping', to: '/budget/tranche-mapping' },
          { title: 'Expenditure Entry', to: '/budget/expenditure' },
        ],
      },
      {
        title: 'Chart of Accounts Mapping',
        items: [
          { title: 'ADB Group (CoA)', to: '/budget/adb-group' },
          { title: 'ADB Group Category', to: '/budget/adb-group-category' },
          { title: 'Group Mapping', to: '/budget/group-mapping' },
        ],
      },
      {
        title: 'Reports',
        items: [
          { title: 'RDPP Variance Report', to: '/budget/reports/rdpp-variance' },
          { title: 'RADP Report', to: '/budget/reports/radp' },
          { title: 'RADP Variance Report', to: '/budget/reports/radp-variance' },
          { title: 'Tranche Wise Expenditure', to: '/budget/reports/tranche-expenditure' },
          { title: 'IMED Monthly Progress', to: '/budget/reports/imed-monthly' },
          { title: 'IMED Quarterly Progress', to: '/budget/reports/imed-quarterly' },
          { title: 'Target & Achievement', to: '/budget/reports/target-achievement' },
          { title: 'ERD Monthly Report', to: '/budget/reports/erd-monthly' },
          { title: 'Quarterly Financial Progress', to: '/budget/reports/quarterly-financial' },
          { title: 'Implementation Problems (C)', to: '/budget/reports/implementation-problems' },
          { title: 'Contract Implementation (D)', to: '/budget/reports/contract-implementation' },
        ],
      },
    ],
  },
  {
    key: 'accounting',
    title: 'Accounting',
    short: 'Accounts',
    description: 'Chart of accounts, vouchers, registers and financial statements',
    icon: BookOpenCheck,
    basePath: '/accounting',
    sections: [
      {
        title: 'Masters',
        items: [
          { title: 'Chart of Accounts', to: '/accounting/chart-of-accounts' },
          { title: 'Subsidiary Ledger', to: '/accounting/subsidiary-ledger' },
        ],
      },
      {
        title: 'Transactions',
        items: [
          { title: 'Debit Voucher', to: '/accounting/vouchers/debit' },
          { title: 'Credit Voucher', to: '/accounting/vouchers/credit' },
          { title: 'Journal Voucher', to: '/accounting/vouchers/journal' },
          { title: 'Advance Control Register', to: '/accounting/advance-control-register' },
        ],
      },
      {
        title: 'Registers',
        items: [
          { title: 'Cheque Register', to: '/accounting/cheque-register' },
          { title: 'Advice Register', to: '/accounting/advice-register' },
        ],
      },
      {
        title: 'Reports',
        items: [
          { title: 'Group Statement', to: '/accounting/reports/group-statement' },
          { title: 'Ledger Statement', to: '/accounting/reports/ledger-statement' },
          { title: 'Trial Balance', to: '/accounting/reports/trial-balance' },
          { title: 'Summary Balance', to: '/accounting/reports/summary-balance' },
          { title: 'Stipend Report', to: '/accounting/reports/stipend' },
          { title: 'Training Grant Statement', to: '/accounting/reports/training-grant-statement' },
          { title: 'Monthly Expense Report', to: '/accounting/reports/monthly-expense' },
          { title: 'IAS Wise Disbursement', to: '/accounting/reports/ias-disbursement' },
          { title: 'FAPAD Report', to: '/accounting/reports/fapad' },
          { title: 'SOE Report', to: '/accounting/reports/soe' },
          { title: 'Financial Statement', to: '/accounting/reports/financial-statement' },
          { title: 'VAT / Tax Certificate', to: '/accounting/reports/tax-certificate' },
        ],
      },
    ],
  },
  {
    key: 'payroll',
    title: 'Payroll',
    short: 'Payroll',
    description: 'Contracts, salary processing, challans and statements',
    icon: Banknote,
    basePath: '/payroll',
    sections: [
      {
        title: 'Overview',
        items: [{ title: 'Payroll Dashboard', to: '/payroll' }],
      },
      {
        title: 'Setup',
        items: [
          { title: 'Employee Payroll', to: '/payroll/employees' },
          { title: 'Employee Contracts', to: '/payroll/contracts' },
          { title: 'Monthly Salary Adjustment', to: '/payroll/adjustments' },
        ],
      },
      {
        title: 'Processing',
        items: [
          { title: 'Process Payroll Salary', to: '/payroll/process' },
          { title: 'Additional Salary Process', to: '/payroll/additional-salary' },
          { title: 'TAX Challan', to: '/payroll/tax-challan' },
          { title: 'VAT Challan', to: '/payroll/vat-challan' },
        ],
      },
      {
        title: 'Statements',
        items: [
          { title: 'Statement of Remuneration', to: '/payroll/statements/remuneration' },
          { title: 'Monthly Salary Advice', to: '/payroll/statements/salary-advice' },
          { title: 'Statement of VAT & Tax', to: '/payroll/statements/vat-tax' },
          { title: 'Statement of Employee', to: '/payroll/statements/employee' },
          { title: 'Employee Bank Statement', to: '/payroll/statements/bank' },
          { title: 'Employee Tax Certificate', to: '/payroll/statements/tax-certificate' },
          { title: 'Expenditure & Balance', to: '/payroll/statements/expenditure-balance' },
          { title: 'Incremental Details', to: '/payroll/statements/incremental' },
        ],
      },
    ],
  },
  {
    key: 'hr',
    title: 'HR Management',
    short: 'HR',
    description: 'Employees, designations and employee groups',
    icon: Users,
    basePath: '/hr',
    sections: [
      {
        title: 'People',
        items: [
          { title: 'Employees', to: '/hr/employees' },
          { title: 'Designations', to: '/hr/designations' },
          { title: 'Designation Groups', to: '/hr/designation-groups' },
          { title: 'Employee Groups', to: '/hr/employee-groups' },
        ],
      },
    ],
  },
  {
    key: 'assets',
    title: 'Asset Management',
    short: 'Assets',
    description: 'Procurement, assignment, transfer and fixed asset register',
    icon: Boxes,
    basePath: '/assets',
    sections: [
      {
        title: 'Masters',
        items: [
          { title: 'Suppliers', to: '/assets/suppliers' },
          { title: 'Asset Categories', to: '/assets/categories' },
          { title: 'Asset Locations', to: '/assets/locations' },
        ],
      },
      {
        title: 'Operations',
        items: [
          { title: 'Delivery Challan', to: '/assets/challans' },
          { title: 'Asset Assign', to: '/assets/assignments' },
          { title: 'Asset Transfer', to: '/assets/transfers' },
        ],
      },
      {
        title: 'Register',
        items: [{ title: 'Fixed Asset Register', to: '/assets/register' }],
      },
    ],
  },
  {
    key: 'store',
    title: 'Consumer Item',
    short: 'Store',
    description: 'Consumable store items, receive, issue and stock position',
    icon: Package,
    basePath: '/store',
    sections: [
      {
        title: 'Masters',
        items: [
          { title: 'Item Categories', to: '/store/categories' },
          { title: 'Store Items', to: '/store/items' },
        ],
      },
      {
        title: 'Movements',
        items: [
          { title: 'Item Receive', to: '/store/receives' },
          { title: 'Item Issue', to: '/store/issues' },
        ],
      },
      {
        title: 'Reports',
        items: [
          { title: 'Store Register', to: '/store/register' },
          { title: 'Current Stock Position', to: '/store/stock' },
        ],
      },
    ],
  },
  {
    key: 'letters',
    title: 'Letter Tracking',
    short: 'Letters',
    description: 'Inward / outward correspondence, dispatch and memos',
    icon: Mail,
    basePath: '/letters',
    sections: [
      {
        title: 'Overview',
        items: [{ title: 'Letter Dashboard', to: '/letters' }],
      },
      {
        title: 'Correspondence',
        items: [
          { title: 'All Letters', to: '/letters/list' },
          { title: 'Add Letter', to: '/letters/new' },
          { title: 'Dispatch Letter', to: '/letters/dispatch' },
          { title: 'Memo Writing', to: '/letters/memos' },
        ],
      },
      {
        title: 'Register',
        items: [{ title: 'Tracking Register', to: '/letters/register' }],
      },
    ],
  },
  {
    key: 'settings',
    title: 'Settings',
    short: 'Setup',
    description: 'Reference data used across every module',
    icon: Settings2,
    basePath: '/settings',
    sections: [
      {
        title: 'Agencies',
        items: [
          { title: 'Implementing Agency', to: '/settings/implementing-agencies' },
          { title: 'Funding Agency', to: '/settings/funding-agencies' },
          { title: 'Ministry', to: '/settings/ministries' },
          { title: 'Ministry Directorates', to: '/settings/ministry-directorates' },
        ],
      },
      {
        title: 'Finance Reference',
        items: [
          { title: 'Source of Fund', to: '/settings/fund-sources' },
          { title: 'Fund Categories', to: '/settings/fund-categories' },
          { title: 'Currency', to: '/settings/currencies' },
          { title: 'Bank', to: '/settings/banks' },
          { title: 'Bank Branch', to: '/settings/bank-branches' },
        ],
      },
      {
        title: 'Project Reference',
        items: [
          { title: 'Project Types', to: '/settings/project-types' },
          { title: 'Project Sectors', to: '/settings/project-sectors' },
        ],
      },
      {
        title: 'Documents',
        items: [
          { title: 'Signature Setup', to: '/settings/signatures' },
          { title: 'Association Group Setup', to: '/settings/association-groups' },
        ],
      },
    ],
  },
  {
    key: 'users',
    title: 'User Management',
    short: 'Access',
    description: 'Users, roles and menu permissions',
    icon: ShieldCheck,
    basePath: '/users',
    sections: [
      {
        title: 'Access Control',
        items: [
          { title: 'Users', to: '/users' },
          { title: 'Roles', to: '/users/roles' },
          { title: 'Menu Permissions', to: '/users/menus' },
        ],
      },
    ],
  },
]

export const MODULE_MAP = Object.fromEntries(MODULES.map((m) => [m.key, m])) as Record<ModuleKey, ModuleDef>

/** Icons reused by feature pages that are not module roots. */
export const MISC_ICONS = { Building2, ClipboardList, FileSpreadsheet }

export function findModuleByPath(pathname: string): ModuleDef | undefined {
  return MODULES.filter((m) => pathname === m.basePath || pathname.startsWith(`${m.basePath}/`)).sort(
    (a, b) => b.basePath.length - a.basePath.length,
  )[0]
}

export function findNavItemByPath(pathname: string): { module: ModuleDef; section: NavSection; item: NavItem } | undefined {
  for (const module of MODULES) {
    for (const section of module.sections) {
      for (const item of section.items) {
        if (item.to === pathname) return { module, section, item }
      }
    }
  }
  return undefined
}

/** Flat list used by the command palette / global search. */
export const ALL_NAV_ITEMS = MODULES.flatMap((module) =>
  module.sections.flatMap((section) =>
    section.items.map((item) => ({ ...item, module, section: section.title })),
  ),
)
