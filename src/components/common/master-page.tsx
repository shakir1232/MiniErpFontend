import { useMemo, useState, type ReactNode } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { PageContainer } from '@/components/common/page-container'
import { PageHeader } from '@/components/common/page-header'
import { DataTable } from '@/components/common/data-table'
import { RecordSheet } from '@/components/common/record-sheet'
import { RowActions } from '@/components/common/row-actions'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { FormField, FormGrid } from '@/components/common/form-field'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export type MasterField = {
  name: string
  label: string
  type?: 'text' | 'number' | 'date' | 'textarea' | 'select'
  options?: { value: string; label: string }[]
  required?: boolean
  span?: boolean
  hint?: string
  placeholder?: string
  defaultValue?: string
  /** Hide on the edit form (e.g. immutable keys). */
  createOnly?: boolean
}

export type MasterPageProps<TData> = {
  title: string
  description?: string
  columns: ColumnDef<TData, any>[]
  data: TData[]
  fields: MasterField[]
  onCreate: (values: Record<string, string>) => void
  /** Supply to enable the row edit action. */
  onUpdate?: (row: TData, values: Record<string, string>) => void
  /** Supply to enable the row delete action. */
  onDelete?: (row: TData) => void
  /** Label shown in the delete confirmation; defaults to the record's `name` or id. */
  rowLabel?: (row: TData) => string
  /**
   * Map a record onto form values when editing.
   * Defaults to reading each field name straight off the record.
   */
  toFormValues?: (row: TData) => Record<string, string>
  addLabel?: string
  searchPlaceholder?: string
  /** Rendered above the table — usually a row of StatCards. */
  stats?: ReactNode
  toolbar?: ReactNode
  onRowClick?: (row: TData) => void
  pageSize?: number
  emptyTitle?: string
  children?: ReactNode
}

/**
 * Header + table + create/edit sheet + delete confirmation for reference-data
 * screens. Keeps the ~40 maintenance pages in the ERP consistent and tiny.
 */
export function MasterPage<TData>({
  title,
  description,
  columns,
  data,
  fields,
  onCreate,
  onUpdate,
  onDelete,
  rowLabel,
  toFormValues,
  addLabel = 'Add new',
  searchPlaceholder = 'Search…',
  stats,
  toolbar,
  onRowClick,
  pageSize = 10,
  emptyTitle = 'No records',
  children,
}: MasterPageProps<TData>) {
  const initial = useMemo(
    () => Object.fromEntries(fields.map((f) => [f.name, f.defaultValue ?? ''])),
    [fields],
  )
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<TData | null>(null)
  const [deleting, setDeleting] = useState<TData | null>(null)
  const [values, setValues] = useState<Record<string, string>>(initial)

  const describe = (row: TData) => {
    if (rowLabel) return rowLabel(row)
    const record = row as Record<string, unknown>
    return String(record.name ?? record.title ?? record.code ?? record.id ?? 'this record')
  }

  const openCreate = () => {
    setEditing(null)
    setValues(initial)
    setOpen(true)
  }

  const openEdit = (row: TData) => {
    const record = row as Record<string, unknown>
    const next =
      toFormValues?.(row) ??
      Object.fromEntries(
        fields.map((field) => {
          const value = record[field.name]
          return [field.name, value === null || value === undefined ? '' : String(value)]
        }),
      )
    setEditing(row)
    setValues(next)
    setOpen(true)
  }

  const submit = () => {
    const applicable = fields.filter((f) => !(editing && f.createOnly))
    const missing = applicable.filter((f) => f.required && !values[f.name]?.trim())
    if (missing.length) {
      toast.error(`Required: ${missing.map((f) => f.label).join(', ')}`)
      return
    }
    if (editing && onUpdate) {
      onUpdate(editing, values)
      toast.success(`${describe(editing)} updated.`)
    } else {
      onCreate(values)
      toast.success(`Saved to ${title}.`)
    }
    setOpen(false)
    setEditing(null)
    setValues(initial)
  }

  const tableColumns = useMemo<ColumnDef<TData, any>[]>(() => {
    if (!onUpdate && !onDelete) return columns
    return [
      ...columns,
      {
        id: 'actions',
        // Visually hidden header: the icons are self-describing and the column
        // should not claim horizontal space away from the data.
        header: () => <span className="sr-only">Actions</span>,
        enableSorting: false,
        enableHiding: false,
        meta: { align: 'right', label: 'Actions', pinMobile: true, className: 'w-px' },
        cell: ({ row }) => (
          <RowActions
            onEdit={onUpdate ? () => openEdit(row.original) : undefined}
            onDelete={onDelete ? () => setDeleting(row.original) : undefined}
          />
        ),
      },
    ]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columns, onUpdate, onDelete, fields, toFormValues])

  const visibleFields = fields.filter((f) => !(editing && f.createOnly))

  return (
    <PageContainer>
      <PageHeader
        title={title}
        description={description}
        actions={
          <Button size="sm" onClick={openCreate}>
            <Plus className="size-4" /> {addLabel}
          </Button>
        }
      />
      {stats}
      {children}
      <DataTable
        columns={tableColumns}
        data={data}
        searchPlaceholder={searchPlaceholder}
        toolbar={toolbar}
        onRowClick={onRowClick}
        pageSize={pageSize}
        emptyTitle={emptyTitle}
      />

      <RecordSheet
        open={open}
        onOpenChange={(next) => {
          setOpen(next)
          if (!next) setEditing(null)
        }}
        title={editing ? `Edit ${describe(editing)}` : addLabel}
        description="Prototype only — records live in browser memory."
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submit}>{editing ? 'Update' : 'Save'}</Button>
          </>
        }
      >
        <FormGrid>
          {visibleFields.map((field) => {
            const id = `mf-${field.name}`
            const set = (v: string) => setValues((prev) => ({ ...prev, [field.name]: v }))
            return (
              <FormField
                key={field.name}
                id={id}
                label={field.label}
                required={field.required}
                hint={field.hint}
                className={field.span ? 'sm:col-span-2' : undefined}
              >
                {field.type === 'textarea' ? (
                  <Textarea id={id} rows={3} value={values[field.name] ?? ''} onChange={(e) => set(e.target.value)} />
                ) : field.type === 'select' ? (
                  <Select value={values[field.name] ?? ''} onValueChange={set}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={field.placeholder ?? 'Select…'} />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options?.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id={id}
                    type={field.type === 'date' ? 'date' : 'text'}
                    inputMode={field.type === 'number' ? 'numeric' : undefined}
                    placeholder={field.placeholder}
                    value={values[field.name] ?? ''}
                    onChange={(e) => set(e.target.value)}
                  />
                )}
              </FormField>
            )
          })}
        </FormGrid>
      </RecordSheet>

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(next) => !next && setDeleting(null)}
        title={`Delete ${deleting ? describe(deleting) : 'record'}?`}
        description="This removes the record from the prototype session. Reload the page to restore the seeded data."
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          if (deleting && onDelete) {
            onDelete(deleting)
            toast.success(`${describe(deleting)} deleted.`)
          }
          setDeleting(null)
        }}
      />
    </PageContainer>
  )
}
