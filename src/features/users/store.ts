import { useMemo } from 'react'
import { create } from 'zustand'
import { uid } from '@/lib/id'
import { appUsers as seedUsers, menuPermissions as seedPermissions, roles as seedRoles } from './data/users'
import type { AppRole, AppUser, MenuPermission } from './types'

type UserState = {
  users: AppUser[]
  roles: AppRole[]
  permissions: MenuPermission[]

  addUser: (user: Omit<AppUser, 'id'>) => void
  setUserStatus: (id: string, status: AppUser['status']) => void
  addRole: (role: Omit<AppRole, 'id'>) => void
  togglePermission: (path: string, field: keyof Pick<MenuPermission, 'view' | 'create' | 'edit' | 'approve'>) => void
}

export const useUserStore = create<UserState>()((set) => ({
  users: seedUsers,
  roles: seedRoles,
  permissions: seedPermissions,

  addUser: (user) => set((s) => ({ users: [{ ...user, id: uid('usr') }, ...s.users] })),
  setUserStatus: (id, status) => set((s) => ({ users: s.users.map((u) => (u.id === id ? { ...u, status } : u)) })),
  addRole: (role) => set((s) => ({ roles: [...s.roles, { ...role, id: uid('role') }] })),
  togglePermission: (path, field) =>
    set((s) => ({
      permissions: s.permissions.map((p) => (p.path === path ? { ...p, [field]: !p[field] } : p)),
    })),
}))

export function useRoleLookup() {
  const roles = useUserStore((s) => s.roles)
  return useMemo(() => Object.fromEntries(roles.map((r) => [r.id, r])), [roles])
}
