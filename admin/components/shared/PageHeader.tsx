type PageHeaderProps = {
  kicker?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
};

export default function PageHeader({
  kicker,
  title,
  description,
  action,
}: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div className="min-w-0">
        {kicker ? <div className="kicker mb-1.5">{kicker}</div> : null}
        <h1 className="text-[1.75rem] font-semibold tracking-[-0.02em] text-foreground md:text-[2rem]">
          {title}
        </h1>
        {description ? (
          <p className="mt-1.5 max-w-3xl text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>

      {action ? <div className="flex shrink-0 items-center gap-2">{action}</div> : null}
    </div>
  );
}
