import { useState, type ReactNode } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { PageContainer } from '@/components/common/page-container'
import { PageHeader } from '@/components/common/page-header'
import { DataTable } from '@/components/common/data-table'
import { RecordSheet } from '@/components/common/record-sheet'
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
}

export type MasterPageProps<TData> = {
  title: string
  description?: string
  columns: ColumnDef<TData, any>[]
  data: TData[]
  fields: MasterField[]
  onCreate: (values: Record<string, string>) => void
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
 * Header + table + create-sheet scaffold for reference-data screens.
 * Keeps the ~20 lookup maintenance pages in the ERP consistent and tiny.
 */
export function MasterPage<TData>({
  title,
  description,
  columns,
  data,
  fields,
  onCreate,
  addLabel = 'Add new',
  searchPlaceholder = 'Search…',
  stats,
  toolbar,
  onRowClick,
  pageSize = 10,
  emptyTitle = 'No records',
  children,
}: MasterPageProps<TData>) {
  const initial = Object.fromEntries(fields.map((f) => [f.name, f.defaultValue ?? '']))
  const [open, setOpen] = useState(false)
  const [values, setValues] = useState<Record<string, string>>(initial)

  const submit = () => {
    const missing = fields.filter((f) => f.required && !values[f.name]?.trim())
    if (missing.length) {
      toast.error(`Required: ${missing.map((f) => f.label).join(', ')}`)
      return
    }
    onCreate(values)
    toast.success(`Saved to ${title}.`)
    setOpen(false)
    setValues(initial)
  }

  return (
    <PageContainer>
      <PageHeader
        title={title}
        description={description}
        actions={
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus className="size-4" /> {addLabel}
          </Button>
        }
      />
      {stats}
      {children}
      <DataTable
        columns={columns}
        data={data}
        searchPlaceholder={searchPlaceholder}
        toolbar={toolbar}
        onRowClick={onRowClick}
        pageSize={pageSize}
        emptyTitle={emptyTitle}
      />

      <RecordSheet
        open={open}
        onOpenChange={setOpen}
        title={addLabel}
        description="Prototype only — records live in browser memory."
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submit}>Save</Button>
          </>
        }
      >
        <FormGrid>
          {fields.map((field) => {
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
    </PageContainer>
  )
}
