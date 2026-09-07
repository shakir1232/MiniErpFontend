import { useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { ReportShell } from '@/components/common/report-shell'
import { DataTable } from '@/components/common/data-table'
import { FormField } from '@/components/common/form-field'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCurrency, formatNumber } from '@/lib/format'
import { useDesignationLookup, useEmployeeLookup } from '@/features/hr/store'
import { usePayrollStore, useRunLines } from '../store'
import type { PayrollLine } from '../types'

export function RemunerationStatementPage() {
  const runs = usePayrollStore((s) => s.runs)
  const [runId, setRunId] = useState(runs[0].id)
  const run = runs.find((r) => r.id === runId) ?? runs[0]
  const lines = useRunLines(run.id)
  const employeeById = useEmployeeLookup()
  const designationById = useDesignationLookup()

  const columns = useMemo<ColumnDef<PayrollLine, any>[]>(
    () => [
      {
        id: 'sl',
        header: 'SL',
        meta: { align: 'center', label: 'SL', hideOnMobile: true },
        cell: ({ row }) => <span className="text-muted-foreground tabular-nums">{row.index + 1}</span>,
      },
      {
        id: 'employee',
        header: 'Name & designation',
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
      { id: 'basic', header: 'Basic', meta: { align: 'right', label: 'Basic' }, accessorFn: (r) => r.structure.basic, cell: ({ getValue }) => formatCurrency(getValue<number>()) },
      { id: 'house', header: 'House rent', meta: { align: 'right', label: 'House rent', hideOnMobile: true }, accessorFn: (r) => r.structure.houseRent, cell: ({ getValue }) => formatCurrency(getValue<number>()) },
      { id: 'medical', header: 'Medical', meta: { align: 'right', label: 'Medical', hideOnMobile: true }, accessorFn: (r) => r.structure.medical, cell: ({ getValue }) => formatCurrency(getValue<number>()) },
      { id: 'conveyance', header: 'Conveyance', meta: { align: 'right', label: 'Conveyance', hideOnMobile: true }, accessorFn: (r) => r.structure.conveyance, cell: ({ getValue }) => formatCurrency(getValue<number>()) },
      { id: 'gross', header: 'Gross', meta: { align: 'right', label: 'Gross' }, accessorFn: (r) => r.structure.gross, cell: ({ getValue }) => formatCurrency(getValue<number>()) },
      { id: 'deduction', header: 'Deduction', meta: { align: 'right', label: 'Deduction' }, accessorFn: (r) => r.deductions.total, cell: ({ getValue }) => formatCurrency(getValue<number>()) },
      { accessorKey: 'net', header: 'Net payable', meta: { align: 'right', label: 'Net payable' }, cell: ({ getValue }) => <span className="font-medium">{formatCurrency(getValue<number>())}</span> },
    ],
    [designationById, employeeById],
  )

  const totals = lines.reduce(
    (acc, l) => ({
      gross: acc.gross + l.structure.gross,
      deduction: acc.deduction + l.deductions.total,
      net: acc.net + l.net,
    }),
    { gross: 0, deduction: 0, net: 0 },
  )

  return (
    <ReportShell
      title="Statement of Remuneration"
      description="Consolidated monthly remuneration paid to project staff"
      period={run.label}
      filters={
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
      }
      notes={
        <div className="grid gap-1 sm:grid-cols-3">
          <span>Employees: {formatNumber(lines.length)}</span>
          <span>Total gross: {formatCurrency(totals.gross)}</span>
          <span>Total net: {formatCurrency(totals.net)}</span>
        </div>
      }
    >
      <DataTable
        columns={columns}
        data={lines}
        searchPlaceholder="Search employee…"
        pageSize={15}
        dense
        emptyTitle="No remuneration lines"
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
    </ReportShell>
  )
}
