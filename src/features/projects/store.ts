import { create } from 'zustand'
import { uid } from '@/lib/id'
import { dropById, patchById } from '@/lib/collection'
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
  updateBankAccount: (id: string, patch: Partial<ProjectBankAccount>) => void
  removeBankAccount: (id: string) => void

  addAgency: (agency: Omit<ImplementationAgency, 'id'>) => void
  updateAgency: (id: string, patch: Partial<ImplementationAgency>) => void
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
  updateProject: (id, patch) => set((s) => ({ projects: patchById(s.projects, id, patch) })),
  removeProject: (id) => set((s) => ({ projects: dropById(s.projects, id) })),

  addBankAccount: (account) =>
    set((s) => ({ bankAccounts: [{ ...account, id: uid('pba') }, ...s.bankAccounts] })),
  updateBankAccount: (id, patch) => set((s) => ({ bankAccounts: patchById(s.bankAccounts, id, patch) })),
  removeBankAccount: (id) => set((s) => ({ bankAccounts: dropById(s.bankAccounts, id) })),

  addAgency: (agency) => set((s) => ({ agencies: [{ ...agency, id: uid('ia') }, ...s.agencies] })),
  updateAgency: (id, patch) => set((s) => ({ agencies: patchById(s.agencies, id, patch) })),
  removeAgency: (id) => set((s) => ({ agencies: dropById(s.agencies, id) })),

  updateOrganization: (patch) => set((s) => ({ organization: { ...s.organization, ...patch } })),
}))
