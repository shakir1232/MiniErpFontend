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
import { BudgetItemsPage } from '@/features/budget/pages/budget-items-page'
import { YearlyBudgetPage } from '@/features/budget/pages/yearly-budget-page'
import { CodeWiseBudgetPage } from '@/features/budget/pages/code-wise-budget-page'
import { ExpenditureEntryPage } from '@/features/budget/pages/expenditure-entry-page'
import {
  AdbGroupPage,
  GroupMappingPage,
  TrancheAllocationPage,
} from '@/features/budget/pages/tranche-pages'
import {
  ContractImplementationPage,
  ImplementationProblemsPage,
  ProgressReportPage,
  TrancheExpenditurePage,
  VarianceReportPage,
} from '@/features/budget/pages/budget-reports-page'
import {
  AssetCategoriesPage,
  AssetLocationsPage,
  SuppliersPage,
} from '@/features/assets/pages/asset-masters-page'
import {
  AssetAssignmentsPage,
  AssetTransfersPage,
  DeliveryChallansPage,
  FixedAssetRegisterPage,
} from '@/features/assets/pages/asset-operations-page'
import {
  ItemCategoriesPage,
  ItemIssuesPage,
  ItemReceivesPage,
  StockPositionPage,
  StoreItemsPage,
  StoreRegisterPage,
} from '@/features/store/pages/store-pages'

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
  '/budget/dpp-setup': <BudgetItemsPage kind="DPP" />,
  '/budget/rdpp': <BudgetItemsPage kind="RDPP" />,
  '/budget/adp-setup': <YearlyBudgetPage kind="DPP" />,
  '/budget/rdpp-yearly': <YearlyBudgetPage kind="RDPP" />,
  '/budget/adp-yearly': <YearlyBudgetPage kind="ADP" />,
  '/budget/radp-yearly': <YearlyBudgetPage kind="RADP" />,
  '/budget/rdpp-code-wise': <CodeWiseBudgetPage />,
  '/budget/tranche-allocation': <TrancheAllocationPage />,
  '/budget/expenditure': <ExpenditureEntryPage />,
  '/budget/adb-group': <AdbGroupPage />,
  '/budget/group-mapping': <GroupMappingPage />,
  '/budget/reports/rdpp-variance': <VarianceReportPage label="RDPP" />,
  '/budget/reports/radp-variance': <VarianceReportPage label="RADP" />,
  '/budget/reports/tranche-expenditure': <TrancheExpenditurePage />,
  '/budget/reports/imed-monthly': <ProgressReportPage variant="imed-monthly" />,
  '/budget/reports/imed-quarterly': <ProgressReportPage variant="imed-quarterly" />,
  '/budget/reports/target-achievement': <ProgressReportPage variant="target-achievement" />,
  '/budget/reports/erd-monthly': <ProgressReportPage variant="erd-monthly" />,
  '/budget/reports/quarterly-financial': <ProgressReportPage variant="quarterly-financial" />,
  '/budget/reports/implementation-problems': <ImplementationProblemsPage />,
  '/budget/reports/contract-implementation': <ContractImplementationPage />,
  '/assets/suppliers': <SuppliersPage />,
  '/assets/categories': <AssetCategoriesPage />,
  '/assets/locations': <AssetLocationsPage />,
  '/assets/challans': <DeliveryChallansPage />,
  '/assets/assignments': <AssetAssignmentsPage />,
  '/assets/transfers': <AssetTransfersPage />,
  '/assets/register': <FixedAssetRegisterPage />,
  '/store/categories': <ItemCategoriesPage />,
  '/store/items': <StoreItemsPage />,
  '/store/receives': <ItemReceivesPage />,
  '/store/issues': <ItemIssuesPage />,
  '/store/register': <StoreRegisterPage />,
  '/store/stock': <StockPositionPage />,
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
