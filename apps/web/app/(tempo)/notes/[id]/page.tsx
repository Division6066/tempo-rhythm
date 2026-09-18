import { Suspense } from "react";
import { NoteIdPage } from "@/lib/tempo-graft/flow-pages";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <NoteIdPage />
    </Suspense>
  );
}
