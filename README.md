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

Every entry in the navigation registry has a real screen — 104 of 104.

| Module | Screens | Highlights |
| --- | --- | --- |
| Dashboard | 3 | Executive summary, fund utilisation, activity feed |
| Project | 2 (+ detail route) | Portfolio, project detail tabs, organization letterhead |
| Budget | 26 | DPP/RDPP setup, yearly and code-wise views, tranche allocation and mapping, expenditure entry, variance and IMED reports |
| Accounting | 21 | Chart of accounts tree, debit/credit/journal vouchers, registers, trial balance, SOE, FAPAD, financial statement |
| Payroll | 20 | Salary structures, contracts, adjustments, run processing, challans, eight statements |
| HR Management | 4 | Employees, designations and groups |
| Asset Management | 7 | Suppliers, categories, locations, challans, assignment, transfer, fixed asset register |
| Consumer Item | 6 | Item master, receive/issue that move stock, register and stock position |
| Letter Tracking | 6 | Dashboard, register, entry, dispatch, memos, movement history |
| Settings | 13 | Agencies, funds, ministries, banks, currencies, signatures |
| User Management | 3 | Users, roles, screen-level permission matrix |

## Conventions

- **Dummy data** lives in `src/features/<module>/data/` and is deterministic — generated
  from index arithmetic so every reload shows the same records.
- **Stores** seed from that data and support create/update so the prototype feels live.
  Nothing persists across a hard reload except UI preferences, auth and scope.
- **Zustand selectors** must return stable references. Derived arrays and lookup maps go
  through `useMemo` (see `useEmployeeLookup`, `useRunLines`) rather than being computed
  inside the selector.
- **Reports** use `ReportShell` for the letterhead, filters and print/export actions.
  Print CSS hides the shell so a report prints as a document.
- **Reference-data screens** use `MasterPage` — pass columns, a field spec and an
  `onCreate` handler.
