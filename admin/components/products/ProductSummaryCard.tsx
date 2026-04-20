/* eslint-disable @next/next/no-img-element */

import ProductSidebarCard from "@/components/products/ProductSidebarCard";

type ProductSummaryCardProps = {
  mode: "create" | "edit";
  name: string;
  category: string;
  priceLabel: string;
  stock: number;
  primaryPreviewUrl: string;
  galleryCount: number;
};

function SummaryMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border/70 bg-secondary/50 px-3 py-3">
      <div className="text-[0.68rem] font-medium uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-sm font-medium text-foreground">{value}</div>
    </div>
  );
}

export default function ProductSummaryCard({
  mode,
  name,
  category,
  priceLabel,
  stock,
  primaryPreviewUrl,
  galleryCount,
}: ProductSummaryCardProps) {
  const displayName = name.trim() || "Untitled product";

  return (
    <ProductSidebarCard
      title="Product summary"
      description="A compact snapshot of what shoppers and operators will see."
    >
      <div className="space-y-4">
        <div className="overflow-hidden rounded-2xl border border-border/70 bg-muted/50">
          <div className="media-stage aspect-[4/3]">
            {primaryPreviewUrl ? (
              <img
                src={primaryPreviewUrl}
                alt={displayName}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="media-stage-accent flex h-full items-end justify-start p-4">
                <div className="rounded-full border border-border/70 bg-card/90 px-2.5 py-1 text-[0.68rem] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  No media yet
                </div>
              </div>
            )}
          </div>
          <div className="space-y-2 border-t border-border/70 bg-card px-4 py-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-secondary px-2.5 py-1 text-[0.68rem] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                {mode === "create" ? "New record" : "Existing record"}
              </span>
              <span className="rounded-full bg-[color:color-mix(in_oklab,var(--primary)_12%,var(--card))] px-2.5 py-1 text-[0.68rem] font-medium uppercase tracking-[0.12em] text-primary">
                {category}
              </span>
            </div>
            <div>
              <p className="text-base font-semibold tracking-[-0.02em] text-foreground">
                {displayName}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Gallery has {galleryCount} supporting image
                {galleryCount === 1 ? "" : "s"}.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
          <SummaryMetric label="Price" value={priceLabel} />
          <SummaryMetric
            label="Inventory"
            value={`${Math.max(0, stock)} unit${stock === 1 ? "" : "s"}`}
          />
        </div>
      </div>
    </ProductSidebarCard>
  );
}
