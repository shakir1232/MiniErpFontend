import { useMemo, useState, type ReactNode } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type VisibilityState,
} from '@tanstack/react-table'
import { ArrowUpDown, ChevronLeft, ChevronRight, Search, Settings2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { EmptyState } from '@/components/common/empty-state'
import { cn } from '@/lib/utils'

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends unknown, TValue> {
    /** Right-align numeric columns. */
    align?: 'left' | 'right' | 'center'
    /** Human label used by the column-visibility menu and mobile cards. */
    label?: string
    className?: string
    /** Keep out of the auto-generated mobile card. */
    hideOnMobile?: boolean
  }
}

export type DataTableProps<TData> = {
  columns: ColumnDef<TData, any>[]
  data: TData[]
  /** Placeholder for the built-in search box; pass `null` to hide search. */
  searchPlaceholder?: string | null
  toolbar?: ReactNode
  onRowClick?: (row: TData) => void
  /** Custom mobile card; omit to auto-derive from the first columns. */
  renderMobileCard?: (row: TData) => ReactNode
  pageSize?: number
  emptyTitle?: string
  emptyDescription?: string
  /** Sticky footer row, e.g. column totals. */
  footer?: ReactNode
  dense?: boolean
  className?: string
}

export function DataTable<TData>({
  columns,
  data,
  searchPlaceholder = 'Search…',
  toolbar,
  onRowClick,
  renderMobileCard,
  pageSize = 10,
  emptyTitle = 'Nothing to show',
  emptyDescription = 'Try adjusting your search or filters.',
  footer,
  dense = false,
  className,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter, columnVisibility },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize } },
    globalFilterFn: 'includesString',
  })

  const rows = table.getRowModel().rows
  const hideableColumns = table.getAllColumns().filter((c) => c.getCanHide())

  const mobileColumns = useMemo(
    () => table.getVisibleLeafColumns().filter((c) => !c.columnDef.meta?.hideOnMobile).slice(0, 5),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [columnVisibility, columns],
  )

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {searchPlaceholder !== null || toolbar || hideableColumns.length > 1 ? (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          {searchPlaceholder !== null ? (
            <div className="relative w-full sm:max-w-xs">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                placeholder={searchPlaceholder}
                className="pl-8"
                aria-label={searchPlaceholder}
              />
            </div>
          ) : (
            <div />
          )}
          <div className="flex flex-wrap items-center gap-2">
            {toolbar}
            {hideableColumns.length > 1 ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="hidden md:inline-flex">
                    <Settings2 className="size-4" />
                    Columns
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="max-h-80 w-52 overflow-y-auto">
                  <DropdownMenuLabel>Visible columns</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {hideableColumns.map((column) => (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      checked={column.getIsVisible()}
                      onCheckedChange={(v) => column.toggleVisibility(!!v)}
                      onSelect={(e) => e.preventDefault()}
                    >
                      {column.columnDef.meta?.label ?? column.id}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
          </div>
        </div>
      ) : null}

      {/* Desktop / tablet: real table */}
      <div className="hidden overflow-hidden rounded-lg border bg-card md:block">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent">
                  {headerGroup.headers.map((header) => {
                    const meta = header.column.columnDef.meta
                    const canSort = header.column.getCanSort()
                    return (
                      <TableHead
                        key={header.id}
                        className={cn(
                          'h-10 whitespace-nowrap text-xs font-semibold tracking-wide uppercase',
                          meta?.align === 'right' && 'text-right',
                          meta?.align === 'center' && 'text-center',
                          meta?.className,
                        )}
                      >
                        {header.isPlaceholder ? null : canSort ? (
                          <button
                            type="button"
                            onClick={header.column.getToggleSortingHandler()}
                            className={cn(
                              'inline-flex items-center gap-1 rounded-sm hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                              meta?.align === 'right' && 'flex-row-reverse',
                            )}
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            <ArrowUpDown className="size-3 opacity-50" aria-hidden />
                          </button>
                        ) : (
                          flexRender(header.column.columnDef.header, header.getContext())
                        )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={table.getVisibleLeafColumns().length} className="p-0">
                    <EmptyState title={emptyTitle} description={emptyDescription} />
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow
                    key={row.id}
                    onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                    className={cn(onRowClick && 'cursor-pointer')}
                  >
                    {row.getVisibleCells().map((cell) => {
                      const meta = cell.column.columnDef.meta
                      return (
                        <TableCell
                          key={cell.id}
                          className={cn(
                            dense ? 'py-1.5' : 'py-2.5',
                            meta?.align === 'right' && 'text-right tabular-nums',
                            meta?.align === 'center' && 'text-center',
                            meta?.className,
                          )}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        {footer ? <div className="border-t bg-muted/40 px-4 py-2 text-sm">{footer}</div> : null}
      </div>

      {/* Mobile: stacked cards, same data and ordering */}
      <div className="flex flex-col gap-2 md:hidden">
        {rows.length === 0 ? (
          <div className="rounded-lg border bg-card">
            <EmptyState title={emptyTitle} description={emptyDescription} />
          </div>
        ) : (
          rows.map((row) => {
            if (renderMobileCard) {
              return (
                <div
                  key={row.id}
                  onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                  className={cn('rounded-lg border bg-card p-3', onRowClick && 'cursor-pointer active:bg-accent/40')}
                >
                  {renderMobileCard(row.original)}
                </div>
              )
            }
            const cells = row.getVisibleCells().filter((c) => mobileColumns.some((mc) => mc.id === c.column.id))
            const [head, ...rest] = cells
            return (
              <div
                key={row.id}
                onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                className={cn('rounded-lg border bg-card p-3', onRowClick && 'cursor-pointer active:bg-accent/40')}
              >
                {head ? (
                  <div className="mb-2 text-sm font-medium">
                    {flexRender(head.column.columnDef.cell, head.getContext())}
                  </div>
                ) : null}
                <dl className="grid grid-cols-[minmax(0,auto)_1fr] gap-x-3 gap-y-1.5 text-sm">
                  {rest.map((cell) => (
                    <div key={cell.id} className="contents">
                      <dt className="text-xs text-muted-foreground">
                        {cell.column.columnDef.meta?.label ?? cell.column.id}
                      </dt>
                      <dd className="min-w-0 text-right">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            )
          })
        )}
        {footer ? <div className="rounded-lg border bg-muted/40 px-3 py-2 text-sm">{footer}</div> : null}
      </div>

      {table.getPageCount() > 1 ? (
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()} · {rows.length} of{' '}
            {table.getFilteredRowModel().rows.length} rows
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              aria-label="Previous page"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              aria-label="Next page"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
