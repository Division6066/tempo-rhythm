"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandMark, Wordmark } from "@tempo/ui/brand";
import { TempoIcon } from "@tempo/ui/icons";
import {
  CATEGORIES,
  isRouteActive,
  screenLabel,
  sidebarScreensByCategory,
  type TempoCategory,
} from "@/lib/tempo-nav";

/**
 * Sidebar — Tempo Flow primary navigation.
 * @source docs/design/claude-export/design-system/components.jsx (Sidebar)
 * @action navigateToScreen
 */
export function Sidebar() {
  const pathname = usePathname() ?? "/";
  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-border-soft bg-background">
      <div className="flex items-center gap-2 px-5 h-14 border-b border-border-soft">
        <BrandMark size={26} />
        <Wordmark size={18} />
      </div>

      <nav className="flex-1 overflow-y-auto scroll-subtle px-3 py-4 flex flex-col gap-6">
        {CATEGORIES.map((cat: TempoCategory) => (
          <div key={cat} className="flex flex-col gap-0.5">
            <div className="font-eyebrow px-2 pb-1.5">{cat}</div>
            {sidebarScreensByCategory(cat).map((screen) => {
              const Icon = screen.icon ? TempoIcon[screen.icon] : null;
              const active = isRouteActive(pathname, screen.route);
              return (
                <Link
                  key={screen.slug}
                  href={screen.route}
                  className={[
                    "flex min-w-0 items-center gap-2.5 rounded-md px-2.5 py-1.5 text-small transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tempo-orange",
                    active
                      ? "bg-card text-foreground shadow-whisper"
                      : "text-muted-foreground hover:bg-surface-sunken hover:text-foreground",
                  ].join(" ")}
                  aria-current={active ? "page" : undefined}
                >
                  {Icon ? (
                    <Icon
                      size={16}
                      className={active ? "text-tempo-orange" : undefined}
                    />
                  ) : null}
                  <span className="truncate">{screenLabel(screen)}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="border-t border-border-soft p-3">
        <Link
          href="/ask-founder"
          className="flex min-w-0 items-center gap-2.5 rounded-md px-2.5 py-2 text-small text-muted-foreground transition-colors hover:bg-surface-sunken hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tempo-orange"
        >
          <TempoIcon.Mail size={16} />
          <span className="truncate">Ask the founder</span>
        </Link>
        <div className="mt-2 flex min-w-0 items-center gap-3 rounded-lg bg-surface-sunken p-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-tempo-orange font-serif text-small font-semibold text-white">
            A
          </div>
          <div className="min-w-0 leading-tight">
            <div className="truncate text-small font-medium text-foreground">
              Amit
            </div>
            <div className="truncate text-caption text-muted-foreground">
              Navigation scaffold
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
