import { cn } from "@/lib/utils";

type NoticeTone = "success" | "info" | "warn" | "danger";

const toneClasses: Record<NoticeTone, string> = {
  success:
    "border-[color:color-mix(in_oklab,var(--success)_24%,transparent)] bg-[color:color-mix(in_oklab,var(--success)_10%,var(--card))] text-[color:var(--success)]",
  info:
    "border-[color:color-mix(in_oklab,var(--data-cyan)_24%,transparent)] bg-[color:color-mix(in_oklab,var(--data-cyan)_10%,var(--card))] text-[color:var(--data-cyan)]",
  warn:
    "border-[color:color-mix(in_oklab,var(--warn)_20%,transparent)] bg-[color:color-mix(in_oklab,var(--warn)_10%,var(--card))] text-[color:var(--warn)]",
  danger:
    "border-[color:color-mix(in_oklab,var(--destructive)_24%,transparent)] bg-[color:color-mix(in_oklab,var(--destructive)_10%,var(--card))] text-[color:var(--destructive)]",
};

export default function Notice({
  tone,
  message,
  className,
}: {
  tone: NoticeTone;
  message: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border px-3.5 py-2.5 text-sm",
        toneClasses[tone],
        className,
      )}
    >
      <span className="size-2 rounded-full bg-current" />
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
}
