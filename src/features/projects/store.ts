import { create } from 'zustand'
import { uid } from '@/lib/id'
import {
  implementationAgencies as seedAgencies,
  organizationInfo as seedOrg,
  projectBankAccounts as seedAccounts,
  projectDirectors as seedDirectors,
  projectSourcesOfFund as seedSources,
  projects as seedProjects,
} from './data/projects'
import type {
  ImplementationAgency,
  OrganizationInfo,
  Project,
  ProjectBankAccount,
  ProjectDirector,
  ProjectSourceOfFund,
} from './types'

type ProjectState = {
  projects: Project[]
  directors: ProjectDirector[]
  bankAccounts: ProjectBankAccount[]
  sourcesOfFund: ProjectSourceOfFund[]
  agencies: ImplementationAgency[]
  organization: OrganizationInfo

  addProject: (project: Omit<Project, 'id'>) => Project
  updateProject: (id: string, patch: Partial<Project>) => void
  removeProject: (id: string) => void

  addBankAccount: (account: Omit<ProjectBankAccount, 'id'>) => void
  removeBankAccount: (id: string) => void

  addAgency: (agency: Omit<ImplementationAgency, 'id'>) => void
  removeAgency: (id: string) => void

  updateOrganization: (patch: Partial<OrganizationInfo>) => void
}

export const useProjectStore = create<ProjectState>()((set) => ({
  projects: seedProjects,
  directors: seedDirectors,
  bankAccounts: seedAccounts,
  sourcesOfFund: seedSources,
  agencies: seedAgencies,
  organization: seedOrg,

  addProject: (project) => {
    const created: Project = { ...project, id: uid('prj') }
    set((s) => ({ projects: [created, ...s.projects] }))
    return created
  },
  updateProject: (id, patch) =>
    set((s) => ({ projects: s.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)) })),
  removeProject: (id) => set((s) => ({ projects: s.projects.filter((p) => p.id !== id) })),

  addBankAccount: (account) =>
    set((s) => ({ bankAccounts: [{ ...account, id: uid('pba') }, ...s.bankAccounts] })),
  removeBankAccount: (id) => set((s) => ({ bankAccounts: s.bankAccounts.filter((a) => a.id !== id) })),

  addAgency: (agency) => set((s) => ({ agencies: [{ ...agency, id: uid('ia') }, ...s.agencies] })),
  removeAgency: (id) => set((s) => ({ agencies: s.agencies.filter((a) => a.id !== id) })),

  updateOrganization: (patch) => set((s) => ({ organization: { ...s.organization, ...patch } })),
}))
