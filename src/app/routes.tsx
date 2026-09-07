import type { ReactElement } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/components/layout/app-shell'
import { PlaceholderPage } from '@/components/common/placeholder-page'
import { ALL_NAV_ITEMS } from '@/config/navigation'
import { RequireAuth } from './require-auth'

import { DashboardPage } from '@/features/dashboard/pages/dashboard-page'
import { FundUtilisationPage } from '@/features/dashboard/pages/fund-utilisation-page'
import { ActivityPage } from '@/features/dashboard/pages/activity-page'
import { ProjectsPage } from '@/features/projects/pages/projects-page'
import { ProjectDetailPage } from '@/features/projects/pages/project-detail-page'
import { OrganizationPage } from '@/features/projects/pages/organization-page'
import { SignInPage } from '@/features/auth/pages/sign-in-page'
import { ProfilePage } from '@/features/misc/pages/profile-page'
import { NotFoundPage } from '@/features/misc/pages/not-found-page'

/**
 * Screens that are actually built. Anything else declared in the navigation
 * registry falls back to a placeholder so no menu entry dead-ends.
 */
const IMPLEMENTED: Record<string, ReactElement> = {
  '/dashboard': <DashboardPage />,
  '/dashboard/fund-utilisation': <FundUtilisationPage />,
  '/dashboard/activity': <ActivityPage />,
  '/projects': <ProjectsPage />,
  '/projects/organization': <OrganizationPage />,
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/sign-in" element={<SignInPage />} />
      <Route
        element={
          <RequireAuth>
            <AppShell />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        {ALL_NAV_ITEMS.map((item) => (
          <Route key={item.to} path={item.to} element={IMPLEMENTED[item.to] ?? <PlaceholderPage />} />
        ))}
        <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
