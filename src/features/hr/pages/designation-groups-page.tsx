import { useMemo } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { MasterPage } from '@/components/common/master-page'
import { useHrStore } from '../store'
import type { DesignationGroup } from '../types'

const toRecord = (v: Record<string, string>): Omit<DesignationGroup, 'id'> => ({
  name: v.name,
  code: v.code,
  order: Number(v.order) || 99,
  description: v.description,
})

export function DesignationGroupsPage() {
  const groups = useHrStore((s) => s.designationGroups)
  const designations = useHrStore((s) => s.designations)
  const addGroup = useHrStore((s) => s.addDesignationGroup)
  const updateGroup = useHrStore((s) => s.updateDesignationGroup)
  const removeGroup = useHrStore((s) => s.removeDesignationGroup)

  const columns = useMemo<ColumnDef<DesignationGroup, any>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Group',
        meta: { label: 'Group' },
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="truncate font-medium">{row.original.name}</p>
            <p className="font-mono text-xs text-muted-foreground">{row.original.code}</p>
          </div>
        ),
      },
      {
        accessorKey: 'description',
        header: 'Description',
        meta: { label: 'Description' },
        cell: ({ getValue }) => <span className="line-clamp-2 text-muted-foreground">{getValue<string>()}</span>,
      },
      {
        id: 'designations',
        header: 'Designations',
        meta: { align: 'right', label: 'Designations' },
        accessorFn: (row) => designations.filter((d) => d.groupId === row.id).length,
      },
      { accessorKey: 'order', header: 'Sort order', meta: { align: 'right', label: 'Sort order' } },
    ],
    [designations],
  )

  return (
    <MasterPage
      title="Designation groups"
      description="Groupings used to sort designations on payroll and statement reports"
      addLabel="Add group"
      searchPlaceholder="Search groups…"
      columns={columns}
      data={groups}
      fields={[
        { name: 'name', label: 'Group name', required: true, span: true },
        { name: 'code', label: 'Short code', required: true },
        { name: 'order', label: 'Sort order', type: 'number' },
        { name: 'description', label: 'Description', type: 'textarea', span: true },
      ]}
      onCreate={(v) => addGroup(toRecord(v))}
      onUpdate={(row, v) => updateGroup(row.id, toRecord(v))}
      onDelete={(row) => removeGroup(row.id)}
    />
  )
}
