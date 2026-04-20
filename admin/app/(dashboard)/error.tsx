"use client";

import Notice from "@/components/shared/Notice";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="space-y-5">
      <Notice
        tone="danger"
        message={error.message || "The admin dashboard failed to load."}
      />

      <div className="rounded-xl border border-hairline bg-card p-6 shadow-[0_1px_2px_0_color-mix(in_oklab,var(--foreground)_8%,transparent),0_6px_18px_-16px_color-mix(in_oklab,var(--foreground)_18%,transparent)]">
        <h2 className="text-lg font-semibold text-foreground">
          Dashboard recovery
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Something interrupted this route during navigation or data loading.
          Retry the current page without leaving the admin console.
        </p>
        <div className="mt-5">
          <Button type="button" onClick={reset}>
            Try again
          </Button>
        </div>
      </div>
    </div>
  );
}
