"use client";

import AdminUserMenu from "@/components/layout/AdminUserMenu";
import Kbd from "@/components/shared/Kbd";
import { useAdminSession } from "@/lib/use-admin-session";
import { Bell, Search } from "lucide-react";

export default function AdminTopbar() {
  const { user: adminUser } = useAdminSession();

  function openPalette() {
    window.dispatchEvent(new Event("admin:open-command-palette"));
  }

  return (
    <header className="sticky top-0 z-20 border-b border-hairline bg-background/94 px-5 backdrop-blur md:px-7">
      <div className="mx-auto grid h-[4.4rem] w-full max-w-[1480px] grid-cols-[1fr_auto] items-center gap-3 md:grid-cols-[minmax(0,1fr)_minmax(440px,560px)_minmax(0,1fr)] md:gap-5">
        <div className="hidden md:block" />

        <button
          type="button"
          onClick={openPalette}
          className="surface-shadow-float hidden h-11 w-full items-center gap-3 rounded-2xl border border-border/80 bg-card px-4 text-left text-sm text-muted-foreground transition hover:bg-muted md:flex"
        >
          <span className="surface-shadow-soft inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-muted-foreground">
            <Search className="size-4" strokeWidth={1.8} />
          </span>
          <span className="flex-1 truncate text-[0.94rem] text-secondary-foreground">
            Search orders, products, and customers
          </span>
          <span className="flex items-center gap-1.5">
            <Kbd className="bg-secondary">
              Cmd
            </Kbd>
            <Kbd className="bg-secondary">
              K
            </Kbd>
          </span>
        </button>

        <div className="flex min-w-0 items-center justify-end gap-2">
          <button
            type="button"
            onClick={openPalette}
            className="surface-shadow-soft inline-flex size-10 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition hover:bg-muted hover:text-foreground md:hidden"
            aria-label="Open search"
          >
            <Search className="size-4" strokeWidth={1.8} />
          </button>

          <button
            type="button"
            className="surface-shadow-soft inline-flex size-10 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition hover:bg-muted hover:text-foreground"
            aria-label="Notifications"
          >
            <Bell className="size-4" strokeWidth={1.8} />
          </button>

          <AdminUserMenu user={adminUser} />
        </div>
      </div>
    </header>
  );
}
