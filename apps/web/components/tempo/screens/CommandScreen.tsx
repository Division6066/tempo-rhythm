"use client";

import Link from "next/link";
import { Pill, SoftCard } from "@tempo/ui/primitives";
import { ScreenHeader } from "@/components/tempo/ScreenHeader";
import { TEMPO_SCREENS } from "@/lib/tempo-nav";

/**
 * CommandScreen — full-screen fallback for the ⌘K palette (direct link).
 * @source docs/design/claude-export/design-system/screens-5.jsx (ScreenCommand)
 */
export function CommandScreen() {
  const categories = ["Flow", "Library", "You", "Settings", "Marketing"] as const;

  return (
    <div className="flex flex-col">
      <ScreenHeader
        eyebrow="You"
        title="Command bar"
        lede="⌘K inside the app opens a palette. This page is a discoverable index of the same routes."
      />

      <div className="grid gap-5 px-6 py-6 md:grid-cols-2">
        {categories.map((cat) => (
          <SoftCard key={cat} tone="default" padding="md">
            <div className="font-eyebrow mb-3">{cat}</div>
            <ul className="flex flex-col gap-2">
              {TEMPO_SCREENS.filter((s) => s.category === cat).map((screen) => (
                <li key={screen.slug}>
                  {/*
                   * @behavior: Jump to any screen in the app.
                   * @navigate: screen.route
                   */}
                  <Link
                    href={screen.route}
                    className="flex items-center justify-between rounded-lg bg-surface-sunken px-3 py-2 text-small transition-colors hover:bg-surface"
                  >
                    <span>{screen.title}</span>
                    <Pill tone="neutral">{screen.route}</Pill>
                  </Link>
                </li>
              ))}
            </ul>
          </SoftCard>
        ))}
      </div>
    </div>
  );
}
