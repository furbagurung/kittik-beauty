"use client";

import Notice from "@/components/shared/Notice";
import { bootstrapAdminSession } from "@/lib/admin-session";
import { useAdminSession } from "@/lib/use-admin-session";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";
import CommandPalette from "./CommandPalette";

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { error, status } = useAdminSession();

  useEffect(() => {
    void bootstrapAdminSession();
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [router, status]);

  if (status !== "authenticated") {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-background px-5 text-foreground">
        <div className="pointer-events-none absolute inset-0 shell-wash" />
        <div className="relative w-full max-w-md">
          <Notice
            tone={status === "unauthenticated" && error ? "warn" : "info"}
            message={
              status === "unauthenticated"
                ? "Redirecting to login..."
                : "Restoring your admin session..."
            }
            className="justify-center"
          />
        </div>
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
