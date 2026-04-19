"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandMark, Wordmark } from "@tempo/ui/brand";
import { TempoIcon } from "@tempo/ui/icons";
import {
  CATEGORIES,
  screensByCategory,
  type TempoCategory,
} from "@/lib/tempo-nav";

/**
 * Sidebar — Tempo Flow primary navigation.
 * @source docs/design/claude-export/design-system/components.jsx (Sidebar)
 * @action navigateToScreen
 */
export function Sidebar() {
  const pathname = usePathname();
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
            {screensByCategory(cat).map((screen) => {
              const Icon = screen.icon ? TempoIcon[screen.icon] : null;
              const active =
                pathname === screen.route ||
                pathname?.startsWith(`${screen.route}/`);
              return (
                <Link
                  key={screen.slug}
                  href={screen.route}
                  className={[
                    "flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-small transition-colors",
                    active
                      ? "bg-surface-sunken text-foreground"
                      : "text-muted-foreground hover:bg-surface-sunken hover:text-foreground",
                  ].join(" ")}
                >
                  {Icon ? <Icon size={16} /> : null}
                  <span>{screen.title}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}
