import { useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Lock, ShieldCheck, Users as UsersIcon } from 'lucide-react'
import { toast } from 'sonner'
import { MasterPage } from '@/components/common/master-page'
import { PageContainer } from '@/components/common/page-container'
import { PageHeader } from '@/components/common/page-header'
import { SectionCard } from '@/components/common/section-card'
import { StatCard } from '@/components/common/stat-card'
import { StatusBadge } from '@/components/common/status-badge'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { MODULES, MODULE_MAP, type ModuleKey } from '@/config/navigation'
import { formatDateTime, formatNumber } from '@/lib/format'
import { useRoleLookup, useUserStore } from '../store'
import type { AppRole, AppUser } from '../types'

export function UsersPage() {
  const users = useUserStore((s) => s.users)
  const roles = useUserStore((s) => s.roles)
  const addUser = useUserStore((s) => s.addUser)
  const roleById = useRoleLookup()

  const stats = useMemo(
    () => ({
      total: users.length,
      active: users.filter((u) => u.status === 'active').length,
      locked: users.filter((u) => u.status === 'locked').length,
    }),
    [users],
  )

  const columns = useMemo<ColumnDef<AppUser, any>[]>(
    () => [
      {
        accessorKey: 'fullName',
        header: 'User',
        meta: { label: 'User' },
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="truncate font-medium">{row.original.fullName}</p>
            <p className="truncate text-xs text-muted-foreground">
              {row.original.username} · {row.original.email}
            </p>
          </div>
        ),
      },
      { accessorKey: 'designation', header: 'Designation', meta: { label: 'Designation' } },
      {
        id: 'role',
        header: 'Role',
        meta: { label: 'Role' },
        accessorFn: (row) => roleById[row.roleId]?.name ?? '—',
        cell: ({ row }) => <Badge variant="secondary">{roleById[row.original.roleId]?.name ?? '—'}</Badge>,
      },
      {
        accessorKey: 'employeeCode',
        header: 'Employee code',
        meta: { label: 'Employee code', className: 'font-mono text-xs', hideOnMobile: true },
      },
      {
        accessorKey: 'lastLogin',
        header: 'Last login',
        meta: { align: 'right', label: 'Last login', hideOnMobile: true },
        cell: ({ getValue }) => formatDateTime(getValue<string>()),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        meta: { align: 'center', label: 'Status' },
        cell: ({ getValue }) => <StatusBadge status={getValue<string>()} tone={getValue<string>() === 'locked' ? 'destructive' : undefined} />,
      },
    ],
    [roleById],
  )

  return (
    <MasterPage
      title="Users"
      description="Accounts that can sign in to the ERP"
      addLabel="Add user"
      searchPlaceholder="Search name, username or email…"
      columns={columns}
      data={users}
      pageSize={12}
      stats={
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <StatCard label="Users" value={formatNumber(stats.total)} icon={UsersIcon} />
          <StatCard label="Active" value={formatNumber(stats.active)} tone="success" />
          <StatCard label="Locked" value={formatNumber(stats.locked)} icon={Lock} tone="destructive" />
        </div>
      }
      fields={[
        { name: 'fullName', label: 'Full name', required: true, span: true },
        { name: 'username', label: 'Username', required: true },
        { name: 'email', label: 'Email', required: true },
        { name: 'designation', label: 'Designation' },
        { name: 'employeeCode', label: 'Employee code' },
        {
          name: 'roleId',
          label: 'Role',
          type: 'select',
          required: true,
          span: true,
          options: roles.map((r) => ({ value: r.id, label: r.name })),
        },
      ]}
      onCreate={(v) =>
        addUser({
          username: v.username,
          fullName: v.fullName,
          email: v.email,
          designation: v.designation || '—',
          roleId: v.roleId,
          employeeCode: v.employeeCode || '—',
          lastLogin: new Date().toISOString(),
          status: 'active',
        })
      }
    />
  )
}

export function RolesPage() {
  const roles = useUserStore((s) => s.roles)
  const addRole = useUserStore((s) => s.addRole)

  const columns = useMemo<ColumnDef<AppRole, any>[]>(
    () => [
      { accessorKey: 'code', header: 'Code', meta: { label: 'Code', className: 'font-mono text-xs' } },
      {
        accessorKey: 'name',
        header: 'Role',
        meta: { label: 'Role' },
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="truncate font-medium">{row.original.name}</p>
            <p className="truncate text-xs text-muted-foreground">{row.original.description}</p>
          </div>
        ),
      },
      {
        id: 'modules',
        header: 'Modules',
        meta: { label: 'Modules' },
        accessorFn: (row) => row.modules.length,
        cell: ({ row }) => (
          <div className="flex max-w-sm flex-wrap gap-1">
            {row.original.modules.slice(0, 4).map((key) => (
              <Badge key={key} variant="outline" className="text-[10px]">
                {MODULE_MAP[key]?.short ?? key}
              </Badge>
            ))}
            {row.original.modules.length > 4 ? (
              <Badge variant="secondary" className="text-[10px]">
                +{row.original.modules.length - 4}
              </Badge>
            ) : null}
          </div>
        ),
      },
      {
        accessorKey: 'userCount',
        header: 'Users',
        meta: { align: 'right', label: 'Users' },
        cell: ({ getValue }) => formatNumber(getValue<number>()),
      },
      {
        id: 'system',
        header: 'Type',
        meta: { align: 'center', label: 'Type' },
        accessorFn: (row) => (row.system ? 'system' : 'custom'),
        cell: ({ getValue }) => <Badge variant={getValue<string>() === 'system' ? 'default' : 'secondary'}>{getValue<string>()}</Badge>,
      },
    ],
    [],
  )

  return (
    <MasterPage
      title="Roles"
      description="Permission sets assigned to users"
      addLabel="Add role"
      searchPlaceholder="Search role…"
      columns={columns}
      data={roles}
      fields={[
        { name: 'code', label: 'Role code', required: true },
        { name: 'name', label: 'Role name', required: true },
        { name: 'description', label: 'Description', type: 'textarea', span: true },
      ]}
      onCreate={(v) =>
        addRole({
          code: v.code,
          name: v.name,
          description: v.description,
          modules: ['dashboard'],
          userCount: 0,
          system: false,
        })
      }
    />
  )
}

export function MenuPermissionsPage() {
  const permissions = useUserStore((s) => s.permissions)
  const roles = useUserStore((s) => s.roles)
  const togglePermission = useUserStore((s) => s.togglePermission)
  const [roleId, setRoleId] = useState(roles[2].id)
  const [moduleKey, setModuleKey] = useState<ModuleKey>('accounting')

  const rows = useMemo(() => permissions.filter((p) => p.moduleKey === moduleKey), [permissions, moduleKey])
  const role = roles.find((r) => r.id === roleId)
  const roleHasModule = role?.modules.includes(moduleKey) ?? false

  return (
    <PageContainer>
      <PageHeader
        title="Menu permissions"
        description="Screen-level view, create, edit and approve rights for each role"
        actions={
          <>
            <Select value={roleId} onValueChange={setRoleId}>
              <SelectTrigger size="sm" className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {roles.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={moduleKey} onValueChange={(v) => setModuleKey(v as ModuleKey)}>
              <SelectTrigger size="sm" className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MODULES.map((m) => (
                  <SelectItem key={m.key} value={m.key}>
                    {m.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        }
      />

      {!roleHasModule ? (
        <div className="rounded-lg border border-warning/30 bg-warning/8 px-4 py-3 text-sm text-warning">
          <ShieldCheck className="mr-2 inline size-4" />
          {role?.name} does not currently have access to {MODULE_MAP[moduleKey].title}. Screen rights below are
          inactive until the module is granted.
        </div>
      ) : null}

      <SectionCard
        title={`${MODULE_MAP[moduleKey].title} screens`}
        description={`Rights applied to the ${role?.name ?? ''} role`}
        contentClassName="p-0"
      >
        <div className="overflow-hidden rounded-lg border">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="text-xs uppercase">Screen</TableHead>
                  <TableHead className="text-center text-xs uppercase">View</TableHead>
                  <TableHead className="text-center text-xs uppercase">Create</TableHead>
                  <TableHead className="text-center text-xs uppercase">Edit</TableHead>
                  <TableHead className="text-center text-xs uppercase">Approve</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((permission) => (
                  <TableRow key={permission.path}>
                    <TableCell>
                      <p className="font-medium">{permission.screen}</p>
                      <p className="font-mono text-xs text-muted-foreground">{permission.path}</p>
                    </TableCell>
                    {(['view', 'create', 'edit', 'approve'] as const).map((field) => (
                      <TableCell key={field} className="text-center">
                        <Checkbox
                          checked={permission[field]}
                          disabled={!roleHasModule}
                          aria-label={`${field} ${permission.screen}`}
                          onCheckedChange={() => {
                            togglePermission(permission.path, field)
                            toast.success(`${permission.screen}: ${field} ${permission[field] ? 'revoked' : 'granted'}.`)
                          }}
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </SectionCard>
    </PageContainer>
  )
}
