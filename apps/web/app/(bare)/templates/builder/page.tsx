/**
 * @screen: template-builder
 * @category: You (bare shell)
 * @source: docs/design/claude-export/design-system/screens-template-builder.jsx
 * @queries: templates.getDraft (Long Run 2)
 * @mutations: templates.saveDraft
 * @auth: required
 * @env: NEXT_PUBLIC_CONVEX_URL
 */
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Field, SoftCard } from "@tempo/ui/primitives";
import { ScreenSurface, type ViewMode } from "@/components/tempo-port/ScreenSurface";

export default function Page() {
  const router = useRouter();
  const [mode, setMode] = useState<ViewMode>("ready");
  const [name, setName] = useState("Untitled template");

  return (
    <ScreenSurface mode={mode} onModeChange={setMode}>
      <div className="mx-auto max-w-3xl space-y-8 p-6 pb-24 md:p-8">
        <header className="flex items-center justify-between gap-4">
          <h1 className="text-h1 font-serif text-foreground">Template builder</h1>
          <Button type="button" variant="ghost" size="sm" onClick={() => router.push("/templates")}>
            Close
          </Button>
        </header>
        <SoftCard padding="md" className="space-y-4">
          <Field label="Name" name="name" value={name} onChange={(e) => setName(e.target.value)} />
          <p className="text-small text-muted-foreground">
            Add steps on the left, preview on the right — Long Run 2 persists templateItems in Convex.
          </p>
          {/*
            @action saveTemplateDraft
            @mutation: templates.saveDraft (Long Run 2)
            @index: n/a until schema
            @auth: required
            @errors: toast
            @env: NEXT_PUBLIC_CONVEX_URL
          */}
          <Button type="button" variant="primary">
            Save draft
          </Button>
        </SoftCard>
      </div>
    </ScreenSurface>
  );
}
