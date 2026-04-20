"use client";

import { formatClockTime } from "@/lib/format";
import { useEffect, useState } from "react";

export default function SidebarTicker({ collapsed }: { collapsed?: boolean }) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const id = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(id);
  }, []);

  const env =
    process.env.NODE_ENV === "production" ? "Production" : "Development";

  if (collapsed) {
    return (
      <div className="mt-auto border-t border-sidebar-border px-3 py-3">
        <div className="flex flex-col items-center gap-1 rounded-lg bg-card px-2 py-2">
          <span className="pulse-dot size-2 rounded-full bg-[color:var(--success)]" />
          <span className="text-[0.66rem] text-muted-foreground">Live</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-auto border-t border-sidebar-border px-4 py-4">
      <div className="rounded-lg bg-card px-3 py-3 text-xs text-muted-foreground">
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            <span className="pulse-dot size-2 rounded-full bg-[color:var(--success)]" />
            {env}
          </span>
          <span className="font-mono tabular text-foreground min-w-[72px] text-right">
            {now ? formatClockTime(now) : "00:00:00"}
          </span>
        </div>
        <div className="mt-2 font-mono text-[0.66rem] text-muted-foreground">
          kittik.api / localhost:5000
        </div>
      </div>
    </div>
  );
}
