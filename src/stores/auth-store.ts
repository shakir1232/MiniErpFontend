import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ModuleKey } from '@/config/navigation'

export type Role = 'admin' | 'accounts' | 'hr' | 'viewer'

export type SessionUser = {
  id: string
  name: string
  email: string
  designation: string
  role: Role
  avatarUrl?: string
}

/** Prototype credentials — no backend, any of these sign in with password `demo1234`. */
export const DEMO_USERS: SessionUser[] = [
  {
    id: 'u-01',
    name: 'Md. Hafijur Rahman',
    email: 'admin@seip.gov.bd',
    designation: 'System Administrator',
    role: 'admin',
  },
  {
    id: 'u-02',
    name: 'Farhana Akter',
    email: 'accounts@seip.gov.bd',
    designation: 'Assistant Director (Finance)',
    role: 'accounts',
  },
  {
    id: 'u-03',
    name: 'Tanvir Hossain',
    email: 'hr@seip.gov.bd',
    designation: 'HR Officer',
    role: 'hr',
  },
]

const ROLE_MODULES: Record<Role, ModuleKey[] | 'all'> = {
  admin: 'all',
  accounts: ['dashboard', 'projects', 'budget', 'accounting', 'payroll', 'settings'],
  hr: ['dashboard', 'hr', 'payroll', 'letters'],
  viewer: ['dashboard', 'projects', 'budget'],
}

type AuthState = {
  user: SessionUser | null
  signIn: (email: string) => SessionUser | null
  signOut: () => void
  switchRole: (role: Role) => void
  can: (module: ModuleKey) => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: DEMO_USERS[0],
      signIn: (email) => {
        const found = DEMO_USERS.find((u) => u.email.toLowerCase() === email.trim().toLowerCase()) ?? null
        if (found) set({ user: found })
        return found
      },
      signOut: () => set({ user: null }),
      switchRole: (role) => set((s) => (s.user ? { user: { ...s.user, role } } : s)),
      can: (module) => {
        const user = get().user
        if (!user) return false
        const allowed = ROLE_MODULES[user.role]
        return allowed === 'all' || allowed.includes(module)
      },
    }),
    { name: 'minierp.auth' },
  ),
)
