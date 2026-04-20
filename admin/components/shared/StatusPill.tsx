import { cn } from "@/lib/utils";

type StatusTone = "success" | "warn" | "info" | "danger" | "neutral" | "accent";

type Props = {
  label: string;
  tone?: StatusTone;
  dot?: boolean;
  className?: string;
};

const toneStyles: Record<StatusTone, string> = {
  success:
    "text-[color:var(--success)] bg-[color:color-mix(in_oklab,var(--success)_14%,var(--card))] border-[color:color-mix(in_oklab,var(--success)_22%,transparent)]",
  warn:
    "text-[color:var(--warn)] bg-[color:color-mix(in_oklab,var(--warn)_12%,var(--card))] border-[color:color-mix(in_oklab,var(--warn)_20%,transparent)]",
  info:
    "text-[color:var(--data-cyan)] bg-[color:color-mix(in_oklab,var(--data-cyan)_12%,var(--card))] border-[color:color-mix(in_oklab,var(--data-cyan)_20%,transparent)]",
  danger:
    "text-[color:var(--destructive)] bg-[color:color-mix(in_oklab,var(--destructive)_12%,var(--card))] border-[color:color-mix(in_oklab,var(--destructive)_20%,transparent)]",
  accent:
    "text-primary bg-[color:color-mix(in_oklab,var(--primary)_12%,var(--card))] border-[color:color-mix(in_oklab,var(--primary)_20%,transparent)]",
  neutral: "text-muted-foreground bg-secondary border-hairline",
};

function toneForOrderStatus(status: string): StatusTone {
  const normalizedStatus = status.toLowerCase();
  if (
    normalizedStatus === "paid" ||
    normalizedStatus === "delivered" ||
    normalizedStatus === "completed"
  ) {
    return "success";
  }
  if (normalizedStatus === "pending" || normalizedStatus === "pending_payment") {
    return "warn";
  }
  if (normalizedStatus === "processing" || normalizedStatus === "placed") {
    return "info";
  }
  if (normalizedStatus === "cancelled" || normalizedStatus === "refunded") {
    return "danger";
  }
  return "neutral";
}

export function toneForStock(stock: number): StatusTone {
  if (stock === 0) return "danger";
  if (stock <= 5) return "warn";
  return "success";
}

export function stockLabel(stock: number) {
  if (stock === 0) return "Out of stock";
  if (stock <= 5) return "Low stock";
  return "In stock";
}

export default function StatusPill({
  label,
  tone = "neutral",
  dot = true,
  className,
}: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.72rem] font-medium",
        toneStyles[tone],
        className,
      )}
    >
      {dot ? <span className="size-1.5 rounded-full bg-current" aria-hidden /> : null}
      <span>{label}</span>
    </span>
  );
}

export function OrderStatusPill({ status }: { status: string }) {
  return <StatusPill label={status.replace(/_/g, " ")} tone={toneForOrderStatus(status)} />;
}
