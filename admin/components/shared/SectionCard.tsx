type SectionCardProps = {
  title?: string;
  children: React.ReactNode;
};

export default function SectionCard({ title, children }: SectionCardProps) {
  return (
    <div className="rounded-xl border bg-white p-6">
      {title ? (
        <h2 className="mb-4 text-lg font-semibold text-gray-900">{title}</h2>
      ) : null}
      {children}
    </div>
  );
}
