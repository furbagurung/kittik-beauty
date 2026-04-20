import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  className?: string;
};

export default function Kbd({ children, className }: Props) {
  return (
    <kbd
      className={cn(
        "surface-shadow-soft inline-flex h-5 min-w-[1.3rem] items-center justify-center rounded-md border border-hairline bg-card px-1.5 font-mono text-[0.64rem] uppercase tracking-[0.08em] text-muted-foreground",
        className,
      )}
    >
      {children}
    </kbd>
  );
}
