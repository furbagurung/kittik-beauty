"use client";

import { clearAdminSession, type AdminUser } from "@/lib/admin-session";
import { ChevronDown, LogOut, MonitorCog, Moon, Settings, Sun } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type AdminUserMenuProps = {
  user: AdminUser | null;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function AdminUserMenu({ user }: AdminUserMenuProps) {
  const router = useRouter();
  const { setTheme, theme } = useTheme();

  if (!user) return null;

  const initials = getInitials(user.name);

  function handleLogout() {
    clearAdminSession();
    router.replace("/login");
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Open account menu"
          className="surface-shadow-float inline-flex h-10 items-center gap-3 rounded-xl border border-border bg-card px-2.5 pr-3 text-left text-foreground transition hover:bg-muted focus-visible:ring-4 focus-visible:ring-ring/10 focus-visible:outline-none"
        >
          <span className="flex size-8 items-center justify-center rounded-full bg-[color:color-mix(in_oklab,var(--primary)_16%,var(--background))] text-sm font-semibold text-primary">
            {initials}
          </span>
          <span className="hidden min-w-0 md:block">
            <span className="block truncate text-sm font-medium text-foreground">
              {user.name}
            </span>
            <span className="mt-0.5 block truncate text-xs text-muted-foreground">
              {user.role}
            </span>
          </span>
          <ChevronDown className="size-4 text-muted-foreground" strokeWidth={1.8} />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-72">
        <DropdownMenuLabel className="px-3 py-3">
          <div className="flex items-start gap-3">
            <span className="flex size-10 items-center justify-center rounded-full bg-[color:color-mix(in_oklab,var(--primary)_16%,var(--background))] text-sm font-semibold text-primary">
              {initials}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-foreground">
                {user.name}
              </span>
              <span className="mt-1 block truncate text-sm font-normal text-muted-foreground">
                {user.email}
              </span>
              <span className="mt-2 inline-flex rounded-full bg-secondary px-2.5 py-1 text-[0.68rem] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                {user.role}
              </span>
            </span>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuLabel className="px-3 pb-1 pt-2 text-[0.68rem] font-medium uppercase tracking-[0.12em] text-muted-foreground">
          Appearance
        </DropdownMenuLabel>

        <DropdownMenuRadioGroup
          value={theme ?? "light"}
          onValueChange={setTheme}
        >
          <DropdownMenuRadioItem value="light">
            <Sun className="size-4" strokeWidth={1.8} />
            Light
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark">
            <Moon className="size-4" strokeWidth={1.8} />
            Dark
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="system">
            <MonitorCog className="size-4" strokeWidth={1.8} />
            System
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/settings">
              <Settings className="size-4" strokeWidth={1.8} />
              Settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onClick={handleLogout}>
            <LogOut className="size-4" strokeWidth={1.8} />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
