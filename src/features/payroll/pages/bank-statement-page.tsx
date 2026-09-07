import { useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { ReportShell } from '@/components/common/report-shell'
import { DataTable } from '@/components/common/data-table'
import { FormField } from '@/components/common/form-field'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCurrency, formatNumber } from '@/lib/format'
import { useEmployeeLookup } from '@/features/hr/store'
import { usePayrollStore, useRunLines } from '../store'
import type { PayrollLine } from '../types'

export function BankStatementPage() {
  const runs = usePayrollStore((s) => s.runs)
  const [runId, setRunId] = useState(runs[0].id)
  const [bank, setBank] = useState('all')
  const run = runs.find((r) => r.id === runId) ?? runs[0]
  const lines = useRunLines(run.id)
  const employeeById = useEmployeeLookup()

  const banks = useMemo(
    () => Array.from(new Set(lines.map((l) => employeeById[l.employeeId]?.bank).filter(Boolean) as string[])),
    [lines, employeeById],
  )

  const rows = useMemo(
    () => (bank === 'all' ? lines : lines.filter((l) => employeeById[l.employeeId]?.bank === bank)),
    [bank, lines, employeeById],
  )

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
        header: 'Account holder',
        meta: { label: 'Account holder' },
        accessorFn: (row) => employeeById[row.employeeId]?.name ?? '—',
        cell: ({ row }) => <span className="font-medium">{employeeById[row.original.employeeId]?.name ?? '—'}</span>,
      },
      {
        id: 'accountNo',
        header: 'Account number',
        meta: { label: 'Account number', className: 'font-mono text-xs' },
        accessorFn: (row) => employeeById[row.employeeId]?.accountNo ?? '—',
      },
      { id: 'bank', header: 'Bank', meta: { label: 'Bank' }, accessorFn: (row) => employeeById[row.employeeId]?.bank ?? '—' },
      {
        id: 'branch',
        header: 'Branch',
        meta: { label: 'Branch', hideOnMobile: true },
        accessorFn: (row) => employeeById[row.employeeId]?.branch ?? '—',
      },
      {
        accessorKey: 'net',
        header: 'Amount',
        meta: { align: 'right', label: 'Amount' },
        cell: ({ getValue }) => <span className="font-medium">{formatCurrency(getValue<number>())}</span>,
      },
    ],
    [employeeById],
  )

  const total = rows.reduce((s, l) => s + l.net, 0)

  return (
    <ReportShell
      title="Employee Bank Statement"
      description="Account-wise disbursement advice for the selected payroll month"
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
          <FormField label="Bank">
            <Select value={bank} onValueChange={setBank}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All banks</SelectItem>
                {banks.map((b) => (
                  <SelectItem key={b} value={b}>
                    {b}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        </div>
      }
      notes={`Total accounts: ${formatNumber(rows.length)} · Total amount: ${formatCurrency(total)}`}
    >
      <DataTable
        columns={columns}
        data={rows}
        searchPlaceholder="Search account holder…"
        pageSize={15}
        dense
        emptyTitle="No disbursement lines"
        footer={
          <div className="flex justify-between font-medium">
            <span>Total transfer</span>
            <span className="tabular-nums">{formatCurrency(total)}</span>
          </div>
        }
      />
    </ReportShell>
  )
}
