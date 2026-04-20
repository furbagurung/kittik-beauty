import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export type ActivityItem = {
  id: string;
  icon: LucideIcon;
  title: string;
  meta: string;
  timestamp: string;
  tone?: "accent" | "cyan" | "success" | "warn" | "neutral";
};

const toneClass: Record<NonNullable<ActivityItem["tone"]>, string> = {
  accent:
    "text-primary border-[color:color-mix(in_oklab,var(--primary)_16%,transparent)] bg-[color:color-mix(in_oklab,var(--primary)_10%,var(--card))]",
  cyan:
    "text-[color:var(--data-cyan)] border-[color:color-mix(in_oklab,var(--data-cyan)_16%,transparent)] bg-[color:color-mix(in_oklab,var(--data-cyan)_10%,var(--card))]",
  success:
    "text-[color:var(--success)] border-[color:color-mix(in_oklab,var(--success)_16%,transparent)] bg-[color:color-mix(in_oklab,var(--success)_10%,var(--card))]",
  warn:
    "text-[color:var(--warn)] border-[color:color-mix(in_oklab,var(--warn)_12%,transparent)] bg-[color:color-mix(in_oklab,var(--warn)_10%,var(--card))]",
  neutral: "text-muted-foreground border-hairline bg-secondary/70",
};

type Props = {
  items: ActivityItem[];
  emptyLabel?: string;
};

export default function ActivityFeed({
  items,
  emptyLabel = "No activity yet",
}: Props) {
  if (!items.length) {
    return (
      <div className="rounded-lg border border-dashed border-hairline bg-secondary/60 p-5 text-center">
        <div className="kicker">Activity</div>
        <p className="mt-1 text-sm text-muted-foreground">{emptyLabel}</p>
      </div>
    );
  }

  return (
    <ol className="relative">
      <span
        aria-hidden
        className="absolute bottom-1 left-[14px] top-1 w-px bg-hairline"
      />
      {items.map((item, index) => {
        const Icon = item.icon;
        const tone = toneClass[item.tone ?? "neutral"];

        return (
          <li
            key={item.id}
            className="relative flex gap-3 pb-4 last:pb-0"
            style={{
              animation: "rise-in 360ms cubic-bezier(0.16,1,0.3,1) both",
              animationDelay: `${index * 35}ms`,
            }}
          >
            <div
              className={cn(
                "relative z-[1] mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border",
                tone,
              )}
            >
              <Icon className="size-3.5" strokeWidth={2} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-foreground">{item.title}</div>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="truncate">{item.meta}</span>
                <span className="opacity-40">•</span>
                <span className="shrink-0 font-mono tabular">{item.timestamp}</span>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
