"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { BrandMark, Wordmark } from "@tempo/ui/brand";
import { TempoIcon } from "@tempo/ui/icons";
import { X } from "lucide-react";
import {
  CATEGORIES,
  screensByCategory,
  type TempoCategory,
} from "@/lib/tempo-nav";

type MobileNavProps = {
  open: boolean;
  onClose: () => void;
};

/**
 * Mobile-only drawer that mirrors the desktop sidebar.
 * Rendered from the TempoShell; hidden on lg+ where the fixed Sidebar takes over.
 */
export function MobileNav({ open, onClose }: MobileNavProps) {
  const pathname = usePathname();

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex lg:hidden" role="dialog" aria-modal="true">
      <button
        type="button"
        aria-label="Close navigation"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <aside className="relative ml-0 flex h-full w-72 max-w-[85vw] flex-col bg-background border-r border-border-soft shadow-xl">
        <div className="flex items-center justify-between px-5 h-14 border-b border-border-soft">
          <div className="flex items-center gap-2">
            <BrandMark size={26} />
            <Wordmark size={18} />
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground hover:bg-surface-sunken hover:text-foreground transition-colors"
          >
            <X size={18} />
          </button>
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
                    onClick={onClose}
                    className={[
                      "flex items-center gap-2.5 px-2.5 py-2.5 rounded-md text-small transition-colors min-h-11",
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
    </div>
  );
}
