"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { findScreenByPathname } from "@/lib/tempo-nav";
import { Bell, Command, Menu, Moon, Search, Sun } from "@tempo/ui/icons";
import { useTheme } from "@/components/providers/ThemeProvider";

type Props = {
  onOpenMobileNav: () => void;
  onOpenPalette: () => void;
};

/**
 * Topbar — breadcrumb, search shortcut, theme toggle, account.
 * @source docs/design/claude-export/design-system/components.jsx (Topbar)
 */
export function Topbar({ onOpenMobileNav, onOpenPalette }: Props) {
  const pathname = usePathname() ?? "/";
  const screen = findScreenByPathname(pathname);

  const { resolvedTheme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b border-border-soft bg-background px-4 sm:px-5">
      <button
        type="button"
        onClick={onOpenMobileNav}
        aria-label="Open navigation"
        className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-surface-sunken hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tempo-orange lg:hidden"
      >
        <Menu size={18} />
      </button>

      <div className="min-w-0">
        <div className="hidden text-caption text-muted-foreground sm:block">
          {screen?.category ?? "Flow"}
        </div>
        <h1 className="truncate text-small font-medium text-foreground">
          {screen?.title ?? "Tempo Flow"}
        </h1>
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* @action openCommandPalette */}
        <button
          type="button"
          onClick={onOpenPalette}
          aria-label="Open command palette"
          className="hidden h-8 items-center gap-2 rounded-md border border-border-soft bg-card px-3 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tempo-orange sm:flex"
        >
          <Search size={14} />
          <span className="text-caption">Jump to…</span>
          <span className="flex items-center gap-1 text-caption opacity-60">
            <Command size={12} />K
          </span>
        </button>

        <Link
          href="/search"
          aria-label="Open search"
          className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-surface-sunken hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tempo-orange sm:hidden"
        >
          <Search size={16} />
        </Link>

        <Link
          href="/notifications"
          aria-label="Open notifications"
          className="hidden h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-surface-sunken hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tempo-orange sm:flex"
        >
          <Bell size={16} />
        </Link>

        {/* @action toggleTheme */}
        <button
          type="button"
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          aria-label={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
          className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-surface-sunken hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tempo-orange"
        >
          {resolvedTheme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </header>
  );
}
