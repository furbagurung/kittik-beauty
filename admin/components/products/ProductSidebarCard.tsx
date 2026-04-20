import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type ProductSidebarCardProps = {
  title: string;
  description?: string;
  className?: string;
  children: ReactNode;
};

export default function ProductSidebarCard({
  title,
  description,
  className,
  children,
}: ProductSidebarCardProps) {
  return (
    <Card
      size="sm"
      className={cn(
        "surface-shadow-strong rounded-2xl border-border/80 bg-card",
        className,
      )}
    >
      <CardHeader className="gap-1 border-b border-border/70 pb-3">
        <CardTitle className="text-sm">{title}</CardTitle>
        {description ? (
          <CardDescription className="text-[0.78rem] leading-5">
            {description}
          </CardDescription>
        ) : null}
      </CardHeader>
      <CardContent className="pt-4">{children}</CardContent>
    </Card>
  );
}
