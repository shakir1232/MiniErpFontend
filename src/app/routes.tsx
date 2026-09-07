import type { ReactElement } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/components/layout/app-shell'
import { PlaceholderPage } from '@/components/common/placeholder-page'
import { ALL_NAV_ITEMS } from '@/config/navigation'
import { RequireAuth } from './require-auth'

import { DashboardPage } from '@/features/dashboard/pages/dashboard-page'
import { FundUtilisationPage } from '@/features/dashboard/pages/fund-utilisation-page'
import { ActivityPage } from '@/features/dashboard/pages/activity-page'
import { ProjectsPage } from '@/features/projects/pages/projects-page'
import { ProjectDetailPage } from '@/features/projects/pages/project-detail-page'
import { OrganizationPage } from '@/features/projects/pages/organization-page'
import { SignInPage } from '@/features/auth/pages/sign-in-page'
import { ProfilePage } from '@/features/misc/pages/profile-page'
import { NotFoundPage } from '@/features/misc/pages/not-found-page'
import { EmployeesPage } from '@/features/hr/pages/employees-page'
import { DesignationsPage } from '@/features/hr/pages/designations-page'
import { DesignationGroupsPage } from '@/features/hr/pages/designation-groups-page'
import { EmployeeGroupsPage } from '@/features/hr/pages/employee-groups-page'
import { PayrollDashboardPage } from '@/features/payroll/pages/payroll-dashboard-page'
import { PayrollEmployeesPage } from '@/features/payroll/pages/payroll-employees-page'
import { ContractsPage } from '@/features/payroll/pages/contracts-page'
import { AdjustmentsPage } from '@/features/payroll/pages/adjustments-page'
import { ProcessPayrollPage } from '@/features/payroll/pages/process-payroll-page'
import { ChallanPage } from '@/features/payroll/pages/challan-page'
import { RemunerationStatementPage } from '@/features/payroll/pages/remuneration-statement-page'
import { BankStatementPage } from '@/features/payroll/pages/bank-statement-page'
import { ChartOfAccountsPage } from '@/features/accounting/pages/chart-of-accounts-page'
import { VouchersPage } from '@/features/accounting/pages/vouchers-page'
import {
  AdvanceRegisterPage,
  AdviceRegisterPage,
  ChequeRegisterPage,
} from '@/features/accounting/pages/registers-page'
import {
  GroupStatementPage,
  LedgerStatementPage,
  SubsidiaryLedgerPage,
  TrialBalancePage,
} from '@/features/accounting/pages/reports-page'

/**
 * Screens that are actually built. Anything else declared in the navigation
 * registry falls back to a placeholder so no menu entry dead-ends.
 */
const IMPLEMENTED: Record<string, ReactElement> = {
  '/dashboard': <DashboardPage />,
  '/dashboard/fund-utilisation': <FundUtilisationPage />,
  '/dashboard/activity': <ActivityPage />,
  '/projects': <ProjectsPage />,
  '/projects/organization': <OrganizationPage />,
  '/hr/employees': <EmployeesPage />,
  '/hr/designations': <DesignationsPage />,
  '/hr/designation-groups': <DesignationGroupsPage />,
  '/hr/employee-groups': <EmployeeGroupsPage />,
  '/payroll': <PayrollDashboardPage />,
  '/payroll/employees': <PayrollEmployeesPage />,
  '/payroll/contracts': <ContractsPage />,
  '/payroll/adjustments': <AdjustmentsPage />,
  '/payroll/process': <ProcessPayrollPage />,
  '/payroll/tax-challan': <ChallanPage kind="tax" />,
  '/payroll/vat-challan': <ChallanPage kind="vat" />,
  '/payroll/statements/remuneration': <RemunerationStatementPage />,
  '/payroll/statements/bank': <BankStatementPage />,
  '/accounting/chart-of-accounts': <ChartOfAccountsPage />,
  '/accounting/subsidiary-ledger': <SubsidiaryLedgerPage />,
  '/accounting/vouchers/debit': <VouchersPage type="debit" />,
  '/accounting/vouchers/credit': <VouchersPage type="credit" />,
  '/accounting/vouchers/journal': <VouchersPage type="journal" />,
  '/accounting/advance-control-register': <AdvanceRegisterPage />,
  '/accounting/cheque-register': <ChequeRegisterPage />,
  '/accounting/advice-register': <AdviceRegisterPage />,
  '/accounting/reports/group-statement': <GroupStatementPage />,
  '/accounting/reports/ledger-statement': <LedgerStatementPage />,
  '/accounting/reports/trial-balance': <TrialBalancePage />,
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/sign-in" element={<SignInPage />} />
      <Route
        element={
          <RequireAuth>
            <AppShell />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        {ALL_NAV_ITEMS.map((item) => (
          <Route key={item.to} path={item.to} element={IMPLEMENTED[item.to] ?? <PlaceholderPage />} />
        ))}
        <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
