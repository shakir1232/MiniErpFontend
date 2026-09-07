# SEIP MiniERP — Frontend Prototype

React prototype for the revamped SEIP MiniERP. **No backend** — every module is
driven by typed dummy data and Zustand stores held in memory.

## Stack

| Concern | Choice |
| --- | --- |
| Build | Vite 8 + React 19 + TypeScript |
| Routing | React Router (SPA) |
| Styling | Tailwind CSS v4 (CSS-first tokens) |
| Components | shadcn/ui (new-york) on Radix primitives |
| State | Zustand (global + per-feature stores) |
| Tables | TanStack Table v8 |
| Charts | Recharts |
| Icons | lucide-react |
| Toasts | sonner |

## Commands

```bash
npm install
npm run dev        # dev server
npm run build      # typecheck + production build
npm run preview    # serve the build
npm run lint
```

## Architecture

```
src/
  app/            router, auth guard, root providers
  components/
    ui/           shadcn primitives (generated, rarely edited)
    layout/       app shell — module rail, module nav, topbar, command palette
    common/       cross-module building blocks (DataTable, PageHeader, StatCard, …)
  config/         navigation registry, fiscal-year reference
  features/
    <module>/
      data/       dummy data for that module
      pages/      route-level screens
      components/ module-only components
      store.ts    Zustand slice for that module
      types.ts    domain types
  hooks/          shared hooks
  lib/            formatters, chart theme, helpers
  stores/         global stores (ui, auth, app scope)
```

### Navigation is data

`src/config/navigation.ts` is the single source of truth for modules, sections and
routes. The sidebar, mobile drawer, breadcrumbs, command palette and the router all
read from it. Screens not yet implemented render a placeholder, so no menu item
dead-ends. To implement a screen, add its route to `IMPLEMENTED` in
`src/app/routes.tsx`.

### Responsive strategy

- `< md` — icon rail and module menu collapse into a sheet drawer; `DataTable`
  swaps the table for stacked cards carrying the same columns.
- `md – lg` — icon rail + module menu, menu collapsible from the topbar.
- `≥ lg` — full shell with global search and fiscal-year switcher.

### Theming

Light/dark tokens live in `src/index.css` as OKLCH custom properties. `useThemeEffect`
applies the resolved theme; charts read the same tokens via `src/lib/chart.ts`.

## Demo accounts

Password is ignored. Role changes which modules appear.

| Email | Role |
| --- | --- |
| admin@seip.gov.bd | Administrator (all modules) |
| accounts@seip.gov.bd | Accounts |
| hr@seip.gov.bd | HR |

## Module status

| Module | State |
| --- | --- |
| Dashboard | Built |
| Project | Built |
| Budget | Navigation mapped, screens pending |
| Accounting | Navigation mapped, screens pending |
| Payroll | Navigation mapped, screens pending |
| HR Management | Navigation mapped, screens pending |
| Asset Management | Navigation mapped, screens pending |
| Consumer Item | Navigation mapped, screens pending |
| Letter Tracking | Navigation mapped, screens pending |
| Settings | Navigation mapped, screens pending |
| User Management | Navigation mapped, screens pending |
