import { useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { ReportShell } from '@/components/common/report-shell'
import { DataTable } from '@/components/common/data-table'
import { DetailList } from '@/components/common/detail-list'
import { FormField } from '@/components/common/form-field'
import { SectionCard } from '@/components/common/section-card'
import { StatusBadge } from '@/components/common/status-badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCurrency, formatDate, formatNumber } from '@/lib/format'
import {
  auditObservations,
  stipendDisbursements,
  taxCertificates,
  trainingGrants,
} from '../data/report-data'
import { ledgerBalance, useAccountingStore, useGroupLookup, useLedgerLookup } from '../store'

/* ------------------------------- Summary balance ---------------------------------- */

export function SummaryBalancePage() {
  const ledgers = useAccountingStore((s) => s.ledgers)
  const groupById = useGroupLookup()

  const rows = useMemo(() => {
    const map = new Map<string, { nature: string; opening: number; debit: number; credit: number; balance: number }>()
    for (const ledger of ledgers) {
      const nature = groupById[ledger.groupId]?.nature ?? 'asset'
      const current = map.get(nature) ?? { nature, opening: 0, debit: 0, credit: 0, balance: 0 }
      current.opening += ledger.openingBalance
      current.debit += ledger.debit
      current.credit += ledger.credit
      current.balance += ledgerBalance(ledger, nature)
      map.set(nature, current)
    }
    return Array.from(map.values())
  }, [ledgers, groupById])

  const columns: ColumnDef<(typeof rows)[number], any>[] = [
    {
      accessorKey: 'nature',
      header: 'Account nature',
      meta: { label: 'Account nature', className: 'capitalize' },
      cell: ({ getValue }) => <span className="font-medium capitalize">{getValue<string>()}</span>,
    },
    { accessorKey: 'opening', header: 'Opening', meta: { align: 'right', label: 'Opening' }, cell: ({ getValue }) => formatCurrency(getValue<number>(), { compact: true }) },
    { accessorKey: 'debit', header: 'Debit', meta: { align: 'right', label: 'Debit' }, cell: ({ getValue }) => formatCurrency(getValue<number>(), { compact: true }) },
    { accessorKey: 'credit', header: 'Credit', meta: { align: 'right', label: 'Credit' }, cell: ({ getValue }) => formatCurrency(getValue<number>(), { compact: true }) },
    {
      accessorKey: 'balance',
      header: 'Closing balance',
      meta: { align: 'right', label: 'Closing balance' },
      cell: ({ getValue }) => <span className="font-medium">{formatCurrency(getValue<number>(), { compact: true })}</span>,
    },
  ]

  return (
    <ReportShell title="Summary Balance" description="Balances consolidated by account nature">
      <DataTable columns={columns} data={rows} searchPlaceholder={null} dense emptyTitle="No ledgers" />
    </ReportShell>
  )
}

/* ---------------------------------- Stipend report -------------------------------- */

export function StipendReportPage() {
  const totals = stipendDisbursements.reduce(
    (acc, r) => ({ trainees: acc.trainees + r.trainees, amount: acc.amount + r.amount }),
    { trainees: 0, amount: 0 },
  )

  const columns: ColumnDef<(typeof stipendDisbursements)[number], any>[] = [
    { accessorKey: 'month', header: 'Month', meta: { label: 'Month' } },
    {
      accessorKey: 'agency',
      header: 'Training institute',
      meta: { label: 'Institute' },
      cell: ({ row }) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{row.original.agency}</p>
          <p className="truncate text-xs text-muted-foreground">{row.original.sector}</p>
        </div>
      ),
    },
    { accessorKey: 'trainees', header: 'Trainees', meta: { align: 'right', label: 'Trainees' }, cell: ({ getValue }) => formatNumber(getValue<number>()) },
    { accessorKey: 'ratePerTrainee', header: 'Rate', meta: { align: 'right', label: 'Rate' }, cell: ({ getValue }) => formatCurrency(getValue<number>()) },
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

  return (
    <ReportShell
      title="Stipend Report"
      description="Trainee stipend disbursed through training institutes"
      notes={`Trainees covered: ${formatNumber(totals.trainees)} · Total stipend: ${formatCurrency(totals.amount)}`}
    >
      <DataTable
        columns={columns}
        data={stipendDisbursements}
        searchPlaceholder="Search institute or month…"
        pageSize={15}
        dense
        emptyTitle="No stipend records"
        footer={
          <div className="flex justify-between font-medium">
            <span>Total stipend</span>
            <span className="tabular-nums">{formatCurrency(totals.amount)}</span>
          </div>
        }
      />
    </ReportShell>
  )
}

/* ---------------------------- Training grant statement ---------------------------- */

export function TrainingGrantStatementPage() {
  const total = trainingGrants.reduce((s, g) => s + g.amount, 0)

  const columns: ColumnDef<(typeof trainingGrants)[number], any>[] = [
    {
      accessorKey: 'agency',
      header: 'Training institute',
      meta: { label: 'Institute' },
      cell: ({ row }) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{row.original.agency}</p>
          <p className="truncate text-xs text-muted-foreground">
            {row.original.sector} · {row.original.batch}
          </p>
        </div>
      ),
    },
    { accessorKey: 'instalment', header: 'Instalment', meta: { align: 'center', label: 'Instalment' } },
    { accessorKey: 'trainees', header: 'Trainees', meta: { align: 'right', label: 'Trainees' }, cell: ({ getValue }) => formatNumber(getValue<number>()) },
    {
      accessorKey: 'releaseDate',
      header: 'Release date',
      meta: { align: 'right', label: 'Release date' },
      cell: ({ getValue }) => formatDate(getValue<string>()),
    },
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

  return (
    <ReportShell
      title="Training Grant Statement"
      description="Grant instalments released to industry training institutes"
      notes={`Total released: ${formatCurrency(total)}`}
    >
      <DataTable
        columns={columns}
        data={trainingGrants}
        searchPlaceholder="Search institute or batch…"
        pageSize={15}
        dense
        emptyTitle="No grants"
        footer={
          <div className="flex justify-between font-medium">
            <span>Total grant released</span>
            <span className="tabular-nums">{formatCurrency(total)}</span>
          </div>
        }
      />
    </ReportShell>
  )
}

/* ------------------------------- Monthly expense ---------------------------------- */

const MONTH_KEYS = ['2026-07', '2026-08', '2026-09']
const MONTH_LABELS: Record<string, string> = { '2026-07': 'July', '2026-08': 'August', '2026-09': 'September' }

export function MonthlyExpensePage() {
  const vouchers = useAccountingStore((s) => s.vouchers)
  const ledgerById = useLedgerLookup()

  const rows = useMemo(() => {
    const map = new Map<string, Record<string, number> & { ledger: string; code: string; total: number }>()
    for (const voucher of vouchers) {
      if (voucher.status === 'cancelled') continue
      const month = voucher.date.slice(0, 7)
      if (!MONTH_KEYS.includes(month)) continue
      for (const line of voucher.lines) {
        const ledger = ledgerById[line.ledgerId]
        if (!ledger || !(ledger.code.startsWith('41') || ledger.code.startsWith('42'))) continue
        const current =
          map.get(ledger.id) ??
          ({ ledger: ledger.name, code: ledger.code, total: 0, ...Object.fromEntries(MONTH_KEYS.map((m) => [m, 0])) } as any)
        current[month] += line.debit
        current.total += line.debit
        map.set(ledger.id, current)
      }
    }
    return Array.from(map.values()).sort((a, b) => b.total - a.total)
  }, [vouchers, ledgerById])

  const columns: ColumnDef<(typeof rows)[number], any>[] = [
    { accessorKey: 'code', header: 'Code', meta: { label: 'Code', className: 'font-mono text-xs' } },
    {
      accessorKey: 'ledger',
      header: 'Expenditure head',
      meta: { label: 'Head' },
      cell: ({ getValue }) => <span className="font-medium">{getValue<string>()}</span>,
    },
    ...MONTH_KEYS.map((month) => ({
      id: month,
      header: MONTH_LABELS[month],
      meta: { align: 'right' as const, label: MONTH_LABELS[month] },
      accessorFn: (row: Record<string, unknown>) => row[month] as number,
      cell: ({ getValue }: { getValue: () => unknown }) => formatCurrency(Number(getValue())),
    })),
    {
      accessorKey: 'total',
      header: 'Total',
      meta: { align: 'right', label: 'Total' },
      cell: ({ getValue }) => <span className="font-medium">{formatCurrency(getValue<number>())}</span>,
    },
  ] as ColumnDef<(typeof rows)[number], any>[]

  const grandTotal = rows.reduce((s, r) => s + r.total, 0)

  return (
    <ReportShell
      title="Monthly Expense Report"
      description="Expenditure head against each month of the running quarter"
      period="July – September 2026"
      notes={`Grand total: ${formatCurrency(grandTotal)}`}
    >
      <DataTable
        columns={columns}
        data={rows}
        searchPlaceholder="Search expenditure head…"
        pageSize={20}
        dense
        emptyTitle="No expenditure booked"
        footer={
          <div className="flex justify-between font-medium">
            <span>Grand total</span>
            <span className="tabular-nums">{formatCurrency(grandTotal)}</span>
          </div>
        }
      />
    </ReportShell>
  )
}

/* ---------------------------- IAS wise disbursement -------------------------------- */

export function IasDisbursementPage() {
  const rows = useMemo(() => {
    const map = new Map<string, { agency: string; sector: string; trainees: number; grant: number; stipend: number }>()
    for (const grant of trainingGrants) {
      const current = map.get(grant.agency) ?? { agency: grant.agency, sector: grant.sector, trainees: 0, grant: 0, stipend: 0 }
      current.trainees += grant.trainees
      current.grant += grant.amount
      map.set(grant.agency, current)
    }
    for (const stipend of stipendDisbursements) {
      const current = map.get(stipend.agency) ?? { agency: stipend.agency, sector: stipend.sector, trainees: 0, grant: 0, stipend: 0 }
      current.stipend += stipend.amount
      map.set(stipend.agency, current)
    }
    return Array.from(map.values()).map((r) => ({ ...r, total: r.grant + r.stipend }))
  }, [])

  const total = rows.reduce((s, r) => s + r.total, 0)

  const columns: ColumnDef<(typeof rows)[number], any>[] = [
    {
      accessorKey: 'agency',
      header: 'Implementing agency',
      meta: { label: 'Agency' },
      cell: ({ row }) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{row.original.agency}</p>
          <p className="truncate text-xs text-muted-foreground">{row.original.sector}</p>
        </div>
      ),
    },
    { accessorKey: 'trainees', header: 'Trainees', meta: { align: 'right', label: 'Trainees' }, cell: ({ getValue }) => formatNumber(getValue<number>()) },
    { accessorKey: 'grant', header: 'Training grant', meta: { align: 'right', label: 'Training grant' }, cell: ({ getValue }) => formatCurrency(getValue<number>(), { compact: true }) },
    { accessorKey: 'stipend', header: 'Stipend', meta: { align: 'right', label: 'Stipend' }, cell: ({ getValue }) => formatCurrency(getValue<number>(), { compact: true }) },
    {
      accessorKey: 'total',
      header: 'Total disbursed',
      meta: { align: 'right', label: 'Total disbursed' },
      cell: ({ getValue }) => <span className="font-medium">{formatCurrency(getValue<number>(), { compact: true })}</span>,
    },
  ]

  return (
    <ReportShell
      title="IAS Wise Disbursement"
      description="Disbursement to each implementing agency across grant and stipend heads"
      notes={`Total disbursed: ${formatCurrency(total)}`}
    >
      <DataTable columns={columns} data={rows} searchPlaceholder="Search agency…" dense emptyTitle="No disbursement" />
    </ReportShell>
  )
}

/* ------------------------------------ FAPAD --------------------------------------- */

export function FapadReportPage() {
  const columns: ColumnDef<(typeof auditObservations)[number], any>[] = [
    { accessorKey: 'obsNo', header: 'Observation no.', meta: { label: 'Observation no.', className: 'font-mono text-xs' } },
    { accessorKey: 'auditYear', header: 'Audit year', meta: { label: 'Audit year' } },
    {
      accessorKey: 'observation',
      header: 'Observation',
      meta: { label: 'Observation' },
      cell: ({ getValue }) => <span className="block max-w-md">{getValue<string>()}</span>,
    },
    {
      accessorKey: 'amountInvolved',
      header: 'Amount involved',
      meta: { align: 'right', label: 'Amount involved' },
      cell: ({ getValue }) => formatCurrency(getValue<number>()),
    },
    {
      accessorKey: 'reply',
      header: 'Reply / action taken',
      meta: { label: 'Reply', hideOnMobile: true },
      cell: ({ getValue }) => <span className="block max-w-md text-muted-foreground">{getValue<string>()}</span>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      meta: { align: 'center', label: 'Status' },
      cell: ({ getValue }) => (
        <StatusBadge
          status={getValue<string>()}
          tone={getValue<string>() === 'settled' ? 'success' : getValue<string>() === 'unsettled' ? 'destructive' : 'warning'}
        />
      ),
    },
  ]

  const unsettled = auditObservations.filter((o) => o.status !== 'settled').reduce((s, o) => s + o.amountInvolved, 0)

  return (
    <ReportShell
      title="FAPAD Report"
      description="Foreign Aided Project Audit Directorate observations and their settlement status"
      notes={`Amount under unsettled observations: ${formatCurrency(unsettled)}`}
    >
      <DataTable columns={columns} data={auditObservations} searchPlaceholder="Search observation…" dense emptyTitle="No observations" />
    </ReportShell>
  )
}

/* ------------------------------------- SOE ---------------------------------------- */

export function SoeReportPage() {
  const ledgers = useAccountingStore((s) => s.ledgers)
  const groupById = useGroupLookup()

  const rows = useMemo(
    () =>
      ledgers
        .filter((l) => l.code.startsWith('41') || l.code.startsWith('42'))
        .map((ledger) => ({
          ...ledger,
          groupName: groupById[ledger.groupId]?.name ?? '—',
          claimed: Math.round(ledger.debit * 0.92),
          eligible: Math.round(ledger.debit * 0.9),
        })),
    [ledgers, groupById],
  )

  const totals = rows.reduce(
    (acc, r) => ({ spent: acc.spent + r.debit, claimed: acc.claimed + r.claimed, eligible: acc.eligible + r.eligible }),
    { spent: 0, claimed: 0, eligible: 0 },
  )

  const columns: ColumnDef<(typeof rows)[number], any>[] = [
    { accessorKey: 'economicCode', header: 'Economic code', meta: { label: 'Economic code', className: 'font-mono text-xs' } },
    {
      accessorKey: 'name',
      header: 'Expenditure head',
      meta: { label: 'Head' },
      cell: ({ row }) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{row.original.name}</p>
          <p className="truncate text-xs text-muted-foreground">{row.original.groupName}</p>
        </div>
      ),
    },
    { accessorKey: 'debit', header: 'Expenditure', meta: { align: 'right', label: 'Expenditure' }, cell: ({ getValue }) => formatCurrency(getValue<number>(), { compact: true }) },
    { accessorKey: 'claimed', header: 'Claimed', meta: { align: 'right', label: 'Claimed' }, cell: ({ getValue }) => formatCurrency(getValue<number>(), { compact: true }) },
    {
      accessorKey: 'eligible',
      header: 'Eligible for reimbursement',
      meta: { align: 'right', label: 'Eligible' },
      cell: ({ getValue }) => <span className="font-medium">{formatCurrency(getValue<number>(), { compact: true })}</span>,
    },
  ]

  return (
    <ReportShell
      title="SOE Report"
      description="Statement of Expenditure submitted for reimbursement to the development partner"
      notes={`Eligible for reimbursement: ${formatCurrency(totals.eligible)}`}
    >
      <DataTable
        columns={columns}
        data={rows}
        searchPlaceholder="Search head…"
        pageSize={20}
        dense
        emptyTitle="No expenditure"
        footer={
          <div className="flex flex-wrap justify-between gap-2 font-medium">
            <span>Total</span>
            <span className="tabular-nums">
              Expenditure {formatCurrency(totals.spent)} · Eligible {formatCurrency(totals.eligible)}
            </span>
          </div>
        }
      />
    </ReportShell>
  )
}

/* ------------------------------ Financial statement -------------------------------- */

export function FinancialStatementPage() {
  const ledgers = useAccountingStore((s) => s.ledgers)

  const receipts = useMemo(() => ledgers.filter((l) => l.code.startsWith('3')), [ledgers])
  const payments = useMemo(() => ledgers.filter((l) => l.code.startsWith('41') || l.code.startsWith('42')), [ledgers])

  const receiptTotal = receipts.reduce((s, l) => s + l.credit, 0)
  const paymentTotal = payments.reduce((s, l) => s + l.debit, 0)

  return (
    <ReportShell
      title="Financial Statement"
      description="Receipts and payments account for the reporting period"
      notes={`Closing balance: ${formatCurrency(receiptTotal - paymentTotal)}`}
    >
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SectionCard title="Receipts" contentClassName="p-0">
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="text-xs uppercase">Head</TableHead>
                  <TableHead className="text-right text-xs uppercase">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {receipts.map((ledger) => (
                  <TableRow key={ledger.id}>
                    <TableCell>
                      <span className="font-mono text-xs text-muted-foreground">{ledger.code}</span> {ledger.name}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{formatCurrency(ledger.credit)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex justify-between border-t bg-muted/40 px-4 py-2 text-sm font-medium">
              <span>Total receipts</span>
              <span className="tabular-nums">{formatCurrency(receiptTotal)}</span>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Payments" contentClassName="p-0">
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="text-xs uppercase">Head</TableHead>
                  <TableHead className="text-right text-xs uppercase">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((ledger) => (
                  <TableRow key={ledger.id}>
                    <TableCell>
                      <span className="font-mono text-xs text-muted-foreground">{ledger.code}</span> {ledger.name}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{formatCurrency(ledger.debit)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex justify-between border-t bg-muted/40 px-4 py-2 text-sm font-medium">
              <span>Total payments</span>
              <span className="tabular-nums">{formatCurrency(paymentTotal)}</span>
            </div>
          </div>
        </SectionCard>
      </div>
    </ReportShell>
  )
}

/* --------------------------------- Tax certificate -------------------------------- */

export function TaxCertificatePage() {
  const [certId, setCertId] = useState(taxCertificates[0].id)
  const certificate = taxCertificates.find((c) => c.id === certId)!

  return (
    <ReportShell
      title="VAT / Tax Certificate"
      description="Certificate of deduction at source issued to a supplier or consultant"
      period={certificate.period}
      filters={
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <FormField label="Certificate">
            <Select value={certId} onValueChange={setCertId}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                {taxCertificates.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.certNo} · {c.party}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        </div>
      }
      notes="This certificate is issued under section 52 of the Income Tax Act and rule 37 of the VAT & SD Act."
    >
      <div className="space-y-5 px-2 sm:px-4">
        <DetailList
          items={[
            { label: 'Certificate no.', value: <span className="font-mono">{certificate.certNo}</span> },
            { label: 'Issue date', value: formatDate(certificate.issueDate) },
            { label: 'Party', value: certificate.party },
            { label: 'TIN', value: <span className="font-mono">{certificate.tin}</span> },
            { label: 'Period', value: certificate.period },
          ]}
        />
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="text-xs uppercase">Particulars</TableHead>
                <TableHead className="text-right text-xs uppercase">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Gross bill amount</TableCell>
                <TableCell className="text-right tabular-nums">{formatCurrency(certificate.grossAmount)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Income tax deducted at source (5%)</TableCell>
                <TableCell className="text-right tabular-nums">{formatCurrency(certificate.taxDeducted)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>VAT deducted at source (7.5%)</TableCell>
                <TableCell className="text-right tabular-nums">{formatCurrency(certificate.vatDeducted)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <div className="flex justify-between border-t bg-muted/40 px-4 py-2 text-sm font-medium">
            <span>Net paid to party</span>
            <span className="tabular-nums">
              {formatCurrency(certificate.grossAmount - certificate.taxDeducted - certificate.vatDeducted)}
            </span>
          </div>
        </div>
      </div>
    </ReportShell>
  )
}
