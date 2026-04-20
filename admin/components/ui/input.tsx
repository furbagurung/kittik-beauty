import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "surface-shadow-soft h-10 w-full min-w-0 rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground transition outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-[color:color-mix(in_oklab,var(--primary)_32%,var(--input))] focus-visible:ring-4 focus-visible:ring-ring/10 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-secondary disabled:text-muted-foreground aria-invalid:border-destructive aria-invalid:ring-4 aria-invalid:ring-destructive/10",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
