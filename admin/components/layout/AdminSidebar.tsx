"use client";

import { cn } from "@/lib/utils";
import {
  Box,
  Clapperboard,
  LayoutGrid,
  PanelLeftClose,
  PanelLeftOpen,
  Receipt,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import SidebarTicker from "./SidebarTicker";

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  children?: Array<{
    label: string;
    href: string;
  }>;
};

type NavSection = {
  label: string;
  items: NavItem[];
};

const sections: NavSection[] = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", href: "/", icon: LayoutGrid },
      { label: "Orders", href: "/orders", icon: Receipt },
    ],
  },
  {
    label: "Catalog",
    items: [
      {
        label: "Products",
        href: "/products",
        icon: Box,
        children: [
          { label: "Products", href: "/products" },
          { label: "Categories", href: "/products/categories" },
        ],
      },
    ],
  },
  {
    label: "Content",
    items: [
      { label: "Reels", href: "/reels", icon: Clapperboard },
    ],
  },
  {
    label: "Customers",
    items: [
      { label: "People", href: "/customers", icon: Users },
      { label: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

const COLLAPSE_KEY = "adminSidebarCollapsed";
const COLLAPSE_EVENT = "admin:sidebar-collapsed-change";

function isNavItemActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";

  if (href === "/products") {
    return (
      pathname === "/products" ||
      pathname === "/products/new" ||
      (pathname.startsWith("/products/") &&
        !pathname.startsWith("/products/categories"))
    );
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function subscribeCollapsed(callback: () => void) {
  window.addEventListener(COLLAPSE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(COLLAPSE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function readCollapsed() {
  return localStorage.getItem(COLLAPSE_KEY) === "1";
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const collapsed = useSyncExternalStore(
    subscribeCollapsed,
    readCollapsed,
    () => false,
  );

  function toggle() {
    const next = !collapsed;
    localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
    window.dispatchEvent(new Event(COLLAPSE_EVENT));
  }

  return (
    <aside
      data-collapsed={collapsed || undefined}
      className={cn(
        "sticky top-0 flex h-screen flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-200",
        collapsed ? "w-[80px]" : "w-[248px]",
      )}
    >
      <div
        className={cn(
          "flex items-center border-b border-sidebar-border px-4 py-4",
          collapsed ? "justify-center px-3" : "justify-between",
        )}
      >
        <Link
          href="/"
          className={cn("flex items-center gap-3", collapsed && "justify-center")}
        >
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary font-semibold text-primary-foreground shadow-[0_1px_0_0_var(--primary-strong)]">
            K
          </span>
          {!collapsed ? (
            <div className="leading-none">
              <div className="text-sm font-semibold text-foreground">Kittik</div>
              <div className="mt-1 text-xs text-muted-foreground">
                Admin console
              </div>
            </div>
          ) : null}
        </Link>

        {!collapsed ? (
          <button
            type="button"
            onClick={toggle}
            className="inline-flex size-8 items-center justify-center rounded-md border border-sidebar-border bg-card text-muted-foreground transition hover:bg-secondary hover:text-foreground"
            aria-label="Collapse sidebar"
          >
            <PanelLeftClose className="size-4" />
          </button>
        ) : null}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {sections.map((section) => (
          <div key={section.label} className="mb-5">
            {!collapsed ? (
              <div className="px-2 pb-2 text-[0.7rem] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                {section.label}
              </div>
            ) : null}

            <ul className="space-y-1">
              {section.items.map((item) => {
                const childActive = item.children?.some((child) =>
                  isNavItemActive(pathname, child.href),
                );
                const isActive =
                  isNavItemActive(pathname, item.href) || Boolean(childActive);
                const Icon = item.icon;

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      title={collapsed ? item.label : undefined}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                        collapsed && "justify-center px-0",
                      )}
                    >
                      <Icon
                        className={cn(
                          "size-4 shrink-0",
                          isActive ? "text-primary" : "text-muted-foreground",
                        )}
                        strokeWidth={1.9}
                      />
                      {!collapsed ? (
                        <span className="truncate font-medium">{item.label}</span>
                      ) : null}
                    </Link>

                    {!collapsed && item.children?.length ? (
                      <ul className="mt-1 space-y-1 pl-7">
                        {item.children.map((child) => {
                          const isChildActive = isNavItemActive(
                            pathname,
                            child.href,
                          );

                          return (
                            <li key={child.href}>
                              <Link
                                href={child.href}
                                className={cn(
                                  "flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium transition-colors",
                                  isChildActive
                                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                                )}
                              >
                                <span
                                  className={cn(
                                    "size-1.5 rounded-full",
                                    isChildActive
                                      ? "bg-primary"
                                      : "bg-muted-foreground/35",
                                  )}
                                />
                                <span className="truncate">{child.label}</span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {collapsed ? (
        <button
          type="button"
          onClick={toggle}
          className="mx-3 mb-3 inline-flex h-9 items-center justify-center rounded-md border border-sidebar-border bg-card text-muted-foreground transition hover:bg-secondary hover:text-foreground"
          aria-label="Expand sidebar"
        >
          <PanelLeftOpen className="size-4" />
        </button>
      ) : null}

      <SidebarTicker collapsed={collapsed} />
    </aside>
  );
}
