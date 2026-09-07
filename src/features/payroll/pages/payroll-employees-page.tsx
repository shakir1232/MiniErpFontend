import { useMemo } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { PageContainer } from '@/components/common/page-container'
import { PageHeader } from '@/components/common/page-header'
import { DataTable } from '@/components/common/data-table'
import { StatCard } from '@/components/common/stat-card'
import { StatusBadge } from '@/components/common/status-badge'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatNumber } from '@/lib/format'
import { useDesignationLookup, useEmployeeLookup } from '@/features/hr/store'
import { usePayrollStore } from '../store'
import type { PayrollEmployee } from '../types'

export function PayrollEmployeesPage() {
  const payrollEmployees = usePayrollStore((s) => s.payrollEmployees)
  const employeeById = useEmployeeLookup()
  const designationById = useDesignationLookup()

  const totals = useMemo(() => {
    const active = payrollEmployees.filter((p) => p.status === 'active')
    return {
      active: active.length,
      gross: active.reduce((s, p) => s + p.structure.gross, 0),
      consultants: active.filter((p) => p.contractType === 'Individual Consultant').length,
    }
  }, [payrollEmployees])

  const columns: ColumnDef<PayrollEmployee, any>[] = [
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
      accessorKey: 'contractType',
      header: 'Contract type',
      meta: { label: 'Contract type' },
      cell: ({ getValue }) => <Badge variant="secondary">{getValue<string>()}</Badge>,
    },
    {
      id: 'basic',
      header: 'Basic',
      meta: { align: 'right', label: 'Basic' },
      accessorFn: (row) => row.structure.basic,
      cell: ({ getValue }) => formatCurrency(getValue<number>()),
    },
    {
      id: 'houseRent',
      header: 'House rent',
      meta: { align: 'right', label: 'House rent', hideOnMobile: true },
      accessorFn: (row) => row.structure.houseRent,
      cell: ({ getValue }) => formatCurrency(getValue<number>()),
    },
    {
      id: 'allowances',
      header: 'Medical + conveyance',
      meta: { align: 'right', label: 'Allowances', hideOnMobile: true },
      accessorFn: (row) => row.structure.medical + row.structure.conveyance,
      cell: ({ getValue }) => formatCurrency(getValue<number>()),
    },
    {
      id: 'gross',
      header: 'Gross',
      meta: { align: 'right', label: 'Gross' },
      accessorFn: (row) => row.structure.gross,
      cell: ({ getValue }) => <span className="font-medium">{formatCurrency(getValue<number>())}</span>,
    },
    {
      accessorKey: 'taxRate',
      header: 'Tax %',
      meta: { align: 'right', label: 'Tax %' },
      cell: ({ getValue }) => `${getValue<number>()}%`,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      meta: { align: 'center', label: 'Status' },
      cell: ({ getValue }) => <StatusBadge status={getValue<string>()} />,
    },
  ]

  return (
    <PageContainer>
      <PageHeader title="Employee payroll" description="Salary structure applied when a month is processed" />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard label="On payroll" value={formatNumber(totals.active)} />
        <StatCard label="Monthly gross" value={formatCurrency(totals.gross, { compact: true })} tone="info" />
        <StatCard label="Individual consultants" value={formatNumber(totals.consultants)} hint="VAT deducted at 15%" />
      </div>

      <DataTable
        columns={columns}
        data={payrollEmployees}
        searchPlaceholder="Search employee…"
        pageSize={12}
        emptyTitle="No payroll records"
      />
    </PageContainer>
  )
}
