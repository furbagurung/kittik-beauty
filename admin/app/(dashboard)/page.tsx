"use client";

import ActivityFeed, {
  type ActivityItem,
} from "@/components/shared/ActivityFeed";
import DataTable from "@/components/shared/DataTable";
import MetricCard from "@/components/shared/MetricCard";
import Notice from "@/components/shared/Notice";
import PageHeader from "@/components/shared/PageHeader";
import SectionCard from "@/components/shared/SectionCard";
import { OrderStatusPill } from "@/components/shared/StatusPill";
import { Button } from "@/components/ui/button";
import {
  getAdminStats,
  getProducts,
  getRecentOrders,
  type AdminApiProduct,
  type AdminDashboardStats,
  type AdminRecentOrder,
} from "@/lib/api";
import { API_BASE_URL } from "@/lib/api-config";
import {
  formatCompactCurrency,
  formatNumber,
  formatRelativeTime,
  formatShortDate,
} from "@/lib/format";
import type { ColumnDef } from "@tanstack/react-table";
import {
  AlertTriangle,
  ArrowUpRight,
  Package,
  Plus,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

function seededTrend(seed: number, length = 20): number[] {
  let value = seed;
  const output: number[] = [];

  for (let index = 0; index < length; index += 1) {
    value = (value * 9301 + 49297) % 233280;
    const noise = value / 233280;
    const base = 50 + Math.sin(index * 0.6) * 18 + noise * 24;
    output.push(Math.max(10, base));
  }

  return output;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<AdminRecentOrder[]>([]);
  const [products, setProducts] = useState<AdminApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [today, setToday] = useState<Date | null>(null);

  useEffect(() => {
    setToday(new Date());

    async function load() {
      try {
        const [nextStats, nextOrders, nextProducts] = await Promise.all([
          getAdminStats(),
          getRecentOrders(),
          getProducts().catch(() => []),
        ]);
        setStats(nextStats);
        setRecentOrders(nextOrders);
        setProducts(nextProducts);
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Failed to load dashboard.",
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const todayKey = today ? today.toDateString() : "";
  const todayRevenue = recentOrders
    .filter((order) => new Date(order.createdAt).toDateString() === todayKey)
    .reduce(
    (sum, order) => sum + order.total,
    0,
  );
  const avgOrderValue = recentOrders.length
    ? recentOrders.reduce((sum, order) => sum + order.total, 0) /
      recentOrders.length
    : 0;
  const lowStock = products
    .filter((product) => (product.stock ?? 0) <= 5)
    .sort((left, right) => (left.stock ?? 0) - (right.stock ?? 0));

  const orderColumns = useMemo<ColumnDef<AdminRecentOrder, unknown>[]>(
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
          <span className="text-foreground">{row.original.fullName}</span>
        ),
      },
      {
        accessorKey: "total",
        header: "Total",
        cell: ({ row }) => (
          <span className="font-mono tabular text-foreground">
            NPR {row.original.total.toLocaleString()}
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
    ],
    [],
  );

  const activity: ActivityItem[] = useMemo(() => {
    const items: ActivityItem[] = recentOrders.slice(0, 4).map((order) => ({
      id: `order-${order.id}`,
      icon: ShoppingBag,
      tone: "cyan",
      title: `New order from ${order.fullName}`,
      meta: `#${String(order.id).padStart(5, "0")} / NPR ${order.total.toLocaleString()}`,
      timestamp: formatRelativeTime(order.createdAt),
    }));

    if (lowStock[0]) {
      items.push({
        id: `stock-${lowStock[0].id}`,
        icon: AlertTriangle,
        tone: "warn",
        title: `${lowStock[0].name} is running low`,
        meta: `${lowStock[0].stock ?? 0} units remaining`,
        timestamp: "now",
      });
    }

    items.push({
      id: "system",
      icon: Sparkles,
      tone: "accent",
      title: "Admin console synced",
      meta: "All storefront services responding",
      timestamp: "just now",
    });

    return items;
  }, [lowStock, recentOrders]);

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Overview"
        title="Dashboard"
        description={
          today
            ? `Monitor today’s sales, recent orders, and catalog health for ${formatShortDate(today)}.`
            : "Monitor today’s sales, recent orders, and catalog health."
        }
        action={
          <>
            <Button asChild variant="outline">
              <Link href="/orders">View orders</Link>
            </Button>
            <Button asChild>
              <Link href="/products/new">
                <Plus className="size-4" strokeWidth={2} />
                New product
              </Link>
            </Button>
          </>
        }
      />

      {errorMessage ? <Notice tone="danger" message={errorMessage} /> : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Revenue"
          value={loading ? "--" : formatCompactCurrency(todayRevenue)}
          delta={loading ? undefined : 12.4}
          trend={seededTrend(17)}
          tone="accent"
          note="Compared with the last 7 days"
        />
        <MetricCard
          label="Orders"
          value={loading ? "--" : formatNumber(stats?.totalOrders ?? 0)}
          delta={loading ? undefined : 4.8}
          trend={seededTrend(42)}
          tone="cyan"
          note="All historical orders"
        />
        <MetricCard
          label="Average order"
          value={
            loading ? "--" : formatCompactCurrency(Math.round(avgOrderValue))
          }
          delta={loading ? undefined : -1.2}
          trend={seededTrend(91)}
          tone="success"
          note="Based on recent orders"
        />
        <MetricCard
          label="Low stock"
          value={loading ? "--" : formatNumber(lowStock.length)}
          trend={seededTrend(203)}
          tone="warn"
          note={
            lowStock.length
              ? `${lowStock[0]?.name ?? ""} needs restock`
              : "No products need attention"
          }
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <SectionCard
            kicker="Operations"
            title="Recent orders"
            accent
            bodyClassName="p-0"
            action={
              <Button asChild variant="ghost" size="sm">
                <Link href="/orders">
                  View all
                  <ArrowUpRight className="size-3.5" />
                </Link>
              </Button>
            }
          >
            <DataTable
              data={recentOrders}
              columns={orderColumns}
              loading={loading}
              emptyLabel="No orders in the pipeline yet."
              getRowHref={(row) => `/orders/${row.id}`}
              skeletonRows={5}
              className="rounded-none border-0"
            />
          </SectionCard>

          <SectionCard title="System status" kicker="Environment">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <HealthTile label="API" value={API_BASE_URL} />
              <HealthTile label="Build" value="v0.1.0" />
              <HealthTile
                label="Last sync"
                value={today ? formatRelativeTime(today) : "--"}
              />
              <HealthTile
                label="Users"
                value={formatNumber(stats?.totalUsers ?? 0)}
              />
            </div>
          </SectionCard>
        </div>

        <div className="space-y-6 lg:col-span-4">
          <SectionCard
            kicker="Inventory"
            title="Low stock"
            action={
              <Button asChild variant="ghost" size="sm">
                <Link href="/products">Manage</Link>
              </Button>
            }
          >
            {loading ? (
              <LowStockSkeleton />
            ) : lowStock.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                All tracked products are sufficiently stocked.
              </div>
            ) : (
              <ul className="divide-y divide-hairline/80">
                {lowStock.slice(0, 5).map((product) => (
                  <li key={product.id}>
                    <Link
                      href={`/products/${product.id}`}
                      className="flex items-center justify-between gap-3 py-3 transition hover:bg-secondary/40"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex size-9 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                          <Package className="size-4" />
                        </span>
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium text-foreground">
                            {product.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {product.category}
                          </div>
                        </div>
                      </div>
                      <div className="font-mono text-sm text-foreground">
                        {product.stock ?? 0}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>

          <SectionCard kicker="Timeline" title="Recent activity">
            <ActivityFeed items={activity} />
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

function HealthTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-hairline bg-secondary/65 px-4 py-3">
      <div className="text-[0.68rem] font-medium uppercase tracking-[0.1em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 font-mono text-sm text-foreground">{value}</div>
    </div>
  );
}

function LowStockSkeleton() {
  return (
    <ul className="divide-y divide-hairline/80">
      {Array.from({ length: 4 }).map((_, index) => (
        <li key={index} className="flex items-center gap-3 py-3">
          <span className="flex size-9 items-center justify-center rounded-lg bg-secondary text-muted-foreground/40">
            <Package className="size-4" />
          </span>
          <div className="flex-1">
            <div className="h-3 w-2/3 animate-pulse rounded-full bg-muted" />
            <div
              className="mt-2 h-2.5 w-1/3 animate-pulse rounded-full bg-muted/70"
              style={{ animationDelay: `${index * 80}ms` }}
            />
          </div>
          <div className="h-4 w-8 animate-pulse rounded-full bg-muted" />
        </li>
      ))}
    </ul>
  );
}
