import type { ReactNode } from "react";

import { CircleAlert, CircleDot, PackageCheck } from "lucide-react";

import { Button } from "@/components/ui/button";

type ProductEditorHeaderProps = {
  mode: "create" | "edit";
  name: string;
  category: string;
  status: string;
  hasPrimaryImage: boolean;
  isSubmitting: boolean;
  onDiscard: () => void;
};

function MetaPill({
  icon,
  label,
  tone = "neutral",
}: {
  icon: ReactNode;
  label: string;
  tone?: "neutral" | "accent" | "warn";
}) {
  const toneClass =
    tone === "accent"
      ? "border-[color:color-mix(in_oklab,var(--primary)_16%,transparent)] bg-[color:color-mix(in_oklab,var(--primary)_10%,var(--card))] text-primary"
      : tone === "warn"
        ? "border-[color:color-mix(in_oklab,var(--destructive)_18%,transparent)] bg-[color:color-mix(in_oklab,var(--destructive)_10%,var(--card))] text-[color:var(--destructive)]"
        : "border-border/80 bg-card text-muted-foreground";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.68rem] font-medium uppercase tracking-[0.12em] ${toneClass}`}
    >
      {icon}
      {label}
    </span>
  );
}

export default function ProductEditorHeader({
  mode,
  name,
  category,
  status,
  hasPrimaryImage,
  isSubmitting,
  onDiscard,
}: ProductEditorHeaderProps) {
  const heading =
    name.trim() || (mode === "create" ? "Create product" : "Edit product");

  return (
    <div className="surface-shadow-strong sticky top-4 z-20 rounded-2xl border border-border/80 bg-card/95 px-5 py-4 backdrop-blur">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <MetaPill
              icon={<PackageCheck className="size-3" />}
              label={mode === "create" ? "Add to catalog" : "Catalog editor"}
            />
            <MetaPill
              icon={<CircleDot className="size-3" />}
              label={category}
              tone="accent"
            />
            <MetaPill
              icon={<CircleAlert className="size-3" />}
              label={`${status} local`}
              tone="warn"
            />
          </div>

          <div className="space-y-1">
            <h1 className="text-[1.55rem] font-semibold tracking-[-0.03em] text-foreground md:text-[1.85rem]">
              {heading}
            </h1>
            <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
              Keep the essential merchandising details tight and current. Status
              is visible here as a workspace cue and is not synced with the
              backend yet.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span className="rounded-full bg-secondary px-2.5 py-1">
              {hasPrimaryImage ? "Primary media ready" : "Primary media required"}
            </span>
            <span className="rounded-full bg-secondary px-2.5 py-1">
              Save preserves the current product payload only
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 self-start">
          <Button
            type="button"
            variant="outline"
            onClick={onDiscard}
            disabled={isSubmitting}
          >
            Discard
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : mode === "create" ? "Save product" : "Save changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
