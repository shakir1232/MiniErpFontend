import { useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Check, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { PageContainer } from '@/components/common/page-container'
import { PageHeader } from '@/components/common/page-header'
import { DataTable } from '@/components/common/data-table'
import { StatCard } from '@/components/common/stat-card'
import { StatusBadge } from '@/components/common/status-badge'
import { RecordSheet } from '@/components/common/record-sheet'
import { DetailList } from '@/components/common/detail-list'
import { FormField, FormGrid } from '@/components/common/form-field'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { uid } from '@/lib/id'
import { formatCurrency, formatDate } from '@/lib/format'
import { useAccountingStore, useLedgerLookup, useVouchersOfType } from '../store'
import type { Voucher, VoucherLine, VoucherType } from '../types'

const TITLES: Record<VoucherType, { title: string; description: string; prefix: string }> = {
  debit: {
    title: 'Debit voucher',
    description: 'Payments made from project bank accounts and cash',
    prefix: 'DV',
  },
  credit: {
    title: 'Credit voucher',
    description: 'Fund received from the treasury, development partners and other income',
    prefix: 'CV',
  },
  journal: {
    title: 'Journal voucher',
    description: 'Adjustments, advance settlements and non-cash entries',
    prefix: 'JV',
  },
}

type DraftLine = { key: string; ledgerId: string; description: string; debit: string; credit: string }

const blankLine = (): DraftLine => ({ key: uid('line'), ledgerId: '', description: '', debit: '', credit: '' })

export function VouchersPage({ type }: { type: VoucherType }) {
  const meta = TITLES[type]
  const rows = useVouchersOfType(type)
  const ledgers = useAccountingStore((s) => s.ledgers)
  const addVoucher = useAccountingStore((s) => s.addVoucher)
  const setVoucherStatus = useAccountingStore((s) => s.setVoucherStatus)
  const ledgerById = useLedgerLookup()

  const [selected, setSelected] = useState<Voucher | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [head, setHead] = useState({ date: '2026-09-07', payee: '', narration: '', fundSource: 'ADB Loan 3140-BAN', chequeNo: '' })
  const [lines, setLines] = useState<DraftLine[]>([blankLine(), blankLine()])

  const totals = useMemo(
    () => ({
      count: rows.length,
      amount: rows.reduce((s, v) => s + v.amount, 0),
      pending: rows.filter((v) => v.status !== 'approved').length,
    }),
    [rows],
  )

  const draftTotals = lines.reduce(
    (acc, l) => ({ debit: acc.debit + (Number(l.debit) || 0), credit: acc.credit + (Number(l.credit) || 0) }),
    { debit: 0, credit: 0 },
  )
  const balanced = draftTotals.debit === draftTotals.credit && draftTotals.debit > 0

  const columns: ColumnDef<Voucher, any>[] = [
    {
      accessorKey: 'voucherNo',
      header: 'Voucher no.',
      meta: { label: 'Voucher no.' },
      cell: ({ getValue }) => <span className="font-mono text-sm font-medium">{getValue<string>()}</span>,
    },
    {
      accessorKey: 'date',
      header: 'Date',
      meta: { label: 'Date' },
      cell: ({ getValue }) => formatDate(getValue<string>()),
    },
    {
      accessorKey: 'payee',
      header: type === 'credit' ? 'Received from' : 'Payee',
      meta: { label: type === 'credit' ? 'Received from' : 'Payee' },
    },
    {
      accessorKey: 'narration',
      header: 'Narration',
      meta: { label: 'Narration', hideOnMobile: true },
      cell: ({ getValue }) => <span className="line-clamp-2 text-muted-foreground">{getValue<string>()}</span>,
    },
    { accessorKey: 'fundSource', header: 'Fund source', meta: { label: 'Fund source', hideOnMobile: true } },
    {
      accessorKey: 'amount',
      header: 'Amount',
      meta: { align: 'right', label: 'Amount' },
      cell: ({ getValue }) => <span className="font-medium">{formatCurrency(getValue<number>())}</span>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      meta: { align: 'center', label: 'Status' },
      cell: ({ getValue }) => <StatusBadge status={getValue<string>()} />,
    },
  ]

  const submit = () => {
    const filled = lines.filter((l) => l.ledgerId && (Number(l.debit) || Number(l.credit)))
    if (!head.payee || filled.length < 2) {
      toast.error('Enter a party and at least two account lines.')
      return
    }
    if (!balanced) {
      toast.error('Debit and credit totals must match.')
      return
    }
    const id = uid('vch')
    const voucherLines: VoucherLine[] = filled.map((l) => ({
      id: uid('vl'),
      ledgerId: l.ledgerId,
      description: l.description,
      debit: Number(l.debit) || 0,
      credit: Number(l.credit) || 0,
    }))
    addVoucher({
      voucherNo: `${meta.prefix}-2609-${String(900 + rows.length)}`,
      type,
      date: head.date,
      narration: head.narration,
      payee: head.payee,
      fundSource: head.fundSource,
      chequeNo: head.chequeNo || null,
      amount: draftTotals.debit,
      status: 'draft',
      preparedBy: 'Farhana Akter',
      approvedBy: null,
      lines: voucherLines,
    })
    toast.success(`${meta.title} saved as draft.`)
    setCreateOpen(false)
    setLines([blankLine(), blankLine()])
    setHead({ ...head, payee: '', narration: '', chequeNo: '' })
    void id
  }

  const updateLine = (key: string, patch: Partial<DraftLine>) =>
    setLines((prev) => prev.map((l) => (l.key === key ? { ...l, ...patch } : l)))

  return (
    <PageContainer>
      <PageHeader
        title={meta.title}
        description={meta.description}
        actions={
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" /> New {type} voucher
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard label="Vouchers" value={String(totals.count)} />
        <StatCard label="Total value" value={formatCurrency(totals.amount, { compact: true })} tone="info" />
        <StatCard label="Awaiting approval" value={String(totals.pending)} tone="warning" />
      </div>

      <DataTable
        columns={columns}
        data={rows}
        searchPlaceholder="Search voucher no., payee or narration…"
        pageSize={12}
        onRowClick={setSelected}
        emptyTitle="No vouchers"
      />

      {/* Voucher detail */}
      <RecordSheet
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
        title={selected?.voucherNo ?? ''}
        description={selected?.narration}
        wide
        footer={
          selected && selected.status !== 'approved' ? (
            <Button
              onClick={() => {
                setVoucherStatus(selected.id, 'approved')
                setSelected({ ...selected, status: 'approved', approvedBy: 'Md. Shafiqul Islam' })
                toast.success(`${selected.voucherNo} approved.`)
              }}
            >
              <Check className="size-4" /> Approve voucher
            </Button>
          ) : undefined
        }
      >
        {selected ? (
          <div className="space-y-5">
            <DetailList
              items={[
                { label: 'Voucher date', value: formatDate(selected.date) },
                { label: 'Status', value: <StatusBadge status={selected.status} /> },
                { label: type === 'credit' ? 'Received from' : 'Payee', value: selected.payee },
                { label: 'Fund source', value: selected.fundSource },
                { label: 'Cheque no.', value: selected.chequeNo ?? '—' },
                { label: 'Amount', value: formatCurrency(selected.amount) },
                { label: 'Prepared by', value: selected.preparedBy },
                { label: 'Approved by', value: selected.approvedBy ?? 'Pending' },
              ]}
            />
            <div className="overflow-hidden rounded-lg border">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="text-xs uppercase">Account</TableHead>
                      <TableHead className="text-xs uppercase">Description</TableHead>
                      <TableHead className="text-right text-xs uppercase">Debit</TableHead>
                      <TableHead className="text-right text-xs uppercase">Credit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selected.lines.map((line) => (
                      <TableRow key={line.id}>
                        <TableCell>
                          <span className="font-mono text-xs text-muted-foreground">
                            {ledgerById[line.ledgerId]?.code}
                          </span>{' '}
                          {ledgerById[line.ledgerId]?.name ?? '—'}
                        </TableCell>
                        <TableCell className="text-muted-foreground">{line.description}</TableCell>
                        <TableCell className="text-right tabular-nums">
                          {line.debit ? formatCurrency(line.debit) : '—'}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {line.credit ? formatCurrency(line.credit) : '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="flex justify-between border-t bg-muted/40 px-4 py-2 text-sm font-medium">
                <span>Total</span>
                <span className="tabular-nums">
                  {formatCurrency(selected.lines.reduce((s, l) => s + l.debit, 0))} /{' '}
                  {formatCurrency(selected.lines.reduce((s, l) => s + l.credit, 0))}
                </span>
              </div>
            </div>
          </div>
        ) : null}
      </RecordSheet>

      {/* Voucher entry */}
      <RecordSheet
        open={createOpen}
        onOpenChange={setCreateOpen}
        title={`New ${meta.title.toLowerCase()}`}
        description="Debit and credit totals must balance before saving."
        wide
        footer={
          <>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submit} disabled={!balanced}>
              Save voucher
            </Button>
          </>
        }
      >
        <div className="space-y-5">
          <FormGrid>
            <FormField id="v-date" label="Voucher date" required>
              <Input id="v-date" type="date" value={head.date} onChange={(e) => setHead({ ...head, date: e.target.value })} />
            </FormField>
            <FormField id="v-payee" label={type === 'credit' ? 'Received from' : 'Payee'} required>
              <Input id="v-payee" value={head.payee} onChange={(e) => setHead({ ...head, payee: e.target.value })} />
            </FormField>
            <FormField label="Fund source">
              <Select value={head.fundSource} onValueChange={(v) => setHead({ ...head, fundSource: v })}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['ADB Loan 3140-BAN', 'ADB Grant 0387-BAN', 'GoB Development Budget', 'SDC Grant TF-0912'].map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
            {type === 'debit' ? (
              <FormField id="v-chq" label="Cheque number">
                <Input id="v-chq" value={head.chequeNo} onChange={(e) => setHead({ ...head, chequeNo: e.target.value })} />
              </FormField>
            ) : null}
            <FormField id="v-narr" label="Narration" className="sm:col-span-2">
              <Textarea id="v-narr" rows={2} value={head.narration} onChange={(e) => setHead({ ...head, narration: e.target.value })} />
            </FormField>
          </FormGrid>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Account lines</p>
              <Button size="sm" variant="outline" onClick={() => setLines((prev) => [...prev, blankLine()])}>
                <Plus className="size-4" /> Add line
              </Button>
            </div>

            <div className="space-y-3">
              {lines.map((line, index) => (
                <div key={line.key} className="rounded-lg border p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">Line {index + 1}</span>
                    {lines.length > 2 ? (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-7"
                        aria-label="Remove line"
                        onClick={() => setLines((prev) => prev.filter((l) => l.key !== line.key))}
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    ) : null}
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <FormField label="Account head" className="sm:col-span-2">
                      <Select value={line.ledgerId} onValueChange={(v) => updateLine(line.key, { ledgerId: v })}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select ledger" />
                        </SelectTrigger>
                        <SelectContent className="max-h-72">
                          {ledgers.map((l) => (
                            <SelectItem key={l.id} value={l.id}>
                              {l.code} · {l.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormField>
                    <FormField label="Description" className="sm:col-span-2">
                      <Input value={line.description} onChange={(e) => updateLine(line.key, { description: e.target.value })} />
                    </FormField>
                    <FormField label="Debit">
                      <Input
                        inputMode="numeric"
                        value={line.debit}
                        onChange={(e) => updateLine(line.key, { debit: e.target.value, credit: '' })}
                      />
                    </FormField>
                    <FormField label="Credit">
                      <Input
                        inputMode="numeric"
                        value={line.credit}
                        onChange={(e) => updateLine(line.key, { credit: e.target.value, debit: '' })}
                      />
                    </FormField>
                  </div>
                </div>
              ))}
            </div>

            <div
              className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm ${
                balanced ? 'border-success/30 bg-success/8 text-success' : 'bg-muted/40'
              }`}
            >
              <span className="font-medium">{balanced ? 'Balanced' : 'Not balanced'}</span>
              <span className="tabular-nums">
                Dr {formatCurrency(draftTotals.debit)} · Cr {formatCurrency(draftTotals.credit)}
              </span>
            </div>
          </div>
        </div>
      </RecordSheet>
    </PageContainer>
  )
}
