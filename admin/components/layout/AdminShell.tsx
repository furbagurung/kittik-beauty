"use client";

import Notice from "@/components/shared/Notice";
import { getStoredAdminToken } from "@/lib/admin-session";
import { useAdminSession } from "@/lib/use-admin-session";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useSyncExternalStore } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";
import CommandPalette from "./CommandPalette";

function subscribeToHydration() {
  return () => {};
}

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { token } = useAdminSession();
  const hydrated = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false,
  );

  const hasStoredToken = useMemo(() => {
    if (!hydrated) return false;
    return getStoredAdminToken() !== null;
  }, [hydrated]);

  const isAuthenticated = token !== null || hasStoredToken;

  useEffect(() => {
    if (hydrated && !isAuthenticated) {
      router.replace("/login");
    }
  }, [hydrated, isAuthenticated, router]);

  if (!hydrated || !isAuthenticated) {
    return (
      <div className="flex min-h-screen bg-background text-foreground">
        <AdminSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <AdminTopbar />
          <main className="relative flex-1 overflow-auto px-5 py-6 md:px-7 md:py-7">
            <div className="pointer-events-none absolute inset-0 shell-wash" />
            <div className="relative mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-[1480px] items-center justify-center">
              <Notice
                tone="info"
                message={
                  hydrated
                    ? "Redirecting to login..."
                    : "Restoring your admin session..."
                }
                className="w-full max-w-md justify-center"
              />
            </div>
          </main>
        </div>
        <CommandPalette />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar />
        <main className="relative flex-1 overflow-auto px-5 py-6 md:px-7 md:py-7">
          <div className="pointer-events-none absolute inset-0 shell-wash" />
          <div className="relative mx-auto w-full max-w-[1480px]">{children}</div>
        </main>
      </div>
      <CommandPalette />
    </div>
  );
}
