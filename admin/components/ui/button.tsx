import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border text-sm font-medium whitespace-nowrap transition-colors duration-150 outline-none select-none focus-visible:ring-4 focus-visible:ring-ring/15 disabled:pointer-events-none disabled:opacity-50 active:not-aria-[haspopup]:translate-y-px [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "border-primary bg-primary text-primary-foreground shadow-[0_1px_0_0_var(--primary-strong)] hover:bg-[color:var(--primary-strong)]",
        outline:
          "surface-shadow-soft border-border bg-card text-foreground hover:bg-muted",
        secondary:
          "border-border/80 bg-secondary text-secondary-foreground hover:bg-accent",
        ghost:
          "border-transparent bg-transparent text-muted-foreground hover:bg-secondary hover:text-foreground",
        destructive:
          "border-[color:color-mix(in_oklab,var(--destructive)_22%,transparent)] bg-[color:color-mix(in_oklab,var(--destructive)_10%,var(--card))] text-[color:var(--destructive)] hover:bg-[color:color-mix(in_oklab,var(--destructive)_14%,var(--card))]",
        link: "h-auto rounded-none border-transparent px-0 py-0 text-primary hover:underline",
      },
      size: {
        default:
          "h-9 gap-2 px-3.5 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        xs: "h-6 gap-1 rounded-md px-2 text-xs [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 rounded-md px-3 text-[0.8rem] [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-10 gap-2 px-4 text-sm",
        icon: "size-9",
        "icon-xs": "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8 rounded-md",
        "icon-lg": "size-10 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
