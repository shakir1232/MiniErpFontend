import { useMemo } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Check } from 'lucide-react'
import { toast } from 'sonner'
import { MasterPage } from '@/components/common/master-page'
import { StatCard } from '@/components/common/stat-card'
import { StatusBadge } from '@/components/common/status-badge'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/format'
import { useEmployeeLookup, useHrStore } from '@/features/hr/store'
import { usePayrollStore } from '../store'
import type { SalaryAdjustment } from '../types'

const TYPES: SalaryAdjustment['type'][] = ['Arrear', 'Deduction', 'Bonus', 'Leave without pay']

const toRecord = (v: Record<string, string>) => ({
  employeeId: v.employeeId,
  month: v.month,
  type: v.type as SalaryAdjustment['type'],
  amount: Number(v.amount) || 0,
  remarks: v.remarks,
})

export function AdjustmentsPage() {
  const adjustments = usePayrollStore((s) => s.adjustments)
  const addAdjustment = usePayrollStore((s) => s.addAdjustment)
  const approveAdjustment = usePayrollStore((s) => s.approveAdjustment)
  const updateAdjustment = usePayrollStore((s) => s.updateAdjustment)
  const removeAdjustment = usePayrollStore((s) => s.removeAdjustment)
  const employees = useHrStore((s) => s.employees)
  const employeeById = useEmployeeLookup()

  const stats = useMemo(() => {
    const pending = adjustments.filter((a) => !a.approved)
    const additions = adjustments.filter((a) => a.type === 'Arrear' || a.type === 'Bonus')
    return {
      pending: pending.length,
      additions: additions.reduce((s, a) => s + a.amount, 0),
      deductions: adjustments.filter((a) => !additions.includes(a)).reduce((s, a) => s + a.amount, 0),
    }
  }, [adjustments])

  const columns = useMemo<ColumnDef<SalaryAdjustment, any>[]>(
    () => [
      {
        id: 'employee',
        header: 'Employee',
        meta: { label: 'Employee' },
        accessorFn: (row) => employeeById[row.employeeId]?.name ?? '—',
        cell: ({ row }) => <span className="font-medium">{employeeById[row.original.employeeId]?.name ?? '—'}</span>,
      },
      { accessorKey: 'month', header: 'Month', meta: { label: 'Month' } },
      {
        accessorKey: 'type',
        header: 'Type',
        meta: { label: 'Type' },
        cell: ({ getValue }) => (
          <StatusBadge
            status={getValue<string>()}
            tone={getValue<string>() === 'Arrear' || getValue<string>() === 'Bonus' ? 'success' : 'warning'}
          />
        ),
      },
      {
        accessorKey: 'amount',
        header: 'Amount',
        meta: { align: 'right', label: 'Amount' },
        cell: ({ getValue }) => formatCurrency(getValue<number>()),
      },
      {
        accessorKey: 'remarks',
        header: 'Remarks',
        meta: { label: 'Remarks', hideOnMobile: true },
        cell: ({ getValue }) => <span className="text-muted-foreground">{getValue<string>()}</span>,
      },
      {
        id: 'approval',
        header: 'Approval',
        meta: { align: 'center', label: 'Approval' },
        cell: ({ row }) =>
          row.original.approved ? (
            <StatusBadge status="approved" />
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation()
                approveAdjustment(row.original.id)
                toast.success('Adjustment approved.')
              }}
            >
              <Check className="size-3.5" /> Approve
            </Button>
          ),
      },
    ],
    [approveAdjustment, employeeById],
  )

  return (
    <MasterPage
      title="Monthly salary adjustment"
      description="Arrears, bonuses and recoveries applied to a specific payroll month"
      addLabel="Add adjustment"
      searchPlaceholder="Search employee or remarks…"
      columns={columns}
      data={adjustments}
      pageSize={12}
      stats={
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <StatCard label="Pending approval" value={String(stats.pending)} tone="warning" />
          <StatCard label="Total additions" value={formatCurrency(stats.additions, { compact: true })} tone="success" />
          <StatCard label="Total recoveries" value={formatCurrency(stats.deductions, { compact: true })} tone="destructive" />
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
        { name: 'month', label: 'Payroll month', placeholder: 'YYYY-MM', required: true, defaultValue: '2026-09' },
        {
          name: 'type',
          label: 'Adjustment type',
          type: 'select',
          required: true,
          options: TYPES.map((t) => ({ value: t, label: t })),
        },
        { name: 'amount', label: 'Amount (BDT)', type: 'number', required: true },
        { name: 'remarks', label: 'Remarks', type: 'textarea', span: true },
      ]}
      onCreate={(v) => addAdjustment({ ...toRecord(v), approved: false })}
      onUpdate={(row, v) => updateAdjustment(row.id, toRecord(v))}
      onDelete={(row) => removeAdjustment(row.id)}
      rowLabel={(row) => `${row.type} adjustment`}
    />
  )
}
