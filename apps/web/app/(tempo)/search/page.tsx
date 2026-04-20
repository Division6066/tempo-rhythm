/**
 * @screen: search
 * @category: You
 * @source: docs/design/claude-export/design-system/screens-5.jsx
 * @queries: search.unified ({ q }) — tasks + notes + goals (Long Run 2)
 * @mutations: none
 * @auth: required
 * @env: NEXT_PUBLIC_CONVEX_URL
 */
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { mockSearchResults } from "@tempo/mock-data";
import { Button, Field, SoftCard } from "@tempo/ui/primitives";
import { ScreenSurface, type ViewMode } from "@/components/tempo-port/ScreenSurface";

export default function Page() {
  const router = useRouter();
  const [mode, setMode] = useState<ViewMode>("ready");
  const [q, setQ] = useState("launch");

  return (
    <ScreenSurface mode={mode} onModeChange={setMode}>
      <div className="mx-auto max-w-3xl space-y-8 p-6 pb-24 md:p-8">
        <header>
          <p className="font-eyebrow text-muted-foreground">Search</p>
          <h1 className="text-h1 font-serif text-foreground">Find anything.</h1>
        </header>
        <Field
          label="Query"
          name="q"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Tasks, notes, goals…"
        />
        {/*
          @action runSearch
          @query: search.unified({ q }) @index multiple tables by_userId_deletedAt
          @auth: required
          @errors: empty state + toast
          @env: NEXT_PUBLIC_CONVEX_URL
        */}
        <Button type="button" variant="primary" onClick={() => router.refresh()}>
          Search
        </Button>
        <ul className="space-y-2">
          {mockSearchResults.map((r) => (
            <li key={r.id}>
              <SoftCard padding="md">
                {/*
                  @action openSearchResult
                  @navigate: dynamic from result
                  @auth: required
                  @env: NEXT_PUBLIC_CONVEX_URL
                */}
                <Link href={r.href} className="block">
                  <p className="font-medium text-foreground">{r.title}</p>
                  <p className="text-caption text-muted-foreground">{r.subtitle}</p>
                </Link>
              </SoftCard>
            </li>
          ))}
        </ul>
      </div>
    </ScreenSurface>
  );
}
