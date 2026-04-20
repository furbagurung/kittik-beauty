import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
} from "@/components/ui/card";

type ProductEditorSectionProps = {
  action?: ReactNode;
  className?: string;
  contentClassName?: string;
  children: ReactNode;
};

export default function ProductEditorSection({
  action,
  className,
  contentClassName,
  children,
}: ProductEditorSectionProps) {
  return (
    <Card
      className={cn(
        "surface-shadow-strong rounded-2xl border-border/80 bg-card",
        className,
      )}
    >
      <CardHeader className="gap-1.5 border-b border-border/70 pb-4">
        {action ? <CardAction>{action}</CardAction> : null}
      </CardHeader>
      <CardContent className={cn("pt-0", contentClassName)}>
        {children}
      </CardContent>
    </Card>
  );
}
