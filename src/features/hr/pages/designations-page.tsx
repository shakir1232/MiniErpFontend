import { useMemo } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { MasterPage } from '@/components/common/master-page'
import { formatCurrency, formatNumber } from '@/lib/format'
import { useDesignationGroupLookup, useHrStore } from '../store'
import type { Designation } from '../types'

export function DesignationsPage() {
  const designations = useHrStore((s) => s.designations)
  const groups = useHrStore((s) => s.designationGroups)
  const addDesignation = useHrStore((s) => s.addDesignation)
  const groupById = useDesignationGroupLookup()

  const columns = useMemo<ColumnDef<Designation, any>[]>(
    () => [
      {
        accessorKey: 'title',
        header: 'Designation',
        meta: { label: 'Designation' },
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="truncate font-medium">{row.original.title}</p>
            <p className="font-mono text-xs text-muted-foreground">{row.original.code}</p>
          </div>
        ),
      },
      {
        id: 'group',
        header: 'Designation group',
        meta: { label: 'Group' },
        accessorFn: (row) => groupById[row.groupId]?.name ?? '—',
      },
      { accessorKey: 'grade', header: 'Grade', meta: { label: 'Grade' } },
      {
        id: 'band',
        header: 'Salary band',
        meta: { align: 'right', label: 'Salary band' },
        accessorFn: (row) => `${formatCurrency(row.minSalary)} – ${formatCurrency(row.maxSalary)}`,
      },
      {
        accessorKey: 'headcount',
        header: 'Positions',
        meta: { align: 'right', label: 'Positions' },
        cell: ({ getValue }) => formatNumber(getValue<number>()),
      },
    ],
    [groupById],
  )

  return (
    <MasterPage
      title="Designations"
      description="Approved positions with grade and remuneration band"
      addLabel="Add designation"
      searchPlaceholder="Search designation, code or grade…"
      columns={columns}
      data={designations}
      pageSize={12}
      fields={[
        { name: 'title', label: 'Designation title', required: true, span: true },
        { name: 'code', label: 'Short code', required: true },
        {
          name: 'groupId',
          label: 'Designation group',
          type: 'select',
          required: true,
          options: groups.map((g) => ({ value: g.id, label: g.name })),
        },
        { name: 'grade', label: 'Grade', placeholder: 'e.g. Grade 9' },
        { name: 'headcount', label: 'Sanctioned positions', type: 'number' },
        { name: 'minSalary', label: 'Minimum salary (BDT)', type: 'number' },
        { name: 'maxSalary', label: 'Maximum salary (BDT)', type: 'number' },
      ]}
      onCreate={(v) =>
        addDesignation({
          title: v.title,
          code: v.code,
          groupId: v.groupId,
          grade: v.grade || '—',
          minSalary: Number(v.minSalary) || 0,
          maxSalary: Number(v.maxSalary) || 0,
          headcount: Number(v.headcount) || 0,
        })
      }
    />
  )
}
