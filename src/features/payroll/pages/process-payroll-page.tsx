import { useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { CheckCircle2, Play, Printer } from 'lucide-react'
import { toast } from 'sonner'
import { PageContainer } from '@/components/common/page-container'
import { PageHeader } from '@/components/common/page-header'
import { SectionCard } from '@/components/common/section-card'
import { DataTable } from '@/components/common/data-table'
import { StatCard } from '@/components/common/stat-card'
import { StatusBadge } from '@/components/common/status-badge'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCurrency, formatDate, formatNumber } from '@/lib/format'
import { useDesignationLookup, useEmployeeLookup } from '@/features/hr/store'
import { usePayrollStore, useRunLines } from '../store'
import type { PayrollLine } from '../types'

export function ProcessPayrollPage() {
  const runs = usePayrollStore((s) => s.runs)
  const setRunStatus = usePayrollStore((s) => s.setRunStatus)
  const [runId, setRunId] = useState(runs[0].id)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const run = runs.find((r) => r.id === runId) ?? runs[0]
  const lines = useRunLines(run.id)
  const employeeById = useEmployeeLookup()
  const designationById = useDesignationLookup()

  const columns = useMemo<ColumnDef<PayrollLine, any>[]>(
    () => [
      {
        id: 'employee',
        header: 'Employee',
        meta: { label: 'Employee' },
        accessorFn: (row) => employeeById[row.employeeId]?.name ?? '—',
        cell: ({ row }) => {
          const employee = employeeById[row.original.employeeId]
          return (
            <div className="min-w-0">
              <p className="truncate font-medium">{employee?.name ?? '—'}</p>
              <p className="truncate text-xs text-muted-foreground">
                {designationById[employee?.designationId ?? '']?.title ?? '—'}
              </p>
            </div>
          )
        },
      },
      {
        id: 'basic',
        header: 'Basic',
        meta: { align: 'right', label: 'Basic', hideOnMobile: true },
        accessorFn: (row) => row.structure.basic,
        cell: ({ getValue }) => formatCurrency(getValue<number>()),
      },
      {
        id: 'gross',
        header: 'Gross',
        meta: { align: 'right', label: 'Gross' },
        accessorFn: (row) => row.structure.gross,
        cell: ({ getValue }) => formatCurrency(getValue<number>()),
      },
      {
        id: 'tax',
        header: 'Income tax',
        meta: { align: 'right', label: 'Income tax' },
        accessorFn: (row) => row.deductions.incomeTax,
        cell: ({ getValue }) => formatCurrency(getValue<number>()),
      },
      {
        id: 'vat',
        header: 'VAT',
        meta: { align: 'right', label: 'VAT', hideOnMobile: true },
        accessorFn: (row) => row.deductions.vat,
        cell: ({ getValue }) => formatCurrency(getValue<number>()),
      },
      {
        id: 'pf',
        header: 'PF',
        meta: { align: 'right', label: 'PF', hideOnMobile: true },
        accessorFn: (row) => row.deductions.providentFund,
        cell: ({ getValue }) => formatCurrency(getValue<number>()),
      },
      {
        id: 'deductions',
        header: 'Total deduction',
        meta: { align: 'right', label: 'Deductions' },
        accessorFn: (row) => row.deductions.total,
        cell: ({ getValue }) => formatCurrency(getValue<number>()),
      },
      {
        accessorKey: 'net',
        header: 'Net payable',
        meta: { align: 'right', label: 'Net payable' },
        cell: ({ getValue }) => <span className="font-medium">{formatCurrency(getValue<number>())}</span>,
      },
    ],
    [designationById, employeeById],
  )

  return (
    <PageContainer>
      <PageHeader
        title="Process payroll salary"
        description="Review computed salary lines before approving a month"
        actions={
          <>
            <Select value={runId} onValueChange={setRunId}>
              <SelectTrigger size="sm" className="w-40">
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
            <Button size="sm" variant="outline" onClick={() => toast.info('Print preview is not wired in the prototype.')}>
              <Printer className="size-4" /> Print
            </Button>
            <Button size="sm" disabled={run.status === 'paid'} onClick={() => setConfirmOpen(true)}>
              {run.status === 'approved' ? <CheckCircle2 className="size-4" /> : <Play className="size-4" />}
              {run.status === 'approved' ? 'Mark as paid' : 'Approve run'}
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard label="Employees" value={formatNumber(run.employeeCount)} />
        <StatCard label="Gross" value={formatCurrency(run.grossTotal, { compact: true })} tone="info" />
        <StatCard label="Deductions" value={formatCurrency(run.deductionTotal, { compact: true })} tone="warning" />
        <StatCard label="Net payable" value={formatCurrency(run.netTotal, { compact: true })} tone="success" />
      </div>

      <SectionCard
        title={`${run.label} run`}
        description={`Processed ${formatDate(run.processedOn)} by ${run.processedBy}`}
        action={<StatusBadge status={run.status} />}
        contentClassName="p-0"
      >
        <DataTable
          columns={columns}
          data={lines}
          searchPlaceholder="Search employee…"
          pageSize={12}
          dense
          emptyTitle="No salary lines"
          footer={
            <div className="flex justify-between font-medium">
              <span>Net payable — {formatNumber(lines.length)} employees</span>
              <span className="tabular-nums">{formatCurrency(lines.reduce((s, l) => s + l.net, 0))}</span>
            </div>
          }
        />
      </SectionCard>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={run.status === 'approved' ? 'Mark run as paid?' : 'Approve payroll run?'}
        description={`${run.label} — ${formatNumber(run.employeeCount)} employees, net ${formatCurrency(run.netTotal)}.`}
        confirmLabel={run.status === 'approved' ? 'Mark as paid' : 'Approve'}
        onConfirm={() => {
          setRunStatus(run.id, run.status === 'approved' ? 'paid' : 'approved')
          toast.success(`${run.label} ${run.status === 'approved' ? 'marked as paid' : 'approved'}.`)
        }}
      />
    </PageContainer>
  )
}
