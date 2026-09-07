import { useMemo, useState } from 'react'
import { ChevronRight, FolderTree, Plus, Search } from 'lucide-react'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { RowActions } from '@/components/common/row-actions'
import { PageContainer } from '@/components/common/page-container'
import { PageHeader } from '@/components/common/page-header'
import { SectionCard } from '@/components/common/section-card'
import { StatCard } from '@/components/common/stat-card'
import { StatusBadge } from '@/components/common/status-badge'
import { RecordSheet } from '@/components/common/record-sheet'
import { FormField, FormGrid } from '@/components/common/form-field'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'
import { ledgerBalance, useAccountingStore } from '../store'
import type { AccountGroup, Ledger } from '../types'

const emptyLedgerForm = { code: '', name: '', groupId: '', economicCode: '', openingBalance: '' }

export function ChartOfAccountsPage() {
  const groups = useAccountingStore((s) => s.groups)
  const ledgers = useAccountingStore((s) => s.ledgers)
  const addLedger = useAccountingStore((s) => s.addLedger)
  const updateLedger = useAccountingStore((s) => s.updateLedger)
  const removeLedger = useAccountingStore((s) => s.removeLedger)
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Ledger | null>(null)
  const [deleting, setDeleting] = useState<Ledger | null>(null)
  const [form, setForm] = useState(emptyLedgerForm)

  const roots = useMemo(() => groups.filter((g) => g.parentId === null), [groups])
  const childrenOf = useMemo(() => {
    const map: Record<string, AccountGroup[]> = {}
    for (const group of groups) {
      if (!group.parentId) continue
      ;(map[group.parentId] ??= []).push(group)
    }
    return map
  }, [groups])

  const ledgersOf = useMemo(() => {
    const map: Record<string, Ledger[]> = {}
    for (const ledger of ledgers) (map[ledger.groupId] ??= []).push(ledger)
    return map
  }, [ledgers])

  const matches = (ledger: Ledger) =>
    !query ||
    ledger.name.toLowerCase().includes(query.toLowerCase()) ||
    ledger.code.includes(query) ||
    ledger.economicCode.includes(query)

  const totals = useMemo(
    () => ({
      groups: groups.length,
      ledgers: ledgers.length,
      expense: ledgers.filter((l) => l.code.startsWith('4')).reduce((s, l) => s + l.debit, 0),
    }),
    [groups, ledgers],
  )

  const renderGroup = (group: AccountGroup, depth = 0) => {
    const kids = childrenOf[group.id] ?? []
    const groupLedgers = (ledgersOf[group.id] ?? []).filter(matches)
    const hasContent = kids.length > 0 || groupLedgers.length > 0
    if (query && !hasContent && !kids.some((k) => (ledgersOf[k.id] ?? []).some(matches))) return null

    return (
      <Collapsible key={group.id} defaultOpen={depth < 2 || !!query}>
        <CollapsibleTrigger
          className="group flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-accent"
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
        >
          <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-90" />
          <span className="font-mono text-xs text-muted-foreground">{group.code}</span>
          <span className="min-w-0 flex-1 truncate font-medium">{group.name}</span>
          <Badge variant="outline" className="hidden capitalize sm:inline-flex">
            {group.nature}
          </Badge>
          <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
            {(ledgersOf[group.id] ?? []).length} ledgers
          </span>
        </CollapsibleTrigger>
        <CollapsibleContent>
          {kids.map((child) => renderGroup(child, depth + 1))}
          {groupLedgers.map((ledger) => {
            const nature = group.nature
            return (
              <div
                key={ledger.id}
                className="flex items-center gap-2 border-l py-1.5 pr-2 text-sm"
                style={{ marginLeft: `${depth * 16 + 26}px` }}
              >
                <span className="pl-3 font-mono text-xs text-muted-foreground">{ledger.code}</span>
                <span className="min-w-0 flex-1 truncate">{ledger.name}</span>
                {ledger.isSubsidiary ? (
                  <Badge variant="secondary" className="hidden text-[10px] sm:inline-flex">
                    subsidiary
                  </Badge>
                ) : null}
                <span className="hidden shrink-0 font-mono text-xs text-muted-foreground md:inline">
                  {ledger.economicCode}
                </span>
                <span
                  className={cn(
                    'w-28 shrink-0 text-right text-xs tabular-nums',
                    ledgerBalance(ledger, nature) < 0 && 'text-destructive',
                  )}
                >
                  {formatCurrency(ledgerBalance(ledger, nature))}
                </span>
                <StatusBadge status={ledger.status} className="hidden lg:inline-flex" />
                <RowActions onEdit={() => openEdit(ledger)} onDelete={() => setDeleting(ledger)} />
              </div>
            )
          })}
        </CollapsibleContent>
      </Collapsible>
    )
  }

  const openCreate = () => {
    setEditing(null)
    setForm(emptyLedgerForm)
    setOpen(true)
  }

  const openEdit = (ledger: Ledger) => {
    setEditing(ledger)
    setForm({
      code: ledger.code,
      name: ledger.name,
      groupId: ledger.groupId,
      economicCode: ledger.economicCode,
      openingBalance: String(ledger.openingBalance),
    })
    setOpen(true)
  }

  const submit = () => {
    if (!form.code || !form.name || !form.groupId) {
      toast.error('Code, name and group are required.')
      return
    }
    if (editing) {
      updateLedger(editing.id, {
        code: form.code,
        name: form.name,
        groupId: form.groupId,
        economicCode: form.economicCode || '—',
        openingBalance: Number(form.openingBalance) || 0,
      })
      toast.success(`Ledger ${form.name} updated.`)
      setOpen(false)
      setEditing(null)
      setForm(emptyLedgerForm)
      return
    }
    addLedger({
      code: form.code,
      name: form.name,
      groupId: form.groupId,
      economicCode: form.economicCode || '—',
      openingBalance: Number(form.openingBalance) || 0,
      debit: 0,
      credit: 0,
      isSubsidiary: false,
      status: 'active',
    })
    toast.success(`Ledger ${form.name} created.`)
    setOpen(false)
    setForm(emptyLedgerForm)
  }

  return (
    <PageContainer>
      <PageHeader
        title="Chart of accounts"
        description="Account groups and ledgers with their government economic codes"
        actions={
          <Button size="sm" onClick={openCreate}>
            <Plus className="size-4" /> Add ledger
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard label="Account groups" value={String(totals.groups)} icon={FolderTree} />
        <StatCard label="Ledgers" value={String(totals.ledgers)} />
        <StatCard label="Expenditure booked" value={formatCurrency(totals.expense, { compact: true })} tone="info" />
      </div>

      <SectionCard contentClassName="p-0">
        <div className="relative mb-2">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search ledger name, code or economic code…"
            className="pl-8 sm:max-w-sm"
          />
        </div>
        <div className="rounded-lg border">{roots.map((group) => renderGroup(group))}</div>
      </SectionCard>

      <RecordSheet
        open={open}
        onOpenChange={(next) => {
          setOpen(next)
          if (!next) setEditing(null)
        }}
        title={editing ? `Edit ${editing.name}` : 'Add ledger'}
        description="Prototype only — records live in browser memory."
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submit}>{editing ? 'Update ledger' : 'Save ledger'}</Button>
          </>
        }
      >
        <FormGrid>
          <FormField id="l-code" label="Ledger code" required>
            <Input id="l-code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
          </FormField>
          <FormField id="l-eco" label="Economic code">
            <Input id="l-eco" value={form.economicCode} onChange={(e) => setForm({ ...form, economicCode: e.target.value })} />
          </FormField>
          <FormField id="l-name" label="Ledger name" required className="sm:col-span-2">
            <Input id="l-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </FormField>
          <FormField label="Account group" required className="sm:col-span-2">
            <Select value={form.groupId} onValueChange={(v) => setForm({ ...form, groupId: v })}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select group" />
              </SelectTrigger>
              <SelectContent>
                {groups.map((g) => (
                  <SelectItem key={g.id} value={g.id}>
                    {'—'.repeat(g.level)} {g.code} · {g.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <FormField id="l-open" label="Opening balance (BDT)">
            <Input
              id="l-open"
              inputMode="numeric"
              value={form.openingBalance}
              onChange={(e) => setForm({ ...form, openingBalance: e.target.value })}
            />
          </FormField>
        </FormGrid>
      </RecordSheet>

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(next) => !next && setDeleting(null)}
        title={`Delete ${deleting?.name ?? 'ledger'}?`}
        description="Vouchers already posted to this ledger keep their line, but the account disappears from the chart."
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          if (deleting) {
            removeLedger(deleting.id)
            toast.success(`${deleting.name} deleted.`)
          }
          setDeleting(null)
        }}
      />
    </PageContainer>
  )
}
