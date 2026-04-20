import { cn } from "@/lib/utils";

type SectionCardProps = {
  title?: string;
  kicker?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  accent?: boolean;
};

export default function SectionCard({
  title,
  kicker,
  action,
  children,
  className,
  bodyClassName,
  accent,
}: SectionCardProps) {
  return (
    <section
      className={cn(
        "surface-shadow overflow-hidden rounded-xl border border-hairline bg-card",
        className,
      )}
    >
      {title || action ? (
        <header
          className={cn(
            "flex items-center justify-between gap-4 border-b border-hairline px-5 py-4",
            accent && "border-b-[color:color-mix(in_oklab,var(--primary)_18%,var(--hairline))]",
          )}
        >
          <div className="min-w-0">
            {kicker ? <div className="kicker mb-1">{kicker}</div> : null}
            {title ? (
              <h2 className="text-[0.98rem] font-semibold text-foreground">
                {title}
              </h2>
            ) : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </header>
      ) : null}

      <div className={cn("p-5", bodyClassName)}>{children}</div>
    </section>
  );
}
