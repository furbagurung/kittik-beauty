"use client";

import { cn } from "@/lib/utils";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type ColumnDef,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { useState } from "react";

type Props<TData> = {
  data: TData[];
  columns: ColumnDef<TData, unknown>[];
  loading?: boolean;
  emptyLabel?: string;
  getRowHref?: (row: TData) => string | undefined;
  onRowClick?: (row: TData) => void;
  skeletonRows?: number;
  className?: string;
};

export default function DataTable<TData>({
  data,
  columns,
  loading,
  emptyLabel = "No records",
  getRowHref,
  onRowClick,
  skeletonRows = 5,
  className,
}: Props<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);

  // TanStack Table exposes mutable helpers here; keep lint scoped to this call.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div
      className={cn(
        "surface-shadow overflow-hidden rounded-xl border border-hairline bg-card",
        className,
      )}
    >
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            {table.getHeaderGroups().map((group) => (
              <tr key={group.id} className="border-b border-hairline bg-secondary/70">
                {group.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sorted = header.column.getIsSorted();

                  return (
                    <th
                      key={header.id}
                      scope="col"
                      className={cn(
                        "h-11 px-4 text-left font-mono text-[0.67rem] font-medium uppercase tracking-[0.12em] text-muted-foreground",
                        canSort && "cursor-pointer select-none",
                      )}
                      onClick={
                        canSort
                          ? header.column.getToggleSortingHandler()
                          : undefined
                      }
                    >
                      <span className="inline-flex items-center gap-1.5">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                        {canSort ? (
                          sorted === "asc" ? (
                            <ArrowUp className="size-3 text-primary" />
                          ) : sorted === "desc" ? (
                            <ArrowDown className="size-3 text-primary" />
                          ) : (
                            <ChevronsUpDown className="size-3 opacity-40" />
                          )
                        ) : null}
                      </span>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: skeletonRows }).map((_, index) => (
                <tr key={index} className="border-b border-hairline/70 last:border-b-0">
                  {table.getAllLeafColumns().map((column) => (
                    <td key={column.id} className="px-4 py-3.5">
                      <div
                        className="h-3.5 w-2/3 animate-pulse rounded-full bg-muted"
                        style={{ animationDelay: `${index * 60}ms` }}
                      />
                    </td>
                  ))}
                </tr>
              ))
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => {
                const href = getRowHref?.(row.original);
                const clickable = Boolean(href || onRowClick);

                return (
                  <tr
                    key={row.id}
                    className={cn(
                      "group/row border-b border-hairline/70 transition-colors last:border-b-0",
                      clickable &&
                        "cursor-pointer hover:bg-[color:color-mix(in_oklab,var(--primary)_8%,var(--card))]",
                    )}
                    onClick={() => {
                      if (href) {
                        window.location.href = href;
                      } else {
                        onRowClick?.(row.original);
                      }
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="px-4 py-3.5 align-middle text-foreground"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-6 py-14 text-center">
                  <div className="mx-auto flex max-w-sm flex-col items-center gap-2">
                    <div className="kicker">No results</div>
                    <div className="text-sm text-muted-foreground">{emptyLabel}</div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
