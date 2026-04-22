"use client";

import { usePathname } from "next/navigation";
import { findScreen, TEMPO_SCREENS } from "@/lib/tempo-nav";
import { Command, Menu, Moon, Search, Sun } from "@tempo/ui/icons";
import { useTheme } from "@/components/providers/ThemeProvider";

type Props = {
  onOpenPalette: () => void;
  onOpenMobileNav: () => void;
};

/**
 * Topbar — breadcrumb, mobile-menu button, search shortcut, theme toggle.
 * @source docs/design/claude-export/design-system/components.jsx (Topbar)
 */
export function Topbar({ onOpenPalette, onOpenMobileNav }: Props) {
  const pathname = usePathname() ?? "/";
  const screen =
    TEMPO_SCREENS.find((s) => s.route === pathname) ??
    TEMPO_SCREENS.find((s) => pathname.startsWith(`${s.route}/`)) ??
    findScreen("today");

  const { resolvedTheme, setTheme } = useTheme();

  return (
    <header className="flex items-center h-14 px-5 border-b border-border-soft bg-background sticky top-0 z-10">
      {/* Mobile menu button — hidden on lg+ where the sidebar is visible. */}
      <button
        type="button"
        onClick={onOpenMobileNav}
        aria-label="Open navigation"
        className="mr-2 flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground hover:bg-surface-sunken hover:text-foreground transition-colors lg:hidden"
      >
        <Menu size={18} />
      </button>

      <h1 className="text-small font-medium text-foreground truncate">
        {screen?.title ?? "Tempo Flow"}
      </h1>

      <div className="ml-auto flex items-center gap-2">
        {/* @action openCommandPalette */}
        <button
          type="button"
          onClick={onOpenPalette}
          aria-label="Open command palette"
          className="hidden sm:flex items-center gap-2 h-8 px-3 rounded-md border border-border-soft bg-card text-muted-foreground hover:text-foreground transition-colors"
        >
          <Search size={14} />
          <span className="text-caption">Jump to…</span>
          <span className="flex items-center gap-1 text-caption opacity-60">
            <Command size={12} />K
          </span>
        </button>

        {/* @action toggleTheme */}
        <button
          type="button"
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          aria-label={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
          className="flex items-center justify-center w-10 h-10 rounded-md text-muted-foreground hover:bg-surface-sunken hover:text-foreground transition-colors"
        >
          {resolvedTheme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </header>
  );
}
