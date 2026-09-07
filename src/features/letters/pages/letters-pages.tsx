import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { ColumnDef } from '@tanstack/react-table'
import { ArrowDownLeft, ArrowUpRight, Inbox, Mail, Send } from 'lucide-react'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { RowActions } from '@/components/common/row-actions'
import { PageContainer } from '@/components/common/page-container'
import { PageHeader } from '@/components/common/page-header'
import { DataTable } from '@/components/common/data-table'
import { MasterPage } from '@/components/common/master-page'
import { ReportShell } from '@/components/common/report-shell'
import { StatCard } from '@/components/common/stat-card'
import { SectionCard } from '@/components/common/section-card'
import { StatusBadge } from '@/components/common/status-badge'
import { RecordSheet } from '@/components/common/record-sheet'
import { DetailList } from '@/components/common/detail-list'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FormField, FormGrid } from '@/components/common/form-field'
import { formatDate, formatDateTime, formatNumber } from '@/lib/format'
import { useEntityLookup, useLetterLookup, useLetterStore, useMovementsOf } from '../store'
import type { Letter, LetterDispatch, Memo } from '../types'

const PRIORITY_TONE = { normal: 'neutral', urgent: 'warning', 'most urgent': 'destructive' } as const

/* ------------------------------------ Dashboard ----------------------------------- */

export function LetterDashboardPage() {
  const letters = useLetterStore((s) => s.letters)
  const dispatches = useLetterStore((s) => s.dispatches)
  const entityById = useEntityLookup()

  const stats = useMemo(
    () => ({
      inward: letters.filter((l) => l.direction === 'inward').length,
      outward: letters.filter((l) => l.direction === 'outward').length,
      pending: letters.filter((l) => l.status === 'new' || l.status === 'in review').length,
      dispatched: dispatches.length,
    }),
    [letters, dispatches],
  )

  const recent = letters.slice(0, 8)
  const urgent = letters.filter((l) => l.priority !== 'normal' && l.status !== 'closed').slice(0, 6)

  return (
    <PageContainer>
      <PageHeader
        title="Letter dashboard"
        description="Inward and outward correspondence at a glance"
        actions={
          <Button asChild size="sm">
            <Link to="/letters/new">
              <Mail className="size-4" /> Add letter
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard label="Inward letters" value={formatNumber(stats.inward)} icon={ArrowDownLeft} tone="info" />
        <StatCard label="Outward letters" value={formatNumber(stats.outward)} icon={ArrowUpRight} />
        <StatCard label="Awaiting action" value={formatNumber(stats.pending)} icon={Inbox} tone="warning" />
        <StatCard label="Dispatched" value={formatNumber(stats.dispatched)} icon={Send} tone="success" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SectionCard title="Recent correspondence" contentClassName="divide-y">
          {recent.map((letter) => (
            <div key={letter.id} className="flex items-start justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{letter.subject}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {letter.memoNo} · {entityById[letter.entityId]?.name ?? '—'}
                </p>
              </div>
              <StatusBadge status={letter.status} />
            </div>
          ))}
        </SectionCard>

        <SectionCard title="Urgent and pending" description="Letters marked urgent that are still open" contentClassName="divide-y">
          {urgent.length === 0 ? (
            <p className="py-4 text-sm text-muted-foreground">Nothing urgent is pending.</p>
          ) : (
            urgent.map((letter) => (
              <div key={letter.id} className="flex items-start justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{letter.subject}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(letter.letterDate)} · {letter.assignedTo}
                  </p>
                </div>
                <StatusBadge status={letter.priority} tone={PRIORITY_TONE[letter.priority]} />
              </div>
            ))
          )}
        </SectionCard>
      </div>
    </PageContainer>
  )
}

/* ------------------------------------- All letters -------------------------------- */

export function LettersListPage() {
  const letters = useLetterStore((s) => s.letters)
  const entities = useLetterStore((s) => s.entities)
  const setLetterStatus = useLetterStore((s) => s.setLetterStatus)
  const updateLetter = useLetterStore((s) => s.updateLetter)
  const removeLetter = useLetterStore((s) => s.removeLetter)
  const entityById = useEntityLookup()
  const [direction, setDirection] = useState<'all' | Letter['direction']>('all')
  const [selected, setSelected] = useState<Letter | null>(null)
  const [editing, setEditing] = useState<Letter | null>(null)
  const [deleting, setDeleting] = useState<Letter | null>(null)
  const [editForm, setEditForm] = useState(emptyLetterForm)
  const movements = useMovementsOf(selected?.id)

  const openEdit = (letter: Letter) => {
    setEditing(letter)
    setEditForm({
      memoNo: letter.memoNo,
      direction: letter.direction,
      subject: letter.subject,
      entityId: letter.entityId,
      letterDate: letter.letterDate,
      receivedDate: letter.receivedDate,
      priority: letter.priority,
      assignedTo: letter.assignedTo,
      remarks: letter.remarks,
    })
  }

  const saveEdit = () => {
    if (!editing) return
    if (!editForm.memoNo || !editForm.subject || !editForm.entityId || !editForm.letterDate) {
      toast.error('Memo number, subject, entity and letter date are required.')
      return
    }
    updateLetter(editing.id, {
      memoNo: editForm.memoNo,
      direction: editForm.direction,
      subject: editForm.subject,
      entityId: editForm.entityId,
      letterDate: editForm.letterDate,
      receivedDate: editForm.receivedDate || editForm.letterDate,
      priority: editForm.priority,
      assignedTo: editForm.assignedTo || 'Unassigned',
      remarks: editForm.remarks,
    })
    toast.success(`${editForm.memoNo} updated.`)
    setEditing(null)
  }

  const rows = useMemo(
    () => (direction === 'all' ? letters : letters.filter((l) => l.direction === direction)),
    [letters, direction],
  )

  const columns: ColumnDef<Letter, any>[] = [
    { accessorKey: 'memoNo', header: 'Memo no.', meta: { label: 'Memo no.', className: 'font-mono text-xs' } },
    {
      accessorKey: 'subject',
      header: 'Subject',
      meta: { label: 'Subject' },
      cell: ({ row }) => (
        <div className="min-w-0">
          <p className="max-w-sm truncate font-medium">{row.original.subject}</p>
          <p className="truncate text-xs text-muted-foreground">{entityById[row.original.entityId]?.name ?? '—'}</p>
        </div>
      ),
    },
    {
      accessorKey: 'direction',
      header: 'Direction',
      meta: { align: 'center', label: 'Direction' },
      cell: ({ getValue }) => (
        <Badge variant="outline" className="capitalize">
          {getValue<string>()}
        </Badge>
      ),
    },
    {
      accessorKey: 'letterDate',
      header: 'Letter date',
      meta: { align: 'right', label: 'Letter date' },
      cell: ({ getValue }) => formatDate(getValue<string>()),
    },
    { accessorKey: 'assignedTo', header: 'Assigned to', meta: { label: 'Assigned to', hideOnMobile: true } },
    {
      accessorKey: 'priority',
      header: 'Priority',
      meta: { align: 'center', label: 'Priority' },
      cell: ({ getValue }) => (
        <StatusBadge status={getValue<string>()} tone={PRIORITY_TONE[getValue<Letter['priority']>()]} />
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      meta: { align: 'center', label: 'Status' },
      cell: ({ getValue }) => <StatusBadge status={getValue<string>()} />,
    },
    {
      id: 'actions',
      header: () => <span className="sr-only">Actions</span>,
      enableSorting: false,
      enableHiding: false,
      meta: { align: 'right', label: 'Actions', pinMobile: true, className: 'w-px' },
      cell: ({ row }) => (
        <RowActions onEdit={() => openEdit(row.original)} onDelete={() => setDeleting(row.original)} />
      ),
    },
  ]

  return (
    <PageContainer>
      <PageHeader title="All letters" description="Complete correspondence register with movement history" />

      <DataTable
        columns={columns}
        data={rows}
        searchPlaceholder="Search subject, memo no. or entity…"
        pageSize={12}
        onRowClick={setSelected}
        toolbar={
          <Select value={direction} onValueChange={(v) => setDirection(v as typeof direction)}>
            <SelectTrigger size="sm" className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All letters</SelectItem>
              <SelectItem value="inward">Inward</SelectItem>
              <SelectItem value="outward">Outward</SelectItem>
            </SelectContent>
          </Select>
        }
        emptyTitle="No letters"
      />

      <RecordSheet
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
        title={selected?.memoNo ?? ''}
        description={selected?.subject}
        wide
        footer={
          selected && selected.status !== 'closed' ? (
            <Button
              onClick={() => {
                setLetterStatus(selected.id, 'closed')
                setSelected({ ...selected, status: 'closed' })
                toast.success('Letter marked as closed.')
              }}
            >
              Mark as closed
            </Button>
          ) : undefined
        }
      >
        {selected ? (
          <div className="space-y-5">
            <DetailList
              items={[
                { label: 'Direction', value: <span className="capitalize">{selected.direction}</span> },
                { label: 'Status', value: <StatusBadge status={selected.status} /> },
                { label: 'Entity', value: entityById[selected.entityId]?.name ?? '—', span: true },
                { label: 'Letter date', value: formatDate(selected.letterDate) },
                { label: 'Received date', value: formatDate(selected.receivedDate) },
                { label: 'Priority', value: <StatusBadge status={selected.priority} tone={PRIORITY_TONE[selected.priority]} /> },
                { label: 'Assigned to', value: selected.assignedTo },
                { label: 'Attachments', value: `${selected.attachments} file(s)` },
                { label: 'Remarks', value: selected.remarks, span: true },
              ]}
            />

            <div>
              <p className="mb-2 text-sm font-medium">Movement history</p>
              {movements.length === 0 ? (
                <p className="text-sm text-muted-foreground">No movement recorded for this letter.</p>
              ) : (
                <ol className="space-y-3 border-l pl-4">
                  {movements.map((movement) => (
                    <li key={movement.id} className="relative">
                      <span className="absolute top-1.5 -left-[21px] size-2 rounded-full bg-primary" />
                      <p className="text-sm">
                        <span className="font-medium">{movement.fromUser}</span>
                        <span className="text-muted-foreground"> {movement.action} to </span>
                        <span className="font-medium">{movement.toUser}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">{movement.note}</p>
                      <p className="text-xs text-muted-foreground">{formatDateTime(movement.at)}</p>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>
        ) : null}
      </RecordSheet>

      <RecordSheet
        open={!!editing}
        onOpenChange={(next) => !next && setEditing(null)}
        title={editing ? `Edit ${editing.memoNo}` : ''}
        description="Prototype only — records live in browser memory."
        footer={
          <>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button onClick={saveEdit}>Update letter</Button>
          </>
        }
      >
        <LetterFormFields entities={entities} value={editForm} onChange={setEditForm} />
      </RecordSheet>

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(next) => !next && setDeleting(null)}
        title={`Delete ${deleting?.memoNo ?? 'letter'}?`}
        description="The letter and any dispatch record raised against it are removed from the prototype session."
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          if (deleting) {
            removeLetter(deleting.id)
            toast.success(`${deleting.memoNo} deleted.`)
          }
          setDeleting(null)
        }}
      />
    </PageContainer>
  )
}

/* ------------------------------------- Add letter --------------------------------- */

const emptyLetterForm = {
  memoNo: '',
  direction: 'inward' as Letter['direction'],
  subject: '',
  entityId: '',
  letterDate: '',
  receivedDate: '',
  priority: 'normal' as Letter['priority'],
  assignedTo: '',
  remarks: '',
}

export function AddLetterPage() {
  const entities = useLetterStore((s) => s.entities)
  const addLetter = useLetterStore((s) => s.addLetter)
  const navigate = useNavigate()
  const [form, setForm] = useState(emptyLetterForm)

  const submit = () => {
    if (!form.memoNo || !form.subject || !form.entityId || !form.letterDate) {
      toast.error('Memo number, subject, entity and letter date are required.')
      return
    }
    addLetter({
      memoNo: form.memoNo,
      direction: form.direction,
      subject: form.subject,
      entityId: form.entityId,
      letterDate: form.letterDate,
      receivedDate: form.receivedDate || form.letterDate,
      priority: form.priority,
      status: 'new',
      assignedTo: form.assignedTo || 'Unassigned',
      attachments: 0,
      remarks: form.remarks,
    })
    toast.success(`${form.memoNo} added to the register.`)
    navigate('/letters/list')
  }

  return (
    <PageContainer>
      <PageHeader
        title="Add letter"
        description="Record an inward or outward letter and route it to a dealing officer"
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => setForm(emptyLetterForm)}>
              Reset
            </Button>
            <Button size="sm" onClick={submit}>
              Save letter
            </Button>
          </>
        }
      />

      <SectionCard title="Letter details">
        <LetterFormFields entities={entities} value={form} onChange={setForm} />
      </SectionCard>
    </PageContainer>
  )
}

type LetterFormValue = typeof emptyLetterForm

function LetterFormFields({
  entities,
  value,
  onChange,
}: {
  entities: { id: string; name: string }[]
  value: LetterFormValue
  onChange: (next: LetterFormValue) => void
}) {
  const form = value
  const setForm = onChange
  return (
        <FormGrid>
          <FormField id="l-memo" label="Memo number" required>
            <Input id="l-memo" value={form.memoNo} onChange={(e) => setForm({ ...form, memoNo: e.target.value })} />
          </FormField>
          <FormField label="Direction" required>
            <Select value={form.direction} onValueChange={(v) => setForm({ ...form, direction: v as Letter['direction'] })}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inward">Inward</SelectItem>
                <SelectItem value="outward">Outward</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField id="l-subject" label="Subject" required className="sm:col-span-2">
            <Input id="l-subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
          </FormField>
          <FormField label="Entity" required className="sm:col-span-2">
            <Select value={form.entityId} onValueChange={(v) => setForm({ ...form, entityId: v })}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select ministry, agency or partner" />
              </SelectTrigger>
              <SelectContent>
                {entities.map((entity) => (
                  <SelectItem key={entity.id} value={entity.id}>
                    {entity.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <FormField id="l-date" label="Letter date" required>
            <Input id="l-date" type="date" value={form.letterDate} onChange={(e) => setForm({ ...form, letterDate: e.target.value })} />
          </FormField>
          <FormField id="l-received" label="Received date">
            <Input
              id="l-received"
              type="date"
              value={form.receivedDate}
              onChange={(e) => setForm({ ...form, receivedDate: e.target.value })}
            />
          </FormField>
          <FormField label="Priority">
            <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v as Letter['priority'] })}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="most urgent">Most urgent</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField id="l-assigned" label="Assign to">
            <Input id="l-assigned" value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })} />
          </FormField>
          <FormField id="l-remarks" label="Remarks" className="sm:col-span-2">
            <Textarea id="l-remarks" rows={3} value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} />
          </FormField>
        </FormGrid>
  )
}

/* ------------------------------------ Dispatch ------------------------------------ */

const toDispatch = (v: Record<string, string>) => ({
  letterId: v.letterId,
  dispatchNo: v.dispatchNo,
  dispatchDate: v.dispatchDate,
  mode: v.mode as LetterDispatch['mode'],
  receiverName: v.receiverName || '—',
  trackingNo: v.trackingNo || '—',
})

const toMemo = (v: Record<string, string>) => ({
  memoNo: v.memoNo,
  subject: v.subject,
  body: v.body,
  preparedBy: v.preparedBy,
  date: v.date,
})

export function DispatchPage() {
  const dispatches = useLetterStore((s) => s.dispatches)
  const letters = useLetterStore((s) => s.letters)
  const addDispatch = useLetterStore((s) => s.addDispatch)
  const updateDispatch = useLetterStore((s) => s.updateDispatch)
  const removeDispatch = useLetterStore((s) => s.removeDispatch)
  const letterById = useLetterLookup()

  const dispatchable = useMemo(
    () => letters.filter((l) => l.direction === 'outward' && l.status !== 'dispatched'),
    [letters],
  )

  const columns = useMemo<ColumnDef<LetterDispatch, any>[]>(
    () => [
      { accessorKey: 'dispatchNo', header: 'Dispatch no.', meta: { label: 'Dispatch no.', className: 'font-mono text-xs' } },
      {
        accessorKey: 'dispatchDate',
        header: 'Date',
        meta: { label: 'Date' },
        cell: ({ getValue }) => formatDate(getValue<string>()),
      },
      {
        id: 'letter',
        header: 'Letter',
        meta: { label: 'Letter' },
        accessorFn: (row) => letterById[row.letterId]?.subject ?? '—',
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="max-w-sm truncate font-medium">{letterById[row.original.letterId]?.subject ?? '—'}</p>
            <p className="truncate font-mono text-xs text-muted-foreground">
              {letterById[row.original.letterId]?.memoNo ?? '—'}
            </p>
          </div>
        ),
      },
      { accessorKey: 'mode', header: 'Mode', meta: { label: 'Mode' } },
      { accessorKey: 'receiverName', header: 'Receiver', meta: { label: 'Receiver', hideOnMobile: true } },
      { accessorKey: 'trackingNo', header: 'Tracking', meta: { label: 'Tracking', className: 'font-mono text-xs', hideOnMobile: true } },
      {
        accessorKey: 'status',
        header: 'Status',
        meta: { align: 'center', label: 'Status' },
        cell: ({ getValue }) => <StatusBadge status={getValue<string>()} />,
      },
    ],
    [letterById],
  )

  return (
    <MasterPage
      title="Dispatch letter"
      description="Outward letters handed over for delivery"
      addLabel="Dispatch letter"
      searchPlaceholder="Search dispatch no. or letter…"
      columns={columns}
      data={dispatches}
      pageSize={12}
      stats={
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <StatCard label="Dispatched" value={formatNumber(dispatches.length)} icon={Send} />
          <StatCard label="Awaiting dispatch" value={formatNumber(dispatchable.length)} tone="warning" />
          <StatCard
            label="Delivered"
            value={formatNumber(dispatches.filter((d) => d.status === 'delivered').length)}
            tone="success"
          />
        </div>
      }
      fields={[
        {
          name: 'letterId',
          label: 'Letter',
          type: 'select',
          required: true,
          span: true,
          options: dispatchable.map((l) => ({ value: l.id, label: `${l.memoNo} · ${l.subject}` })),
        },
        { name: 'dispatchNo', label: 'Dispatch number', required: true },
        { name: 'dispatchDate', label: 'Dispatch date', type: 'date', required: true },
        {
          name: 'mode',
          label: 'Mode',
          type: 'select',
          required: true,
          options: ['By hand', 'Courier', 'Email', 'Postal'].map((m) => ({ value: m, label: m })),
        },
        { name: 'receiverName', label: 'Receiver' },
        { name: 'trackingNo', label: 'Tracking number' },
      ]}
      onCreate={(v) => addDispatch({ ...toDispatch(v), status: 'dispatched' })}
      onUpdate={(row, v) => updateDispatch(row.id, toDispatch(v))}
      onDelete={(row) => removeDispatch(row.id)}
      rowLabel={(row) => row.dispatchNo}
    />
  )
}

/* -------------------------------------- Memos ------------------------------------- */

export function MemosPage() {
  const memos = useLetterStore((s) => s.memos)
  const addMemo = useLetterStore((s) => s.addMemo)
  const updateMemo = useLetterStore((s) => s.updateMemo)
  const removeMemo = useLetterStore((s) => s.removeMemo)

  const columns = useMemo<ColumnDef<Memo, any>[]>(
    () => [
      { accessorKey: 'memoNo', header: 'Memo no.', meta: { label: 'Memo no.', className: 'font-mono text-xs' } },
      {
        accessorKey: 'subject',
        header: 'Subject',
        meta: { label: 'Subject' },
        cell: ({ getValue }) => <span className="block max-w-md font-medium">{getValue<string>()}</span>,
      },
      { accessorKey: 'date', header: 'Date', meta: { align: 'right', label: 'Date' }, cell: ({ getValue }) => formatDate(getValue<string>()) },
      { accessorKey: 'preparedBy', header: 'Prepared by', meta: { label: 'Prepared by' } },
      {
        accessorKey: 'approvedBy',
        header: 'Approved by',
        meta: { label: 'Approved by', hideOnMobile: true },
        cell: ({ getValue }) => getValue<string>() ?? <span className="text-muted-foreground">Pending</span>,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        meta: { align: 'center', label: 'Status' },
        cell: ({ getValue }) => <StatusBadge status={getValue<string>()} />,
      },
    ],
    [],
  )

  return (
    <MasterPage
      title="Memo writing"
      description="Office orders, circulars and internal notes"
      addLabel="Write memo"
      searchPlaceholder="Search memo no. or subject…"
      columns={columns}
      data={memos}
      fields={[
        { name: 'memoNo', label: 'Memo number', required: true },
        { name: 'date', label: 'Date', type: 'date', required: true },
        { name: 'subject', label: 'Subject', required: true, span: true },
        { name: 'body', label: 'Body', type: 'textarea', span: true },
        { name: 'preparedBy', label: 'Prepared by', required: true },
      ]}
      onCreate={(v) => addMemo({ ...toMemo(v), approvedBy: null, status: 'draft' })}
      onUpdate={(row, v) => updateMemo(row.id, toMemo(v))}
      onDelete={(row) => removeMemo(row.id)}
      rowLabel={(row) => row.memoNo}
    />
  )
}

/* ------------------------------------ Register ------------------------------------ */

export function LetterRegisterPage() {
  const letters = useLetterStore((s) => s.letters)
  const entityById = useEntityLookup()

  const columns: ColumnDef<Letter, any>[] = [
    {
      id: 'sl',
      header: 'SL',
      meta: { align: 'center', label: 'SL', hideOnMobile: true },
      cell: ({ row }) => <span className="text-muted-foreground tabular-nums">{row.index + 1}</span>,
    },
    { accessorKey: 'memoNo', header: 'Memo no.', meta: { label: 'Memo no.', className: 'font-mono text-xs' } },
    {
      accessorKey: 'letterDate',
      header: 'Date',
      meta: { align: 'right', label: 'Date' },
      cell: ({ getValue }) => formatDate(getValue<string>()),
    },
    {
      id: 'entity',
      header: 'From / To',
      meta: { label: 'From / To' },
      accessorFn: (row) => entityById[row.entityId]?.name ?? '—',
    },
    {
      accessorKey: 'subject',
      header: 'Subject',
      meta: { label: 'Subject' },
      cell: ({ getValue }) => <span className="block max-w-md">{getValue<string>()}</span>,
    },
    { accessorKey: 'direction', header: 'Type', meta: { align: 'center', label: 'Type', className: 'capitalize' } },
    { accessorKey: 'assignedTo', header: 'Dealing officer', meta: { label: 'Dealing officer', hideOnMobile: true } },
    {
      accessorKey: 'status',
      header: 'Status',
      meta: { align: 'center', label: 'Status' },
      cell: ({ getValue }) => <StatusBadge status={getValue<string>()} />,
    },
  ]

  return (
    <ReportShell
      title="Letter Tracking Register"
      description="Chronological register of all inward and outward correspondence"
      notes={`Total entries: ${formatNumber(letters.length)}`}
    >
      <DataTable columns={columns} data={letters} searchPlaceholder="Search register…" pageSize={20} dense emptyTitle="No letters" />
    </ReportShell>
  )
}
