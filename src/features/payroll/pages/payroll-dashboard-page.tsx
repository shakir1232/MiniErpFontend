import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Link } from 'react-router-dom'
import { ArrowRight, Banknote, ReceiptText, Users, Wallet } from 'lucide-react'
import { PageContainer } from '@/components/common/page-container'
import { PageHeader } from '@/components/common/page-header'
import { StatCard } from '@/components/common/stat-card'
import { ChartCard } from '@/components/common/chart-card'
import { SectionCard } from '@/components/common/section-card'
import { StatusBadge } from '@/components/common/status-badge'
import { Button } from '@/components/ui/button'
import { axisProps, gridProps, tooltipStyle } from '@/lib/chart'
import { compactNumber, formatCurrency, formatDate, formatNumber } from '@/lib/format'
import { usePayrollStore } from '../store'

export function PayrollDashboardPage() {
  const runs = usePayrollStore((s) => s.runs)
  const challans = usePayrollStore((s) => s.challans)
  const payrollEmployees = usePayrollStore((s) => s.payrollEmployees)

  const latest = runs[0]
  const chartData = [...runs].reverse().map((run) => ({
    month: run.label.split(' ')[0].slice(0, 3),
    gross: run.grossTotal,
    net: run.netTotal,
    deduction: run.deductionTotal,
  }))

  const activeCount = payrollEmployees.filter((p) => p.status === 'active').length
  const pendingChallans = challans.filter((c) => c.status !== 'cleared')

  return (
    <PageContainer>
      <PageHeader
        title="Payroll dashboard"
        description="Monthly remuneration position across the project payroll"
        actions={
          <Button asChild size="sm" variant="outline">
            <Link to="/payroll/process">
              Process payroll <ArrowRight className="size-4" />
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard label="On payroll" value={formatNumber(activeCount)} icon={Users} />
        <StatCard
          label={`${latest.label} gross`}
          value={formatCurrency(latest.grossTotal, { compact: true })}
          icon={Wallet}
          tone="info"
        />
        <StatCard
          label={`${latest.label} deductions`}
          value={formatCurrency(latest.deductionTotal, { compact: true })}
          icon={ReceiptText}
          tone="warning"
        />
        <StatCard
          label={`${latest.label} net payable`}
          value={formatCurrency(latest.netTotal, { compact: true })}
          icon={Banknote}
          tone="success"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <ChartCard title="Gross vs net payroll" description="Last six processed months" className="xl:col-span-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="month" {...axisProps} />
              <YAxis {...axisProps} width={52} tickFormatter={(v: number) => compactNumber(v)} />
              <Tooltip {...tooltipStyle} formatter={((v: any, n: any) => [formatCurrency(Number(v)), n]) as any} />
              <Bar dataKey="gross" name="Gross" fill="var(--chart-2)" radius={[4, 4, 0, 0]} maxBarSize={34} />
              <Bar dataKey="net" name="Net paid" fill="var(--chart-1)" radius={[4, 4, 0, 0]} maxBarSize={34} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Deduction trend" description="Tax, VAT, PF and advances">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="month" {...axisProps} />
              <YAxis {...axisProps} width={52} tickFormatter={(v: number) => compactNumber(v)} />
              <Tooltip {...tooltipStyle} formatter={((v: any) => formatCurrency(Number(v))) as any} />
              <Line dataKey="deduction" name="Deductions" stroke="var(--chart-3)" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SectionCard title="Recent payroll runs" contentClassName="divide-y">
          {runs.map((run) => (
            <Link
              key={run.id}
              to="/payroll/process"
              className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{run.label}</p>
                <p className="text-xs text-muted-foreground">
                  {formatNumber(run.employeeCount)} employees · processed {formatDate(run.processedOn)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className="text-sm tabular-nums">{formatCurrency(run.netTotal, { compact: true })}</span>
                <StatusBadge status={run.status} />
              </div>
            </Link>
          ))}
        </SectionCard>

        <SectionCard title="Challans needing action" description="Not yet cleared by the treasury" contentClassName="divide-y">
          {pendingChallans.map((challan) => (
            <div key={challan.id} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
              <div className="min-w-0">
                <p className="truncate font-mono text-sm">{challan.challanNo}</p>
                <p className="text-xs text-muted-foreground">
                  {challan.kind === 'tax' ? 'Income tax' : 'VAT'} · {challan.month}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className="text-sm tabular-nums">{formatCurrency(challan.amount, { compact: true })}</span>
                <StatusBadge status={challan.status} />
              </div>
            </div>
          ))}
        </SectionCard>
      </div>
    </PageContainer>
  )
}
