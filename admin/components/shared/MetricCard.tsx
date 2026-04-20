"use client";

import { cn } from "@/lib/utils";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import Sparkline from "./Sparkline";

type Props = {
  label: string;
  value: string;
  delta?: number;
  deltaSuffix?: string;
  trend?: number[];
  tone?: "accent" | "cyan" | "success" | "warn";
  note?: string;
  delay?: number;
  className?: string;
};

const toneClass: Record<NonNullable<Props["tone"]>, string> = {
  accent: "text-primary",
  cyan: "text-[color:var(--data-cyan)]",
  success: "text-[color:var(--success)]",
  warn: "text-[color:var(--warn)]",
};

export default function MetricCard({
  label,
  value,
  delta,
  deltaSuffix = "%",
  trend,
  tone = "accent",
  note,
  delay = 0,
  className,
}: Props) {
  const hasDelta = typeof delta === "number" && !Number.isNaN(delta);
  const direction =
    hasDelta && delta! > 0 ? "up" : hasDelta && delta! < 0 ? "down" : "flat";
  const DeltaIcon =
    direction === "up" ? ArrowUpRight : direction === "down" ? ArrowDownRight : Minus;

  return (
    <div
      className={cn(
        "rise-in surface-shadow rounded-xl border border-hairline bg-card p-5",
        className,
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="kicker mb-2">{label}</div>
          <div className="text-[1.9rem] font-semibold tracking-[-0.03em] text-foreground tabular">
            {value}
          </div>
        </div>
        {hasDelta ? (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-1 font-mono text-[0.68rem]",
              direction === "up"
                ? "text-[color:var(--success)]"
                : direction === "down"
                  ? "text-[color:var(--destructive)]"
                  : "text-muted-foreground",
            )}
          >
            <DeltaIcon className="size-3" strokeWidth={2.1} />
            <span className="tabular">
              {Math.abs(delta!).toFixed(1)}
              {deltaSuffix}
            </span>
          </span>
        ) : null}
      </div>

      <div className="mt-5 flex items-end justify-between gap-4">
        <div className="min-w-0">
          {note ? (
            <div className="text-xs leading-5 text-muted-foreground">{note}</div>
          ) : null}
        </div>
        {trend && trend.length > 1 ? (
          <div className={cn("w-24 shrink-0", toneClass[tone])}>
            <Sparkline data={trend} tone={tone} height={34} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
