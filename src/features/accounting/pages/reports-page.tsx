import { useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { ReportShell } from '@/components/common/report-shell'
import { DataTable } from '@/components/common/data-table'
import { FormField } from '@/components/common/form-field'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCurrency, formatDate } from '@/lib/format'
import { ledgerBalance, useAccountingStore, useGroupLookup } from '../store'
import type { Ledger } from '../types'

/* ---------------------------------- Trial balance --------------------------------- */

export function TrialBalancePage() {
  const ledgers = useAccountingStore((s) => s.ledgers)
  const groupById = useGroupLookup()

  const rows = useMemo(
    () =>
      ledgers.map((ledger) => {
        const group = groupById[ledger.groupId]
        const balance = ledgerBalance(ledger, group?.nature ?? 'asset')
        const isDebitNature = group?.nature === 'asset' || group?.nature === 'expense'
        return {
          ...ledger,
          groupName: group?.name ?? '—',
          debitBalance: isDebitNature ? Math.max(balance, 0) : Math.max(-balance, 0),
          creditBalance: isDebitNature ? Math.max(-balance, 0) : Math.max(balance, 0),
        }
      }),
    [ledgers, groupById],
  )

  const totals = rows.reduce(
    (acc, r) => ({ debit: acc.debit + r.debitBalance, credit: acc.credit + r.creditBalance }),
    { debit: 0, credit: 0 },
  )

  const columns: ColumnDef<(typeof rows)[number], any>[] = [
    { accessorKey: 'code', header: 'Code', meta: { label: 'Code', className: 'font-mono text-xs' } },
    {
      accessorKey: 'name',
      header: 'Account head',
      meta: { label: 'Account head' },
      cell: ({ row }) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{row.original.name}</p>
          <p className="truncate text-xs text-muted-foreground">{row.original.groupName}</p>
        </div>
      ),
    },
    {
      accessorKey: 'economicCode',
      header: 'Economic code',
      meta: { label: 'Economic code', className: 'font-mono text-xs', hideOnMobile: true },
    },
    {
      accessorKey: 'debit',
      header: 'Debit turnover',
      meta: { align: 'right', label: 'Debit turnover', hideOnMobile: true },
      cell: ({ getValue }) => formatCurrency(getValue<number>()),
    },
    {
      accessorKey: 'credit',
      header: 'Credit turnover',
      meta: { align: 'right', label: 'Credit turnover', hideOnMobile: true },
      cell: ({ getValue }) => formatCurrency(getValue<number>()),
    },
    {
      accessorKey: 'debitBalance',
      header: 'Dr balance',
      meta: { align: 'right', label: 'Dr balance' },
      cell: ({ getValue }) => (getValue<number>() ? formatCurrency(getValue<number>()) : '—'),
    },
    {
      accessorKey: 'creditBalance',
      header: 'Cr balance',
      meta: { align: 'right', label: 'Cr balance' },
      cell: ({ getValue }) => (getValue<number>() ? formatCurrency(getValue<number>()) : '—'),
    },
  ]

  return (
    <ReportShell
      title="Trial Balance"
      description="Ledger-wise debit and credit balances for the selected period"
      notes={`Difference: ${formatCurrency(Math.abs(totals.debit - totals.credit))}`}
    >
      <DataTable
        columns={columns}
        data={rows}
        searchPlaceholder="Search account head or code…"
        pageSize={20}
        dense
        emptyTitle="No ledgers"
        footer={
          <div className="flex flex-wrap justify-between gap-2 font-medium">
            <span>Total</span>
            <span className="tabular-nums">
              Dr {formatCurrency(totals.debit)} · Cr {formatCurrency(totals.credit)}
            </span>
          </div>
        }
      />
    </ReportShell>
  )
}

/* --------------------------------- Ledger statement -------------------------------- */

export function LedgerStatementPage() {
  const ledgers = useAccountingStore((s) => s.ledgers)
  const vouchers = useAccountingStore((s) => s.vouchers)
  const [ledgerId, setLedgerId] = useState(ledgers[0]?.id ?? '')
  const [from, setFrom] = useState('2026-07-01')
  const [to, setTo] = useState('2026-09-30')

  const ledger = ledgers.find((l) => l.id === ledgerId)

  const entries = useMemo(() => {
    const list = vouchers
      .filter((v) => v.status !== 'cancelled')
      .filter((v) => v.date >= from && v.date <= to)
      .flatMap((voucher) =>
        voucher.lines
          .filter((line) => line.ledgerId === ledgerId)
          .map((line) => ({
            id: line.id,
            date: voucher.date,
            voucherNo: voucher.voucherNo,
            narration: line.description || voucher.narration,
            debit: line.debit,
            credit: line.credit,
          })),
      )
      .sort((a, b) => a.date.localeCompare(b.date))

    let running = ledger?.openingBalance ?? 0
    return list.map((entry) => {
      running += entry.debit - entry.credit
      return { ...entry, balance: running }
    })
  }, [vouchers, ledgerId, from, to, ledger])

  const totals = entries.reduce(
    (acc, e) => ({ debit: acc.debit + e.debit, credit: acc.credit + e.credit }),
    { debit: 0, credit: 0 },
  )

  return (
    <ReportShell
      title="Ledger Statement"
      description="Transaction history for a single account head"
      period={`${formatDate(from)} to ${formatDate(to)}`}
      filters={
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <FormField label="Account head">
            <Select value={ledgerId} onValueChange={setLedgerId}>
              <SelectTrigger className="w-full">
                <SelectValue />
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
          <FormField id="ls-from" label="From">
            <Input id="ls-from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </FormField>
          <FormField id="ls-to" label="To">
            <Input id="ls-to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </FormField>
        </div>
      }
      notes={`Opening balance: ${formatCurrency(ledger?.openingBalance ?? 0)} · Closing balance: ${formatCurrency(
        entries.at(-1)?.balance ?? ledger?.openingBalance ?? 0,
      )}`}
    >
      <div className="overflow-hidden rounded-lg border">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="text-xs uppercase">Date</TableHead>
                <TableHead className="text-xs uppercase">Voucher</TableHead>
                <TableHead className="text-xs uppercase">Particulars</TableHead>
                <TableHead className="text-right text-xs uppercase">Debit</TableHead>
                <TableHead className="text-right text-xs uppercase">Credit</TableHead>
                <TableHead className="text-right text-xs uppercase">Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="bg-muted/20">
                <TableCell colSpan={5} className="font-medium">
                  Opening balance
                </TableCell>
                <TableCell className="text-right font-medium tabular-nums">
                  {formatCurrency(ledger?.openingBalance ?? 0)}
                </TableCell>
              </TableRow>
              {entries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                    No transactions in this period.
                  </TableCell>
                </TableRow>
              ) : (
                entries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="whitespace-nowrap">{formatDate(entry.date)}</TableCell>
                    <TableCell className="font-mono text-xs">{entry.voucherNo}</TableCell>
                    <TableCell className="text-muted-foreground">{entry.narration}</TableCell>
                    <TableCell className="text-right tabular-nums">{entry.debit ? formatCurrency(entry.debit) : '—'}</TableCell>
                    <TableCell className="text-right tabular-nums">{entry.credit ? formatCurrency(entry.credit) : '—'}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatCurrency(entry.balance)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex flex-wrap justify-between gap-2 border-t bg-muted/40 px-4 py-2 text-sm font-medium">
          <span>Period movement</span>
          <span className="tabular-nums">
            Dr {formatCurrency(totals.debit)} · Cr {formatCurrency(totals.credit)}
          </span>
        </div>
      </div>
    </ReportShell>
  )
}

/* --------------------------------- Group statement --------------------------------- */

export function GroupStatementPage() {
  const ledgers = useAccountingStore((s) => s.ledgers)
  const groups = useAccountingStore((s) => s.groups)
  const groupById = useGroupLookup()

  const rows = useMemo(
    () =>
      groups
        .map((group) => {
          const own = ledgers.filter((l) => l.groupId === group.id)
          const debit = own.reduce((s, l) => s + l.debit, 0)
          const credit = own.reduce((s, l) => s + l.credit, 0)
          const opening = own.reduce((s, l) => s + l.openingBalance, 0)
          return {
            ...group,
            ledgerCount: own.length,
            opening,
            debit,
            credit,
            balance: ledgerBalance(
              { openingBalance: opening, debit, credit } as Ledger,
              groupById[group.id]?.nature ?? 'asset',
            ),
          }
        })
        .filter((row) => row.ledgerCount > 0),
    [groups, ledgers, groupById],
  )

  const columns: ColumnDef<(typeof rows)[number], any>[] = [
    { accessorKey: 'code', header: 'Code', meta: { label: 'Code', className: 'font-mono text-xs' } },
    {
      accessorKey: 'name',
      header: 'Group',
      meta: { label: 'Group' },
      cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    },
    { accessorKey: 'nature', header: 'Nature', meta: { label: 'Nature', className: 'capitalize' } },
    { accessorKey: 'ledgerCount', header: 'Ledgers', meta: { align: 'right', label: 'Ledgers' } },
    {
      accessorKey: 'opening',
      header: 'Opening',
      meta: { align: 'right', label: 'Opening', hideOnMobile: true },
      cell: ({ getValue }) => formatCurrency(getValue<number>()),
    },
    {
      accessorKey: 'debit',
      header: 'Debit',
      meta: { align: 'right', label: 'Debit' },
      cell: ({ getValue }) => formatCurrency(getValue<number>()),
    },
    {
      accessorKey: 'credit',
      header: 'Credit',
      meta: { align: 'right', label: 'Credit' },
      cell: ({ getValue }) => formatCurrency(getValue<number>()),
    },
    {
      accessorKey: 'balance',
      header: 'Balance',
      meta: { align: 'right', label: 'Balance' },
      cell: ({ getValue }) => <span className="font-medium">{formatCurrency(getValue<number>())}</span>,
    },
  ]

  return (
    <ReportShell title="Group Statement" description="Consolidated movement by account group">
      <DataTable columns={columns} data={rows} searchPlaceholder="Search group…" pageSize={20} dense emptyTitle="No groups" />
    </ReportShell>
  )
}

/* -------------------------------- Subsidiary ledger -------------------------------- */

export function SubsidiaryLedgerPage() {
  const ledgers = useAccountingStore((s) => s.ledgers)
  const groupById = useGroupLookup()
  const rows = useMemo(() => ledgers.filter((l) => l.isSubsidiary), [ledgers])

  const columns: ColumnDef<Ledger, any>[] = [
    { accessorKey: 'code', header: 'Code', meta: { label: 'Code', className: 'font-mono text-xs' } },
    {
      accessorKey: 'name',
      header: 'Subsidiary head',
      meta: { label: 'Subsidiary head' },
      cell: ({ getValue }) => <span className="font-medium">{getValue<string>()}</span>,
    },
    {
      id: 'group',
      header: 'Control account',
      meta: { label: 'Control account' },
      accessorFn: (row) => groupById[row.groupId]?.name ?? '—',
    },
    { accessorKey: 'economicCode', header: 'Economic code', meta: { label: 'Economic code', className: 'font-mono text-xs' } },
    {
      accessorKey: 'debit',
      header: 'Debit',
      meta: { align: 'right', label: 'Debit' },
      cell: ({ getValue }) => formatCurrency(getValue<number>()),
    },
    {
      accessorKey: 'credit',
      header: 'Credit',
      meta: { align: 'right', label: 'Credit' },
      cell: ({ getValue }) => formatCurrency(getValue<number>()),
    },
    {
      id: 'balance',
      header: 'Balance',
      meta: { align: 'right', label: 'Balance' },
      accessorFn: (row) => ledgerBalance(row, groupById[row.groupId]?.nature ?? 'asset'),
      cell: ({ getValue }) => <span className="font-medium">{formatCurrency(getValue<number>())}</span>,
    },
  ]

  return (
    <ReportShell
      title="Subsidiary Ledger"
      description="Party-wise control accounts maintained under the main ledger"
    >
      <DataTable columns={columns} data={rows} searchPlaceholder="Search subsidiary head…" dense emptyTitle="No subsidiary ledgers" />
    </ReportShell>
  )
}
