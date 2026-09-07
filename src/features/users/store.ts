import { useMemo } from 'react'
import { create } from 'zustand'
import { uid } from '@/lib/id'
import { dropById, patchById } from '@/lib/collection'
import { appUsers as seedUsers, menuPermissions as seedPermissions, roles as seedRoles } from './data/users'
import type { AppRole, AppUser, MenuPermission } from './types'

type UserState = {
  users: AppUser[]
  roles: AppRole[]
  permissions: MenuPermission[]

  addUser: (user: Omit<AppUser, 'id'>) => void
  updateUser: (id: string, patch: Partial<AppUser>) => void
  removeUser: (id: string) => void
  setUserStatus: (id: string, status: AppUser['status']) => void

  addRole: (role: Omit<AppRole, 'id'>) => void
  updateRole: (id: string, patch: Partial<AppRole>) => void
  removeRole: (id: string) => void
  togglePermission: (path: string, field: keyof Pick<MenuPermission, 'view' | 'create' | 'edit' | 'approve'>) => void
}

export const useUserStore = create<UserState>()((set) => ({
  users: seedUsers,
  roles: seedRoles,
  permissions: seedPermissions,

  addUser: (user) => set((s) => ({ users: [{ ...user, id: uid('usr') }, ...s.users] })),
  updateUser: (id, patch) => set((s) => ({ users: patchById(s.users, id, patch) })),
  removeUser: (id) => set((s) => ({ users: dropById(s.users, id) })),
  setUserStatus: (id, status) => set((s) => ({ users: patchById(s.users, id, { status }) })),

  addRole: (role) => set((s) => ({ roles: [...s.roles, { ...role, id: uid('role') }] })),
  updateRole: (id, patch) => set((s) => ({ roles: patchById(s.roles, id, patch) })),
  removeRole: (id) => set((s) => ({ roles: dropById(s.roles, id) })),
  togglePermission: (path, field) =>
    set((s) => ({
      permissions: s.permissions.map((p) => (p.path === path ? { ...p, [field]: !p[field] } : p)),
    })),
}))

export function useRoleLookup() {
  const roles = useUserStore((s) => s.roles)
  return useMemo(() => Object.fromEntries(roles.map((r) => [r.id, r])), [roles])
}
