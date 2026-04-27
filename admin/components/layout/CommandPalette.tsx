"use client";

import Kbd from "@/components/shared/Kbd";
import { clearAdminSession } from "@/lib/admin-session";
import { cn } from "@/lib/utils";
import {
  Box,
  Images,
  LayoutGrid,
  LogOut,
  Plus,
  Receipt,
  Search,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Dialog } from "radix-ui";
import {
  useCallback,
  useEffect,
  useEffectEvent,
  useMemo,
  useState,
} from "react";

type Command = {
  id: string;
  label: string;
  group: string;
  icon: LucideIcon;
  shortcut?: string[];
  action: (router: ReturnType<typeof useRouter>) => void;
};

const commands: Command[] = [
  {
    id: "go-dashboard",
    label: "Go to Dashboard",
    group: "Navigate",
    icon: LayoutGrid,
    shortcut: ["G", "D"],
    action: (router) => router.push("/"),
  },
  {
    id: "go-orders",
    label: "Go to Orders",
    group: "Navigate",
    icon: Receipt,
    shortcut: ["G", "O"],
    action: (router) => router.push("/orders"),
  },
  {
    id: "go-products",
    label: "Go to Products",
    group: "Navigate",
    icon: Box,
    shortcut: ["G", "P"],
    action: (router) => router.push("/products"),
  },
  {
    id: "go-banners",
    label: "Go to Banners",
    group: "Navigate",
    icon: Images,
    action: (router) => router.push("/banners"),
  },
  {
    id: "go-customers",
    label: "Go to Customers",
    group: "Navigate",
    icon: Users,
    action: (router) => router.push("/customers"),
  },
  {
    id: "go-settings",
    label: "Settings",
    group: "Navigate",
    icon: Settings,
    action: (router) => router.push("/settings"),
  },
  {
    id: "new-product",
    label: "Create new product",
    group: "Actions",
    icon: Plus,
    shortcut: ["N"],
    action: (router) => router.push("/products/new"),
  },
  {
    id: "logout",
    label: "Sign out",
    group: "Actions",
    icon: LogOut,
    action: (router) => {
      clearAdminSession();
      router.replace("/login");
    },
  },
];

export default function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const handleOpenChange = useCallback((nextOpen: boolean) => {
    setOpen(nextOpen);
    setActiveIndex(0);

    if (!nextOpen) {
      setQuery("");
    }
  }, []);

  const onShortcutKey = useEffectEvent((event: KeyboardEvent) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      handleOpenChange(!open);
    }
  });

  const onOpenPaletteEvent = useEffectEvent(() => {
    handleOpenChange(true);
  });

  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => onShortcutKey(event);
    const handlePaletteOpen = () => onOpenPaletteEvent();

    window.addEventListener("keydown", handleKeydown);
    window.addEventListener("admin:open-command-palette", handlePaletteOpen);

    return () => {
      window.removeEventListener("keydown", handleKeydown);
      window.removeEventListener("admin:open-command-palette", handlePaletteOpen);
    };
  }, []);

  const results = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return commands;

    return commands.filter(
      (command) =>
        command.label.toLowerCase().includes(normalizedQuery) ||
        command.group.toLowerCase().includes(normalizedQuery),
    );
  }, [query]);

  const groups = useMemo(() => {
    const map = new Map<string, Command[]>();
    for (const command of results) {
      const list = map.get(command.group) ?? [];
      list.push(command);
      map.set(command.group, list);
    }
    return Array.from(map.entries());
  }, [results]);

  const runAt = useCallback(
    (index: number) => {
      const command = results[index];
      if (!command) return;
      handleOpenChange(false);
      command.action(router);
    },
    [handleOpenChange, results, router],
  );

  function onInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, results.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      runAt(activeIndex);
    }
  }

  let runningIndex = -1;

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-[color:var(--overlay-scrim)]/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content className="surface-shadow-float fixed left-1/2 top-[14vh] z-50 w-[560px] max-w-[94vw] -translate-x-1/2 overflow-hidden rounded-xl border border-border bg-popover data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95">
          <Dialog.Title className="sr-only">Command palette</Dialog.Title>
          <Dialog.Description className="sr-only">
            Search actions and navigation
          </Dialog.Description>

          <div className="flex items-center gap-3 border-b border-hairline px-4 py-3">
            <Search className="size-4 text-muted-foreground" strokeWidth={1.8} />
            <input
              autoFocus
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setActiveIndex(0);
              }}
              onKeyDown={onInputKeyDown}
              placeholder="Search actions and pages"
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            <Kbd>Esc</Kbd>
          </div>

          <div className="max-h-[52vh] overflow-y-auto px-2 py-2">
            {groups.length === 0 ? (
              <div className="px-4 py-12 text-center text-sm text-muted-foreground">
                No matches for <span className="font-medium text-foreground">&quot;{query}&quot;</span>
              </div>
            ) : (
              groups.map(([group, items]) => (
                <div key={group} className="mb-3 last:mb-0">
                  <div className="px-3 py-1 text-[0.7rem] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                    {group}
                  </div>
                  <ul className="space-y-1">
                    {items.map((command) => {
                      runningIndex += 1;
                      const myIndex = runningIndex;
                      const isActive = myIndex === activeIndex;
                      const Icon = command.icon;

                      return (
                        <li key={command.id}>
                          <button
                            type="button"
                            onMouseEnter={() => setActiveIndex(myIndex)}
                            onClick={() => runAt(myIndex)}
                            className={cn(
                              "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                              isActive
                                ? "bg-[color:color-mix(in_oklab,var(--primary)_10%,var(--card))] text-foreground"
                                : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                            )}
                          >
                            <span
                              className={cn(
                                "flex size-8 shrink-0 items-center justify-center rounded-md",
                                isActive ? "bg-accent text-primary" : "bg-secondary text-muted-foreground",
                              )}
                            >
                              <Icon className="size-4" strokeWidth={1.75} />
                            </span>
                            <span className="flex-1 font-medium text-foreground">
                              {command.label}
                            </span>
                            {command.shortcut ? (
                              <span className="flex items-center gap-1">
                                {command.shortcut.map((key) => (
                                  <Kbd key={key}>{key}</Kbd>
                                ))}
                              </span>
                            ) : null}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))
            )}
          </div>

          <div className="flex items-center justify-between border-t border-hairline bg-secondary px-4 py-2.5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Kbd>Up</Kbd>
              <Kbd>Dn</Kbd>
              <span>navigate</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Kbd>Enter</Kbd>
              <span>select</span>
            </span>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
