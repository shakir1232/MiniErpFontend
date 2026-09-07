import { useMemo } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { MasterPage } from '@/components/common/master-page'
import { StatCard } from '@/components/common/stat-card'
import { StatusBadge } from '@/components/common/status-badge'
import { formatCurrency, formatDate, formatPercent } from '@/lib/format'
import { useEmployeeLookup, useHrStore } from '@/features/hr/store'
import { usePayrollStore } from '../store'
import type { EmployeeContract } from '../types'

const toRecord = (v: Record<string, string>) => ({
  employeeId: v.employeeId,
  contractNo: v.contractNo,
  startDate: v.startDate,
  endDate: v.endDate,
  monthlyRemuneration: Number(v.monthlyRemuneration) || 0,
  incrementPercent: Number(v.incrementPercent) || 0,
})

export function ContractsPage() {
  const contracts = usePayrollStore((s) => s.contracts)
  const addContract = usePayrollStore((s) => s.addContract)
  const updateContract = usePayrollStore((s) => s.updateContract)
  const removeContract = usePayrollStore((s) => s.removeContract)
  const employees = useHrStore((s) => s.employees)
  const employeeById = useEmployeeLookup()

  const stats = useMemo(() => {
    const active = contracts.filter((c) => c.status === 'active')
    const soon = active.filter((c) => new Date(c.endDate) < new Date('2026-12-31'))
    return { active: active.length, soon: soon.length, expired: contracts.filter((c) => c.status === 'expired').length }
  }, [contracts])

  const columns = useMemo<ColumnDef<EmployeeContract, any>[]>(
    () => [
      {
        id: 'employee',
        header: 'Employee',
        meta: { label: 'Employee' },
        accessorFn: (row) => employeeById[row.employeeId]?.name ?? '—',
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="truncate font-medium">{employeeById[row.original.employeeId]?.name ?? '—'}</p>
            <p className="truncate font-mono text-xs text-muted-foreground">{row.original.contractNo}</p>
          </div>
        ),
      },
      {
        accessorKey: 'startDate',
        header: 'From',
        meta: { align: 'right', label: 'From' },
        cell: ({ getValue }) => formatDate(getValue<string>()),
      },
      {
        accessorKey: 'endDate',
        header: 'To',
        meta: { align: 'right', label: 'To' },
        cell: ({ getValue }) => formatDate(getValue<string>()),
      },
      {
        accessorKey: 'monthlyRemuneration',
        header: 'Monthly remuneration',
        meta: { align: 'right', label: 'Remuneration' },
        cell: ({ getValue }) => formatCurrency(getValue<number>()),
      },
      {
        accessorKey: 'incrementPercent',
        header: 'Increment',
        meta: { align: 'right', label: 'Increment', hideOnMobile: true },
        cell: ({ getValue }) => formatPercent(getValue<number>(), 1),
      },
      {
        accessorKey: 'renewalCount',
        header: 'Renewals',
        meta: { align: 'right', label: 'Renewals', hideOnMobile: true },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        meta: { align: 'center', label: 'Status' },
        cell: ({ getValue }) => <StatusBadge status={getValue<string>()} />,
      },
    ],
    [employeeById],
  )

  return (
    <MasterPage
      title="Employee contracts"
      description="Fixed-term appointments and their renewal history"
      addLabel="Add contract"
      searchPlaceholder="Search employee or contract number…"
      columns={columns}
      data={contracts}
      pageSize={12}
      stats={
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <StatCard label="Active contracts" value={String(stats.active)} tone="success" />
          <StatCard label="Ending this year" value={String(stats.soon)} tone="warning" />
          <StatCard label="Expired" value={String(stats.expired)} tone="destructive" />
        </div>
      }
      fields={[
        {
          name: 'employeeId',
          label: 'Employee',
          type: 'select',
          required: true,
          span: true,
          options: employees.map((e) => ({ value: e.id, label: `${e.name} (${e.code})` })),
        },
        { name: 'contractNo', label: 'Contract number', required: true, span: true },
        { name: 'startDate', label: 'Start date', type: 'date', required: true },
        { name: 'endDate', label: 'End date', type: 'date', required: true },
        { name: 'monthlyRemuneration', label: 'Monthly remuneration (BDT)', type: 'number', required: true },
        { name: 'incrementPercent', label: 'Increment %', type: 'number' },
      ]}
      onCreate={(v) => addContract({ ...toRecord(v), renewalCount: 0, status: 'draft' })}
      onUpdate={(row, v) => updateContract(row.id, toRecord(v))}
      onDelete={(row) => removeContract(row.id)}
      rowLabel={(row) => row.contractNo}
    />
  )
}
