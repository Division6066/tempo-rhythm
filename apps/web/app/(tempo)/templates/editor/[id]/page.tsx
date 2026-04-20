/**
 * @screen: template-editor
 * @category: You
 * @source: docs/design/claude-export/design-system/screens-5.jsx (legacy editor)
 * @queries: templates.getById (Long Run 2)
 * @mutations: templates.updateMarkdown
 * @auth: required
 * @env: NEXT_PUBLIC_CONVEX_URL
 */
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { mockMyTemplates } from "@tempo/mock-data";
import { Button, SoftCard } from "@tempo/ui/primitives";
import { ScreenSurface, type ViewMode } from "@/components/tempo-port/ScreenSurface";

export default function Page() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const [mode, setMode] = useState<ViewMode>("ready");
  const tpl = useMemo(() => mockMyTemplates.find((t) => t.id === id), [id]);
  const [body, setBody] = useState(
    `# ${tpl?.name ?? "Template"}\n\nStep one…\n\nStep two…`,
  );

  return (
    <ScreenSurface mode={mode} onModeChange={setMode}>
      <div className="mx-auto max-w-3xl space-y-6 p-6 pb-24 md:p-8">
        <Link href="/templates" className="text-small text-muted-foreground hover:text-foreground">
          ← Templates
        </Link>
        <h1 className="text-h1 font-serif text-foreground">Edit · {tpl?.name ?? id}</h1>
        <SoftCard padding="md">
          <label htmlFor="tpl-md" className="sr-only">
            Markdown
          </label>
          <textarea
            id="tpl-md"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={18}
            className="w-full resize-y rounded-lg border border-border bg-transparent p-3 font-mono text-small text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </SoftCard>
        {/*
          @action saveTemplateMarkdown
          @mutation: templates.updateMarkdown (Long Run 2)
          @auth: required
          @errors: toast
          @env: NEXT_PUBLIC_CONVEX_URL
        */}
        <Button type="button" variant="primary">
          Save
        </Button>
      </div>
    </ScreenSurface>
  );
}
