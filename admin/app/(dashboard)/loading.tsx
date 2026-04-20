export default function DashboardLoading() {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <div className="h-3 w-24 animate-pulse rounded-full bg-secondary" />
        <div className="h-9 w-56 animate-pulse rounded-2xl bg-secondary/85" />
        <div className="h-4 w-full max-w-xl animate-pulse rounded-full bg-secondary/70" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="rounded-xl border border-hairline bg-card p-5 shadow-[0_1px_2px_0_color-mix(in_oklab,var(--foreground)_8%,transparent),0_6px_18px_-16px_color-mix(in_oklab,var(--foreground)_18%,transparent)]"
          >
            <div className="h-3 w-20 animate-pulse rounded-full bg-secondary" />
            <div
              className="mt-4 h-8 w-28 animate-pulse rounded-full bg-secondary/80"
              style={{ animationDelay: `${index * 80}ms` }}
            />
            <div className="mt-6 h-3 w-32 animate-pulse rounded-full bg-secondary/70" />
          </div>
        ))}
      </div>
    </div>
  );
}
