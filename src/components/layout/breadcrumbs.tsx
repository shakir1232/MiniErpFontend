import { Link, useLocation } from 'react-router-dom'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { findModuleByPath, findNavItemByPath } from '@/config/navigation'

export function Breadcrumbs() {
  const { pathname } = useLocation()
  const module = findModuleByPath(pathname)
  const match = findNavItemByPath(pathname)

  if (!module) return null

  return (
    <Breadcrumb className="min-w-0">
      <BreadcrumbList className="flex-nowrap">
        <BreadcrumbItem className="hidden sm:block">
          <BreadcrumbLink asChild>
            <Link to="/dashboard">Home</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator className="hidden sm:block" />
        <BreadcrumbItem className={match ? 'hidden sm:flex' : undefined}>
          {match ? (
            <BreadcrumbLink asChild>
              <Link to={module.basePath} className="truncate">
                {module.title}
              </Link>
            </BreadcrumbLink>
          ) : (
            <BreadcrumbPage className="truncate">{module.title}</BreadcrumbPage>
          )}
        </BreadcrumbItem>
        {match ? (
          <>
            <BreadcrumbSeparator className="hidden sm:block" />
            <BreadcrumbItem className="min-w-0">
              <BreadcrumbPage className="truncate">{match.item.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        ) : null}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
