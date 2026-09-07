import type { ModuleKey } from '@/config/navigation'

export type AppRole = {
  id: string
  name: string
  code: string
  description: string
  /** Modules this role may open. */
  modules: ModuleKey[]
  userCount: number
  system: boolean
}

export type AppUser = {
  id: string
  username: string
  fullName: string
  email: string
  designation: string
  roleId: string
  employeeCode: string
  lastLogin: string
  status: 'active' | 'inactive' | 'locked'
}

export type MenuPermission = {
  moduleKey: ModuleKey
  screen: string
  path: string
  view: boolean
  create: boolean
  edit: boolean
  approve: boolean
}
