import { Link } from 'react-router-dom'
import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ArrowRight, Banknote, Landmark, TrendingUp, Users } from 'lucide-react'
import { PageContainer } from '@/components/common/page-container'
import { PageHeader } from '@/components/common/page-header'
import { StatCard } from '@/components/common/stat-card'
import { ChartCard } from '@/components/common/chart-card'
import { SectionCard } from '@/components/common/section-card'
import { StatusBadge } from '@/components/common/status-badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { CHART_COLORS, axisProps, gridProps, tooltipStyle } from '@/lib/chart'
import { compactNumber, formatCurrency, formatDate, formatNumber, formatPercent } from '@/lib/format'
import { useActiveFiscalYear, useActiveProject } from '@/stores/app-store'
import { projects } from '@/features/projects/data/projects'
import { fundSplit, monthlyFlow, pendingTasks, trainingProgress } from '../data/dashboard'

export function DashboardPage() {
  const project = useActiveProject()
  const fy = useActiveFiscalYear()

  const fyAllocation = monthlyFlow.reduce((sum, m) => sum + m.allocation, 0)
  const fyExpenditure = monthlyFlow.reduce((sum, m) => sum + m.expenditure, 0)
  const utilisation = (project.cumulativeExpenditure / project.approvedCost) * 100
  const fyUtilisation = (fyExpenditure / fyAllocation) * 100
  const totalCertified = trainingProgress.reduce((s, t) => s + t.certified, 0)
  const totalTarget = trainingProgress.reduce((s, t) => s + t.target, 0)

  return (
    <PageContainer>
      <PageHeader
        title="Executive summary"
        description={`${project.name} · ${fy.label}`}
        actions={
          <Button asChild variant="outline" size="sm">
            <Link to="/dashboard/fund-utilisation">
              Fund utilisation <ArrowRight className="size-4" />
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard
          label="Approved project cost"
          value={formatCurrency(project.approvedCost, { compact: true })}
          hint={`RDPP revision ${project.currentRdppRevision}`}
          icon={Landmark}
        />
        <StatCard
          label="Cumulative expenditure"
          value={formatCurrency(project.cumulativeExpenditure, { compact: true })}
          trend={{ value: utilisation, label: 'of approved cost' }}
          icon={Banknote}
          tone="info"
        />
        <StatCard
          label={`${fy.label} expenditure`}
          value={formatCurrency(fyExpenditure, { compact: true })}
          hint={`Against ${formatCurrency(fyAllocation, { compact: true })} allocation`}
          icon={TrendingUp}
          tone={fyUtilisation >= 90 ? 'success' : 'warning'}
        />
        <StatCard
          label="Trainees certified"
          value={formatNumber(totalCertified)}
          trend={{ value: (totalCertified / totalTarget) * 100, label: 'of target' }}
          icon={Users}
          tone="success"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <ChartCard
          title="Allocation vs expenditure"
          description={`Monthly, ${fy.label} (BDT)`}
          className="xl:col-span-2"
          height={300}
        >
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={monthlyFlow} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="month" {...axisProps} />
              <YAxis {...axisProps} width={52} tickFormatter={(v: number) => compactNumber(v)} />
              <Tooltip
                {...tooltipStyle}
                formatter={((value: any, name: any) => [formatCurrency(Number(value)), name]) as any}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
              <Bar dataKey="allocation" name="Allocation" fill="var(--chart-2)" radius={[4, 4, 0, 0]} maxBarSize={26} />
              <Bar dataKey="expenditure" name="Expenditure" fill="var(--chart-1)" radius={[4, 4, 0, 0]} maxBarSize={26} />
              <Line
                dataKey="disbursement"
                name="Disbursement"
                type="monotone"
                stroke="var(--chart-3)"
                strokeWidth={2}
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Source of fund" description="Approved allocation by source" height={300}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={fundSplit}
                dataKey="value"
                nameKey="name"
                innerRadius="55%"
                outerRadius="82%"
                paddingAngle={2}
                stroke="var(--card)"
                strokeWidth={2}
              >
                {fundSplit.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip {...tooltipStyle} formatter={((value: any) => formatCurrency(Number(value))) as any} />
              <Legend
                iconType="circle"
                layout="horizontal"
                wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SectionCard
          title="Training delivery by sector"
          description="Certified against contracted target"
          contentClassName="space-y-4"
        >
          {trainingProgress.map((row) => {
            const pct = (row.certified / row.target) * 100
            return (
              <div key={row.sector} className="space-y-1.5">
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="min-w-0 truncate font-medium">{row.sector}</span>
                  <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                    {formatNumber(row.certified)} / {formatNumber(row.target)} · {formatPercent(pct, 0)}
                  </span>
                </div>
                <Progress value={pct} className="h-1.5" />
              </div>
            )
          })}
        </SectionCard>

        <SectionCard
          title="Needs attention"
          description="Open items across modules"
          contentClassName="divide-y"
        >
          {pendingTasks.map((task) => (
            <div key={task.id} className="flex items-start justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{task.title}</p>
                <p className="text-xs text-muted-foreground">
                  {task.module} · due {formatDate(task.due)}
                </p>
              </div>
              <StatusBadge
                status={task.priority}
                tone={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'warning' : 'neutral'}
              />
            </div>
          ))}
        </SectionCard>
      </div>

      <SectionCard
        title="Project portfolio"
        description="All projects under the programme"
        contentClassName="divide-y"
      >
        {projects.map((p) => {
          const pct = p.approvedCost ? (p.cumulativeExpenditure / p.approvedCost) * 100 : 0
          return (
            <Link
              key={p.id}
              to="/projects"
              className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:gap-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-medium">{p.shortName}</p>
                  <StatusBadge status={p.status} />
                </div>
                <p className="truncate text-xs text-muted-foreground">{p.code} · {p.implementingAgency}</p>
              </div>
              <div className="flex items-center gap-3 sm:w-72">
                <Progress value={pct} className="h-1.5 flex-1" />
                <span className="w-32 shrink-0 text-right text-xs text-muted-foreground tabular-nums">
                  {formatCurrency(p.cumulativeExpenditure, { compact: true })} · {formatPercent(pct, 0)}
                </span>
              </div>
            </Link>
          )
        })}
      </SectionCard>
    </PageContainer>
  )
}
