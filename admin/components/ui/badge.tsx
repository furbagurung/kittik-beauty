import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 rounded-full border px-2 py-0.5 text-[0.68rem] font-medium transition-colors [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      variant: {
        default: "border-primary/15 bg-primary/10 text-primary",
        secondary: "border-border bg-secondary text-secondary-foreground",
        destructive:
          "border-[color:color-mix(in_oklab,var(--destructive)_22%,transparent)] bg-[color:color-mix(in_oklab,var(--destructive)_10%,var(--card))] text-[color:var(--destructive)]",
        outline: "border-border bg-card text-foreground",
        ghost: "border-transparent bg-transparent text-muted-foreground",
        link: "h-auto rounded-none border-transparent px-0 text-primary hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span";

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
