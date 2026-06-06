"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandMark, Wordmark } from "@tempo/ui/brand";
import { TempoIcon, X } from "@tempo/ui/icons";
import {
  CATEGORIES,
  isRouteActive,
  primaryMobileTabs,
  screenLabel,
  sidebarScreensByCategory,
  type TempoCategory,
} from "@/lib/tempo-nav";

type Props = {
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

/**
 * MobileNav — small-screen route home for the web PWA shell.
 * @source docs/design/claude-export/design-system/mobile/mobile-shell.jsx
 * @action navigateToScreen
 */
export function MobileNav({ onOpenChange, open }: Props) {
  const pathname = usePathname() ?? "/";
  const tabs = primaryMobileTabs();

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-border-soft bg-card/95 px-2 pb-[calc(env(safe-area-inset-bottom)+0.35rem)] pt-1.5 shadow-lift backdrop-blur lg:hidden">
        <div className="grid grid-cols-5 gap-1">
          {tabs.map((screen) => {
            const Icon = screen.icon ? TempoIcon[screen.icon] : null;
            const active = isRouteActive(pathname, screen.route);

            return (
              <Link
                key={screen.slug}
                href={screen.route}
                className={[
                  "flex min-h-11 min-w-0 flex-col items-center justify-center gap-0.5 rounded-lg px-1 py-1 text-center transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tempo-orange",
                  active
                    ? "bg-surface-sunken text-tempo-orange"
                    : "text-muted-foreground hover:bg-surface-sunken hover:text-foreground",
                ].join(" ")}
                aria-current={active ? "page" : undefined}
              >
                {Icon ? <Icon size={17} /> : null}
                <span className="max-w-full truncate text-[0.65rem] font-medium">
                  {screenLabel(screen)}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      <Dialog.Root open={open} onOpenChange={onOpenChange}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-[rgba(0,0,0,0.35)] backdrop-blur-sm lg:hidden" />
          <Dialog.Content
            aria-describedby={undefined}
            className="fixed inset-y-0 left-0 z-50 flex w-[min(22rem,88vw)] flex-col border-r border-border-soft bg-background shadow-lift lg:hidden"
          >
            <div className="flex h-14 items-center gap-2 border-b border-border-soft px-4">
              <BrandMark size={26} />
              <Wordmark size={18} />
              <Dialog.Title className="sr-only">Navigation</Dialog.Title>
              <Dialog.Close asChild>
                <button
                  type="button"
                  aria-label="Close navigation"
                  className="ml-auto flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-surface-sunken hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tempo-orange"
                >
                  <X size={18} />
                </button>
              </Dialog.Close>
            </div>

            <nav className="flex-1 overflow-y-auto scroll-subtle px-3 py-4">
              <div className="flex flex-col gap-6">
                {CATEGORIES.map((cat: TempoCategory) => (
                  <div key={cat} className="flex flex-col gap-0.5">
                    <div className="font-eyebrow px-2 pb-1.5">{cat}</div>
                    {sidebarScreensByCategory(cat).map((screen) => {
                      const Icon = screen.icon ? TempoIcon[screen.icon] : null;
                      const active = isRouteActive(pathname, screen.route);

                      return (
                        <Dialog.Close key={screen.slug} asChild>
                          <Link
                            href={screen.route}
                            className={[
                              "flex min-h-11 min-w-0 items-center gap-2.5 rounded-md px-2.5 py-2 text-small transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tempo-orange",
                              active
                                ? "bg-card text-foreground shadow-whisper"
                                : "text-muted-foreground hover:bg-surface-sunken hover:text-foreground",
                            ].join(" ")}
                            aria-current={active ? "page" : undefined}
                          >
                            {Icon ? (
                              <Icon
                                size={16}
                                className={
                                  active ? "text-tempo-orange" : undefined
                                }
                              />
                            ) : null}
                            <span className="truncate">
                              {screenLabel(screen)}
                            </span>
                          </Link>
                        </Dialog.Close>
                      );
                    })}
                  </div>
                ))}
              </div>
            </nav>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
