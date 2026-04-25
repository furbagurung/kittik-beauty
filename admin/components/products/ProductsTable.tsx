"use client";
/* eslint-disable @next/next/no-img-element */

import DataTable from "@/components/shared/DataTable";
import StatusPill, {
  stockLabel,
  toneForStock,
} from "@/components/shared/StatusPill";
import type { AdminApiProduct } from "@/lib/api";
import { formatCurrency, formatNumber } from "@/lib/format";
import { getAdminProductCategoryName } from "@/lib/product-category";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpRight } from "lucide-react";
import { useMemo } from "react";

export default function ProductsTable({
  products,
}: {
  products: AdminApiProduct[];
}) {
  const columns = useMemo<ColumnDef<AdminApiProduct, unknown>[]>(
    () => [
      {
        accessorKey: "id",
        header: "ID",
        cell: ({ row }) => (
          <span className="font-mono text-[0.78rem] text-muted-foreground">
            #{String(row.original.id).padStart(4, "0")}
          </span>
        ),
      },
      {
        accessorKey: "name",
        header: "Product",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-hairline bg-secondary">
              {row.original.image ? (
                <img
                  src={row.original.image}
                  alt=""
                  className="size-full object-cover"
                />
              ) : (
                <span className="font-mono text-[0.62rem] text-muted-foreground">
                  --
                </span>
              )}
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-medium text-foreground">
                {row.original.name}
              </div>
              <div className="truncate text-xs text-muted-foreground">
                {getAdminProductCategoryName(row.original.category)}
              </div>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "price",
        header: "Price",
        cell: ({ row }) => (
          <span className="font-mono tabular">
            {formatCurrency(row.original.price)}
          </span>
        ),
      },
      {
        accessorKey: "stock",
        header: "Stock",
        cell: ({ row }) => {
          const stock = row.original.stock ?? 0;
          return (
            <span
              className={`font-mono tabular ${
                stock === 0
                  ? "text-[color:var(--destructive)]"
                  : stock <= 5
                    ? "text-[color:var(--warn)]"
                    : "text-foreground"
              }`}
            >
              {formatNumber(stock)}
            </span>
          );
        },
      },
      {
        id: "status",
        header: "Status",
        enableSorting: false,
        cell: ({ row }) => {
          const stock = row.original.stock ?? 0;
          return (
            <StatusPill label={stockLabel(stock)} tone={toneForStock(stock)} />
          );
        },
      },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        cell: () => (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground opacity-0 transition-opacity group-hover/row:opacity-100">
            Edit
            <ArrowUpRight className="size-3" strokeWidth={2} />
          </span>
        ),
      },
    ],
    [],
  );

  return (
    <DataTable
      data={products}
      columns={columns}
      getRowHref={(row) => `/products/${row.id}`}
      emptyLabel="No products in the catalog yet."
    />
  );
}
