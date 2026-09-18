import { Suspense } from "react";
import { DailyNotePage } from "@/lib/tempo-graft/flow-pages";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <DailyNotePage />
    </Suspense>
  );
}
