"use client";

import DataTable from "@/components/shared/DataTable";
import Notice from "@/components/shared/Notice";
import PageHeader from "@/components/shared/PageHeader";
import { OrderStatusPill } from "@/components/shared/StatusPill";
import { getOrders, type AdminApiOrder } from "@/lib/api";
import { formatCurrency, formatRelativeTime } from "@/lib/format";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export default function OrdersPage() {
  const [orders, setOrders] = useState<AdminApiOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function loadOrders() {
      try {
        const data = await getOrders();
        if (!cancelled) setOrders(data);
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(
            error instanceof Error ? error.message : "Failed to load orders.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadOrders();
    return () => {
      cancelled = true;
    };
  }, []);

  const columns = useMemo<ColumnDef<AdminApiOrder, unknown>[]>(
    () => [
      {
        accessorKey: "id",
        header: "Order",
        cell: ({ row }) => (
          <span className="font-mono text-[0.78rem] text-foreground">
            #{String(row.original.id).padStart(5, "0")}
          </span>
        ),
      },
      {
        accessorKey: "fullName",
        header: "Customer",
        cell: ({ row }) => (
          <div className="min-w-0">
            <div className="truncate text-sm font-medium text-foreground">
              {row.original.fullName}
            </div>
            <div className="truncate text-xs text-muted-foreground">
              {row.original.phone}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "totalItems",
        header: "Items",
        cell: ({ row }) => (
          <span className="font-mono tabular text-muted-foreground">
            {row.original.totalItems}
          </span>
        ),
      },
      {
        accessorKey: "total",
        header: "Total",
        cell: ({ row }) => (
          <span className="font-mono tabular text-foreground">
            {formatCurrency(row.original.total)}
          </span>
        ),
      },
      {
        accessorKey: "paymentMethod",
        header: "Payment",
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground">
            {row.original.paymentMethod}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <OrderStatusPill status={row.original.status} />,
      },
      {
        accessorKey: "createdAt",
        header: "Placed",
        cell: ({ row }) => (
          <span className="font-mono text-[0.72rem] text-muted-foreground">
            {formatRelativeTime(row.original.createdAt)}
          </span>
        ),
      },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        cell: () => (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground opacity-0 transition-opacity group-hover/row:opacity-100">
            Open
            <ArrowUpRight className="size-3" strokeWidth={2} />
          </span>
        ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-5">
      <PageHeader
        kicker="Operations"
        title="Orders"
        description="Track order flow, payments, and fulfillment status."
      />

      {errorMessage ? <Notice tone="warn" message={errorMessage} /> : null}

      <DataTable
        data={orders}
        columns={columns}
        loading={loading}
        emptyLabel="No orders yet. They will appear here as customers check out."
        getRowHref={(row) => `/orders/${row.id}`}
      />
    </div>
  );
}
