/**
 * @screen: search
 * @category: You
 * @source: docs/design/claude-export/design-system/screens-5.jsx
 * @summary: Global search with previews.
 * @queries: search.all
 * @mutations: (none)
 * @auth: required
 */
import { Suspense } from "react";
import { ProfileReady } from "@/components/today/ProfileReady";
import { SearchScreen } from "@/components/global-search/SearchScreen";

export default function Page() {
  return (
    <main className="mx-auto w-full max-w-4xl p-8" data-testid="search-route">
      <h1 className="mb-6 font-heading text-4xl font-semibold text-foreground">Search</h1>
      <ProfileReady>
        <Suspense fallback={null}>
          <SearchScreen />
        </Suspense>
      </ProfileReady>
    </main>
  );
}
