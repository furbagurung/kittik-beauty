"use client";

import Notice from "@/components/shared/Notice";
import PageHeader from "@/components/shared/PageHeader";
import SectionCard from "@/components/shared/SectionCard";
import StatusPill, { OrderStatusPill } from "@/components/shared/StatusPill";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getOrderById, updateOrderStatus, type AdminApiOrder } from "@/lib/api";
import { formatCurrency, formatShortDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { ArrowLeft, Check } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const STATUS_OPTIONS = [
  "pending_payment",
  "placed",
  "processing",
  "delivered",
  "cancelled",
] as const;

export default function OrderDetailPage() {
  const params = useParams();
  const id = Number(params.id);

  const [order, setOrder] = useState<AdminApiOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [savingStatus, setSavingStatus] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function loadOrder() {
      try {
        const data = await getOrderById(id);
        if (cancelled) return;
        setOrder(data);
        setSelectedStatus(data.status);
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(
            error instanceof Error ? error.message : "Failed to load order.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadOrder();
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleSaveStatus() {
    if (!order) return;
    try {
      setSavingStatus(true);
      const updated = await updateOrderStatus(order.id, selectedStatus);
      setOrder(updated);
      setSelectedStatus(updated.status);
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 2000);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to update order.",
      );
    } finally {
      setSavingStatus(false);
    }
  }

  if (loading) {
    return <Notice tone="info" message="Loading order..." />;
  }

  if (errorMessage) {
    return <Notice tone="danger" message={errorMessage} />;
  }

  if (!order) {
    return <Notice tone="warn" message="Order not found." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/orders"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="size-4" strokeWidth={2} />
          Back to orders
        </Link>
      </div>

      <PageHeader
        kicker={`Order #${String(id).padStart(5, "0")}`}
        title="Order details"
        description="Review line items, payment information, shipping details, and fulfillment status."
        action={<OrderStatusPill status={order.status} />}
      />

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <SectionCard title="Line items" kicker="Cart">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-hairline bg-secondary/70">
                  <th className="h-11 px-4 text-left font-mono text-[0.67rem] uppercase tracking-[0.12em] text-muted-foreground">
                    Product
                  </th>
                  <th className="h-11 px-4 text-right font-mono text-[0.67rem] uppercase tracking-[0.12em] text-muted-foreground">
                    Unit
                  </th>
                  <th className="h-11 px-4 text-right font-mono text-[0.67rem] uppercase tracking-[0.12em] text-muted-foreground">
                    Qty
                  </th>
                  <th className="h-11 px-4 text-right font-mono text-[0.67rem] uppercase tracking-[0.12em] text-muted-foreground">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={item.id} className="border-b border-hairline/70 last:border-b-0">
                    <td className="px-4 py-3.5 text-foreground">{item.name}</td>
                    <td className="px-4 py-3.5 text-right font-mono tabular text-muted-foreground">
                      {formatCurrency(item.price)}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono tabular text-muted-foreground">
                      x{item.quantity}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono tabular text-foreground">
                      {formatCurrency(item.price * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <dl className="mt-4 grid gap-2 border-t border-hairline pt-4 text-sm">
            <Row label="Subtotal" value={formatCurrency(order.subtotal)} />
            <Row label="Delivery" value={formatCurrency(order.deliveryFee)} />
            <div className="mt-2 border-t border-hairline pt-2">
              <Row label="Total" value={formatCurrency(order.total)} strong />
            </div>
          </dl>
        </SectionCard>

        <div className="grid content-start gap-6">
          <SectionCard title="Customer" kicker="Shipping">
            <dl className="grid gap-3 text-sm">
              <Meta label="Name" value={order.fullName} />
              <Meta label="Phone" value={order.phone} mono />
              <Meta label="Address" value={order.address} />
              <Meta label="Payment" value={order.paymentMethod.toUpperCase()} mono />
              <Meta label="Placed" value={formatShortDate(order.createdAt)} mono />
            </dl>
          </SectionCard>

          <SectionCard title="Fulfillment" kicker="Status" accent>
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Current status</span>
                <OrderStatusPill status={order.status} />
              </div>

              <label className="grid gap-2">
                <span className="text-sm font-medium text-foreground">Move to</span>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status.replace(/_/g, " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>

              <Button
                type="button"
                onClick={handleSaveStatus}
                disabled={savingStatus || selectedStatus === order.status}
              >
                {savedFlash ? (
                  <>
                    <Check className="size-4" strokeWidth={2.4} />
                    Saved
                  </>
                ) : savingStatus ? (
                  "Saving..."
                ) : (
                  "Apply status"
                )}
              </Button>

              {savedFlash ? (
                <StatusPill
                  label="Updated"
                  tone="success"
                  className="justify-self-start"
                />
              ) : null}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={cn("font-mono tabular text-foreground", strong && "text-base font-semibold")}>
        {value}
      </span>
    </div>
  );
}

function Meta({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="grid gap-1">
      <span className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </span>
      <span className={cn("text-sm text-foreground", mono && "font-mono")}>
        {value}
      </span>
    </div>
  );
}
