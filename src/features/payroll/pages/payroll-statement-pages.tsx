import { useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Play } from 'lucide-react'
import { toast } from 'sonner'
import { PageContainer } from '@/components/common/page-container'
import { PageHeader } from '@/components/common/page-header'
import { ReportShell } from '@/components/common/report-shell'
import { DataTable } from '@/components/common/data-table'
import { DetailList } from '@/components/common/detail-list'
import { FormField } from '@/components/common/form-field'
import { SectionCard } from '@/components/common/section-card'
import { StatCard } from '@/components/common/stat-card'
import { StatusBadge } from '@/components/common/status-badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCurrency, formatDate, formatNumber, formatPercent } from '@/lib/format'
import { useDesignationLookup, useEmployeeLookup, useHrStore } from '@/features/hr/store'
import { useProjectStore } from '@/features/projects/store'
import { usePayrollStore, useRunLines } from '../store'
import type { EmployeeContract, PayrollLine } from '../types'

/** Month selector shared by every payroll statement. */
function useRunSelector() {
  const runs = usePayrollStore((s) => s.runs)
  const [runId, setRunId] = useState(runs[0].id)
  const run = runs.find((r) => r.id === runId) ?? runs[0]
  const lines = useRunLines(run.id)
  return { runs, runId, setRunId, run, lines }
}

function RunFilter({ runs, runId, setRunId }: { runs: { id: string; label: string }[]; runId: string; setRunId: (v: string) => void }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <FormField label="Payroll month">
        <Select value={runId} onValueChange={setRunId}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {runs.map((r) => (
              <SelectItem key={r.id} value={r.id}>
                {r.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>
    </div>
  )
}

/* ---------------------------- Additional salary process ---------------------------- */

export function AdditionalSalaryPage() {
  const employees = useHrStore((s) => s.employees)
  const designationById = useDesignationLookup()
  const [type, setType] = useState<'Festival bonus' | 'Increment arrear' | 'Baishakhi allowance'>('Festival bonus')
  const [processed, setProcessed] = useState(false)

  const rows = useMemo(
    () =>
      employees
        .filter((e) => e.status === 'active')
        .map((employee) => {
          const rate = type === 'Festival bonus' ? 1 : type === 'Baishakhi allowance' ? 0.2 : 0.075
          const basic = Math.round(employee.grossSalary * 0.6)
          const amount = Math.round(basic * rate)
          return {
            id: employee.id,
            name: employee.name,
            code: employee.code,
            designation: designationById[employee.designationId]?.title ?? '—',
            basic,
            amount,
            tax: Math.round(amount * 0.05),
            net: amount - Math.round(amount * 0.05),
          }
        }),
    [employees, designationById, type],
  )

  const totals = rows.reduce((acc, r) => ({ amount: acc.amount + r.amount, net: acc.net + r.net }), { amount: 0, net: 0 })

  const columns: ColumnDef<(typeof rows)[number], any>[] = [
    {
      accessorKey: 'name',
      header: 'Employee',
      meta: { label: 'Employee' },
      cell: ({ row }) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{row.original.name}</p>
          <p className="truncate text-xs text-muted-foreground">{row.original.designation}</p>
        </div>
      ),
    },
    { accessorKey: 'code', header: 'Code', meta: { label: 'Code', className: 'font-mono text-xs', hideOnMobile: true } },
    { accessorKey: 'basic', header: 'Basic', meta: { align: 'right', label: 'Basic' }, cell: ({ getValue }) => formatCurrency(getValue<number>()) },
    { accessorKey: 'amount', header: 'Gross additional', meta: { align: 'right', label: 'Gross additional' }, cell: ({ getValue }) => formatCurrency(getValue<number>()) },
    { accessorKey: 'tax', header: 'Tax', meta: { align: 'right', label: 'Tax' }, cell: ({ getValue }) => formatCurrency(getValue<number>()) },
    {
      accessorKey: 'net',
      header: 'Net payable',
      meta: { align: 'right', label: 'Net payable' },
      cell: ({ getValue }) => <span className="font-medium">{formatCurrency(getValue<number>())}</span>,
    },
  ]

  return (
    <PageContainer>
      <PageHeader
        title="Additional salary process"
        description="Festival bonus, Baishakhi allowance and increment arrears computed from basic pay"
        actions={
          <>
            <Select value={type} onValueChange={(v) => { setType(v as typeof type); setProcessed(false) }}>
              <SelectTrigger size="sm" className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Festival bonus">Festival bonus (100% basic)</SelectItem>
                <SelectItem value="Baishakhi allowance">Baishakhi allowance (20% basic)</SelectItem>
                <SelectItem value="Increment arrear">Increment arrear (7.5% basic)</SelectItem>
              </SelectContent>
            </Select>
            <Button
              size="sm"
              disabled={processed}
              onClick={() => {
                setProcessed(true)
                toast.success(`${type} processed for ${rows.length} employees.`)
              }}
            >
              <Play className="size-4" /> {processed ? 'Processed' : 'Process'}
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard label="Eligible employees" value={formatNumber(rows.length)} />
        <StatCard label="Gross additional" value={formatCurrency(totals.amount, { compact: true })} tone="info" />
        <StatCard label="Net payable" value={formatCurrency(totals.net, { compact: true })} tone="success" />
      </div>

      <DataTable
        columns={columns}
        data={rows}
        searchPlaceholder="Search employee…"
        pageSize={15}
        dense
        emptyTitle="No eligible employees"
        footer={
          <div className="flex justify-between font-medium">
            <span>Total net payable</span>
            <span className="tabular-nums">{formatCurrency(totals.net)}</span>
          </div>
        }
      />
    </PageContainer>
  )
}

/* ------------------------------ Monthly salary advice ------------------------------ */

export function SalaryAdvicePage() {
  const { runs, runId, setRunId, run, lines } = useRunSelector()
  const organization = useProjectStore((s) => s.organization)
  const employeeById = useEmployeeLookup()

  const byBank = useMemo(() => {
    const map = new Map<string, { bank: string; count: number; amount: number }>()
    for (const line of lines) {
      const bank = employeeById[line.employeeId]?.bank ?? 'Unassigned'
      const current = map.get(bank) ?? { bank, count: 0, amount: 0 }
      current.count += 1
      current.amount += line.net
      map.set(bank, current)
    }
    return Array.from(map.values())
  }, [lines, employeeById])

  const total = byBank.reduce((s, b) => s + b.amount, 0)

  return (
    <ReportShell
      title="Monthly Salary Advice"
      description="Advice issued to the bank for salary disbursement"
      period={run.label}
      filters={<RunFilter runs={runs} runId={runId} setRunId={setRunId} />}
      notes="Please debit our project account and credit the individual accounts as per the attached schedule."
    >
      <div className="space-y-5 px-2 sm:px-4">
        <p className="text-sm">
          The Manager,
          <br />
          Sonali Bank PLC, Ramna Corporate Branch, Dhaka.
        </p>
        <p className="text-sm">
          <span className="font-medium">Subject:</span> Disbursement of salary for the month of {run.label} for the
          officers and staff of {organization.shortName}.
        </p>
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="text-xs uppercase">Bank</TableHead>
                <TableHead className="text-right text-xs uppercase">Accounts</TableHead>
                <TableHead className="text-right text-xs uppercase">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {byBank.map((row) => (
                <TableRow key={row.bank}>
                  <TableCell className="font-medium">{row.bank}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatNumber(row.count)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatCurrency(row.amount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex justify-between border-t bg-muted/40 px-4 py-2 text-sm font-medium">
            <span>Total advice amount</span>
            <span className="tabular-nums">{formatCurrency(total)}</span>
          </div>
        </div>
        <DetailList
          items={[
            { label: 'Total employees', value: formatNumber(lines.length) },
            { label: 'Advice date', value: formatDate(run.processedOn) },
            { label: 'Prepared by', value: run.processedBy },
            { label: 'Status', value: <StatusBadge status={run.status} /> },
          ]}
        />
      </div>
    </ReportShell>
  )
}

/* --------------------------------- VAT & tax statement ----------------------------- */

export function VatTaxStatementPage() {
  const { runs, runId, setRunId, run, lines } = useRunSelector()
  const employeeById = useEmployeeLookup()
  const payrollEmployees = usePayrollStore((s) => s.payrollEmployees)
  const contractTypeByEmployee = useMemo(
    () => Object.fromEntries(payrollEmployees.map((p) => [p.employeeId, p.contractType])),
    [payrollEmployees],
  )

  const totals = lines.reduce(
    (acc, l) => ({ tax: acc.tax + l.deductions.incomeTax, vat: acc.vat + l.deductions.vat }),
    { tax: 0, vat: 0 },
  )

  const columns: ColumnDef<PayrollLine, any>[] = [
    {
      id: 'employee',
      header: 'Employee',
      meta: { label: 'Employee' },
      accessorFn: (row) => employeeById[row.employeeId]?.name ?? '—',
      cell: ({ row }) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{employeeById[row.original.employeeId]?.name ?? '—'}</p>
          <p className="truncate text-xs text-muted-foreground">{contractTypeByEmployee[row.original.employeeId]}</p>
        </div>
      ),
    },
    {
      id: 'tin',
      header: 'TIN',
      meta: { label: 'TIN', className: 'font-mono text-xs', hideOnMobile: true },
      accessorFn: (row) => employeeById[row.employeeId]?.tin ?? '—',
    },
    { id: 'gross', header: 'Gross', meta: { align: 'right', label: 'Gross' }, accessorFn: (r) => r.structure.gross, cell: ({ getValue }) => formatCurrency(getValue<number>()) },
    { id: 'tax', header: 'Income tax', meta: { align: 'right', label: 'Income tax' }, accessorFn: (r) => r.deductions.incomeTax, cell: ({ getValue }) => formatCurrency(getValue<number>()) },
    { id: 'vat', header: 'VAT', meta: { align: 'right', label: 'VAT' }, accessorFn: (r) => r.deductions.vat, cell: ({ getValue }) => (getValue<number>() ? formatCurrency(getValue<number>()) : '—') },
    {
      id: 'total',
      header: 'Total deducted',
      meta: { align: 'right', label: 'Total deducted' },
      accessorFn: (r) => r.deductions.incomeTax + r.deductions.vat,
      cell: ({ getValue }) => <span className="font-medium">{formatCurrency(getValue<number>())}</span>,
    },
  ]

  return (
    <ReportShell
      title="Statement of VAT & Tax"
      description="Source deductions made from staff and consultant remuneration"
      period={run.label}
      filters={<RunFilter runs={runs} runId={runId} setRunId={setRunId} />}
      notes={`Income tax: ${formatCurrency(totals.tax)} · VAT: ${formatCurrency(totals.vat)}`}
    >
      <DataTable
        columns={columns}
        data={lines}
        searchPlaceholder="Search employee…"
        pageSize={15}
        dense
        emptyTitle="No deductions"
        footer={
          <div className="flex flex-wrap justify-between gap-2 font-medium">
            <span>Total deposited to treasury</span>
            <span className="tabular-nums">{formatCurrency(totals.tax + totals.vat)}</span>
          </div>
        }
      />
    </ReportShell>
  )
}

/* -------------------------------- Statement of employee ---------------------------- */

export function EmployeeStatementPage() {
  const runs = usePayrollStore((s) => s.runs)
  const allLines = usePayrollStore((s) => s.lines)
  const employees = useHrStore((s) => s.employees)
  const employeeById = useEmployeeLookup()
  const designationById = useDesignationLookup()
  const [employeeId, setEmployeeId] = useState(employees[0].id)

  const employee = employeeById[employeeId]
  const rows = useMemo(
    () =>
      runs
        .map((run) => {
          const line = allLines.find((l) => l.runId === run.id && l.employeeId === employeeId)
          return line ? { run: run.label, ...line } : null
        })
        .filter(Boolean) as ({ run: string } & PayrollLine)[],
    [runs, allLines, employeeId],
  )

  const totals = rows.reduce(
    (acc, r) => ({ gross: acc.gross + r.structure.gross, deduction: acc.deduction + r.deductions.total, net: acc.net + r.net }),
    { gross: 0, deduction: 0, net: 0 },
  )

  const columns: ColumnDef<(typeof rows)[number], any>[] = [
    { accessorKey: 'run', header: 'Month', meta: { label: 'Month' }, cell: ({ getValue }) => <span className="font-medium">{getValue<string>()}</span> },
    { id: 'basic', header: 'Basic', meta: { align: 'right', label: 'Basic' }, accessorFn: (r) => r.structure.basic, cell: ({ getValue }) => formatCurrency(getValue<number>()) },
    { id: 'gross', header: 'Gross', meta: { align: 'right', label: 'Gross' }, accessorFn: (r) => r.structure.gross, cell: ({ getValue }) => formatCurrency(getValue<number>()) },
    { id: 'tax', header: 'Income tax', meta: { align: 'right', label: 'Income tax' }, accessorFn: (r) => r.deductions.incomeTax, cell: ({ getValue }) => formatCurrency(getValue<number>()) },
    { id: 'deduction', header: 'Total deduction', meta: { align: 'right', label: 'Deduction' }, accessorFn: (r) => r.deductions.total, cell: ({ getValue }) => formatCurrency(getValue<number>()) },
    { accessorKey: 'net', header: 'Net paid', meta: { align: 'right', label: 'Net paid' }, cell: ({ getValue }) => <span className="font-medium">{formatCurrency(getValue<number>())}</span> },
  ]

  return (
    <ReportShell
      title="Statement of Employee"
      description="Month-by-month remuneration history for one employee"
      period={`${rows.at(-1)?.run ?? ''} – ${rows[0]?.run ?? ''}`}
      filters={
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <FormField label="Employee">
            <Select value={employeeId} onValueChange={setEmployeeId}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                {employees.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.name} ({e.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        </div>
      }
      notes={`Total net paid over the period: ${formatCurrency(totals.net)}`}
    >
      <div className="space-y-4 px-2 sm:px-4">
        <DetailList
          items={[
            { label: 'Employee', value: employee?.name ?? '—' },
            { label: 'Employee code', value: <span className="font-mono">{employee?.code}</span> },
            { label: 'Designation', value: designationById[employee?.designationId ?? '']?.title ?? '—' },
            { label: 'Joining date', value: formatDate(employee?.joiningDate) },
            { label: 'Bank', value: `${employee?.bank ?? '—'} — ${employee?.branch ?? ''}` },
            { label: 'Account no.', value: <span className="font-mono">{employee?.accountNo}</span> },
          ]}
        />
        <DataTable
          columns={columns}
          data={rows}
          searchPlaceholder={null}
          dense
          emptyTitle="No payroll history"
          footer={
            <div className="flex flex-wrap justify-between gap-2 font-medium">
              <span>Total</span>
              <span className="tabular-nums">
                Gross {formatCurrency(totals.gross)} · Deduction {formatCurrency(totals.deduction)} · Net{' '}
                {formatCurrency(totals.net)}
              </span>
            </div>
          }
        />
      </div>
    </ReportShell>
  )
}

/* ------------------------------ Employee tax certificate --------------------------- */

export function EmployeeTaxCertificatePage() {
  const runs = usePayrollStore((s) => s.runs)
  const allLines = usePayrollStore((s) => s.lines)
  const employees = useHrStore((s) => s.employees)
  const employeeById = useEmployeeLookup()
  const designationById = useDesignationLookup()
  const [employeeId, setEmployeeId] = useState(employees[0].id)

  const employee = employeeById[employeeId]
  const lines = useMemo(() => allLines.filter((l) => l.employeeId === employeeId), [allLines, employeeId])

  const totals = lines.reduce(
    (acc, l) => ({ gross: acc.gross + l.structure.gross, tax: acc.tax + l.deductions.incomeTax }),
    { gross: 0, tax: 0 },
  )

  return (
    <ReportShell
      title="Employee Tax Certificate"
      description="Certificate of income tax deducted at source from salary"
      period={`${runs.at(-1)?.label ?? ''} – ${runs[0]?.label ?? ''}`}
      filters={
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <FormField label="Employee">
            <Select value={employeeId} onValueChange={setEmployeeId}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                {employees.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.name} ({e.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        </div>
      }
      notes="Issued under section 108 of the Income Tax Act for submission with the annual return."
    >
      <div className="space-y-5 px-2 sm:px-4">
        <DetailList
          items={[
            { label: 'Name', value: employee?.name ?? '—' },
            { label: 'Designation', value: designationById[employee?.designationId ?? '']?.title ?? '—' },
            { label: 'TIN', value: <span className="font-mono">{employee?.tin}</span> },
            { label: 'NID', value: <span className="font-mono">{employee?.nid}</span> },
          ]}
        />
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="text-xs uppercase">Particulars</TableHead>
                <TableHead className="text-right text-xs uppercase">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Total gross remuneration</TableCell>
                <TableCell className="text-right tabular-nums">{formatCurrency(totals.gross)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Total income tax deducted at source</TableCell>
                <TableCell className="text-right tabular-nums">{formatCurrency(totals.tax)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Effective deduction rate</TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatPercent(totals.gross ? (totals.tax / totals.gross) * 100 : 0)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </ReportShell>
  )
}

/* --------------------------- Expenditure & balance statement ----------------------- */

export function ExpenditureBalancePage() {
  const contracts = usePayrollStore((s) => s.contracts)
  const allLines = usePayrollStore((s) => s.lines)
  const employeeById = useEmployeeLookup()

  const rows = useMemo(
    () =>
      contracts.map((contract) => {
        const paid = allLines.filter((l) => l.employeeId === contract.employeeId).reduce((s, l) => s + l.structure.gross, 0)
        const months = Math.max(
          1,
          Math.round(
            (new Date(contract.endDate).getTime() - new Date(contract.startDate).getTime()) / (1000 * 60 * 60 * 24 * 30),
          ),
        )
        const contractValue = contract.monthlyRemuneration * months
        return {
          ...contract,
          employeeName: employeeById[contract.employeeId]?.name ?? '—',
          contractValue,
          paid,
          balance: contractValue - paid,
        }
      }),
    [contracts, allLines, employeeById],
  )

  const totals = rows.reduce(
    (acc, r) => ({ value: acc.value + r.contractValue, paid: acc.paid + r.paid }),
    { value: 0, paid: 0 },
  )

  const columns: ColumnDef<(typeof rows)[number], any>[] = [
    {
      accessorKey: 'employeeName',
      header: 'Employee',
      meta: { label: 'Employee' },
      cell: ({ row }) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{row.original.employeeName}</p>
          <p className="truncate font-mono text-xs text-muted-foreground">{row.original.contractNo}</p>
        </div>
      ),
    },
    { accessorKey: 'monthlyRemuneration', header: 'Monthly', meta: { align: 'right', label: 'Monthly' }, cell: ({ getValue }) => formatCurrency(getValue<number>()) },
    { accessorKey: 'contractValue', header: 'Contract value', meta: { align: 'right', label: 'Contract value' }, cell: ({ getValue }) => formatCurrency(getValue<number>(), { compact: true }) },
    { accessorKey: 'paid', header: 'Expenditure', meta: { align: 'right', label: 'Expenditure' }, cell: ({ getValue }) => formatCurrency(getValue<number>(), { compact: true }) },
    {
      accessorKey: 'balance',
      header: 'Balance',
      meta: { align: 'right', label: 'Balance' },
      cell: ({ getValue }) => <span className="font-medium">{formatCurrency(getValue<number>(), { compact: true })}</span>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      meta: { align: 'center', label: 'Status' },
      cell: ({ getValue }) => <StatusBadge status={getValue<string>()} />,
    },
  ]

  return (
    <ReportShell
      title="Employee Expenditure & Balance"
      description="Contract value against remuneration already paid"
      notes={`Total contract value: ${formatCurrency(totals.value)} · Paid to date: ${formatCurrency(totals.paid)}`}
    >
      <DataTable
        columns={columns}
        data={rows}
        searchPlaceholder="Search employee or contract…"
        pageSize={15}
        dense
        emptyTitle="No contracts"
      />
    </ReportShell>
  )
}

/* ------------------------------- Incremental details ------------------------------- */

export function IncrementalDetailsPage() {
  const contracts = usePayrollStore((s) => s.contracts)
  const employeeById = useEmployeeLookup()

  const rows = useMemo(
    () =>
      contracts
        .filter((c) => c.incrementPercent > 0)
        .map((contract) => ({
          ...contract,
          employeeName: employeeById[contract.employeeId]?.name ?? '—',
          incrementAmount: Math.round((contract.monthlyRemuneration * contract.incrementPercent) / 100),
          revisedRemuneration: Math.round(
            contract.monthlyRemuneration * (1 + contract.incrementPercent / 100),
          ),
        })),
    [contracts, employeeById],
  )

  const columns: ColumnDef<(typeof rows)[number], any>[] = [
    {
      accessorKey: 'employeeName',
      header: 'Employee',
      meta: { label: 'Employee' },
      cell: ({ row }) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{row.original.employeeName}</p>
          <p className="truncate font-mono text-xs text-muted-foreground">{row.original.contractNo}</p>
        </div>
      ),
    },
    {
      accessorKey: 'renewalCount',
      header: 'Renewals',
      meta: { align: 'right', label: 'Renewals', hideOnMobile: true },
    },
    { accessorKey: 'monthlyRemuneration', header: 'Existing', meta: { align: 'right', label: 'Existing' }, cell: ({ getValue }) => formatCurrency(getValue<number>()) },
    { accessorKey: 'incrementPercent', header: 'Increment %', meta: { align: 'right', label: 'Increment %' }, cell: ({ getValue }) => formatPercent(getValue<number>(), 1) },
    { accessorKey: 'incrementAmount', header: 'Increment amount', meta: { align: 'right', label: 'Increment amount' }, cell: ({ getValue }) => formatCurrency(getValue<number>()) },
    {
      accessorKey: 'revisedRemuneration',
      header: 'Revised',
      meta: { align: 'right', label: 'Revised' },
      cell: ({ getValue }) => <span className="font-medium">{formatCurrency(getValue<number>())}</span>,
    },
    {
      accessorKey: 'endDate',
      header: 'Effective until',
      meta: { align: 'right', label: 'Effective until', hideOnMobile: true },
      cell: ({ getValue }) => formatDate(getValue<string>()),
    },
  ]

  const monthlyImpact = rows.reduce((s, r) => s + r.incrementAmount, 0)

  return (
    <ReportShell
      title="Employee Incremental Details"
      description="Annual increments applied to contract remuneration"
      notes={`Additional monthly payroll impact: ${formatCurrency(monthlyImpact)}`}
    >
      <SectionCard contentClassName="p-0">
        <DataTable
          columns={columns}
          data={rows as (EmployeeContract & Record<string, unknown>)[] as any}
          searchPlaceholder="Search employee…"
          pageSize={15}
          dense
          emptyTitle="No increments recorded"
        />
      </SectionCard>
    </ReportShell>
  )
}
