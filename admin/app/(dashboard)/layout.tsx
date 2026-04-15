import AdminShell from "@/components/layout/AdminShell";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
