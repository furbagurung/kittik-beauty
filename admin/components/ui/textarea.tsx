import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "surface-shadow-soft flex field-sizing-content min-h-28 w-full rounded-lg border border-input bg-card px-3 py-2.5 text-sm text-foreground transition outline-none placeholder:text-muted-foreground focus-visible:border-[color:color-mix(in_oklab,var(--primary)_32%,var(--input))] focus-visible:ring-4 focus-visible:ring-ring/10 disabled:cursor-not-allowed disabled:bg-secondary disabled:text-muted-foreground aria-invalid:border-destructive aria-invalid:ring-4 aria-invalid:ring-destructive/10",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
