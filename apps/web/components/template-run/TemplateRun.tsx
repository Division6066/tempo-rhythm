"use client";

import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/convex/_generated/api";
import { ProposalBanner } from "./ProposalBanner";

type Block =
  | { kind: "h2" | "h3" | "h4" | "p"; text: string }
  | { kind: "list"; items: { text: string; checked: boolean | null }[] };

function parseMarkdown(body: string): Block[] {
  const blocks: Block[] = [];
  let items: { text: string; checked: boolean | null }[] | null = null;

  const flushList = () => {
    if (!items) return;
    blocks.push({ kind: "list", items });
    items = null;
  };

  for (const line of body.replaceAll("\r\n", "\n").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList();
      continue;
    }

    const heading = /^(#{1,3})\s+(.*)$/.exec(trimmed);
    if (heading) {
      flushList();
      const level = heading[1]?.length ?? 1;
      const kind = level === 1 ? "h2" : level === 2 ? "h3" : "h4";
      blocks.push({ kind, text: heading[2] ?? "" });
      continue;
    }

    const check = /^[-*]\s+\[( |x|X)\]\s*(.*)$/.exec(trimmed);
    if (check) {
      items ??= [];
      items.push({
        text: check[2] ?? "",
        checked: (check[1] ?? " ").toLowerCase() === "x",
      });
      continue;
    }

    const bullet = /^[-*]\s+(.*)$/.exec(trimmed);
    if (bullet) {
      items ??= [];
      items.push({ text: bullet[1] ?? "", checked: null });
      continue;
    }

    flushList();
    blocks.push({ kind: "p", text: trimmed });
  }

  flushList();
  return blocks;
}

function MarkdownPreview({ body }: { body: string }) {
  const blocks = parseMarkdown(body);
  return (
    <div className="flex flex-col gap-3">
      {blocks.map((block, index) => {
        if (block.kind === "list") {
          return (
            <ul className="flex flex-col gap-2" key={`list-${index}`}>
              {block.items.map((item, itemIndex) => (
                <li key={`item-${index}-${itemIndex}`}>
                  {item.checked === null ? (
                    <span>{item.text}</span>
                  ) : (
                    <label className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        checked={item.checked}
                        disabled
                        onChange={() => undefined}
                      />
                      <span>{item.text}</span>
                    </label>
                  )}
                </li>
              ))}
            </ul>
          );
        }
        if (block.kind === "h2") {
          return (
            <h2 className="font-heading text-2xl text-foreground" key={`h2-${index}`}>
              {block.text}
            </h2>
          );
        }
        if (block.kind === "h3") {
          return (
            <h3 className="font-heading text-xl text-foreground" key={`h3-${index}`}>
              {block.text}
            </h3>
          );
        }
        if (block.kind === "h4") {
          return (
            <h4 className="font-medium text-foreground" key={`h4-${index}`}>
              {block.text}
            </h4>
          );
        }
        return (
          <p className="text-foreground" key={`p-${index}`}>
            {block.text}
          </p>
        );
      })}
    </div>
  );
}

export function TemplateRun({ templateId }: { templateId: string }) {
  const router = useRouter();
  const template = useQuery(api.templates.get, { templateId });
  const applyToNote = useMutation(api.templates.applyToNote);
  const [title, setTitle] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  if (template === undefined) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-12">
        <p aria-live="polite">Loading this template…</p>
      </main>
    );
  }

  if (template === null) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="font-heading text-3xl text-foreground">This template was not found</h1>
        <p className="mt-3 text-muted-foreground">
          It may have been removed. You can pick another outline.
        </p>
        <a className="mt-6 inline-block text-primary underline" href="/templates">
          Back to templates
        </a>
      </main>
    );
  }

  const onAccept = async () => {
    if (pending) return;
    setPending(true);
    setError("");
    const trimmed = title.trim();
    try {
      const id = await applyToNote(
        trimmed.length > 0 ? { templateId, title: trimmed } : { templateId }
      );
      router.push(`/notes/${id}`);
    } catch {
      setError("Could not create the page. You can try again.");
      setPending(false);
    }
  };

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-12">
      <header className="flex flex-col gap-2">
        <p className="font-eyebrow text-muted-foreground">Template</p>
        <h1 className="font-heading text-4xl text-foreground">{template.name}</h1>
        {template.description ? (
          <p className="text-muted-foreground">{template.description}</p>
        ) : null}
      </header>
      <ProposalBanner periodType={template.periodType} title={title} />
      <div className="flex flex-col gap-2">
        <Label htmlFor="template-run-title">Page title</Label>
        <Input
          id="template-run-title"
          value={title}
          placeholder="Optional"
          onChange={(event) => setTitle(event.target.value)}
        />
      </div>
      <Card>
        <CardContent className="pt-6">
          <section aria-label="Preview">
            <MarkdownPreview body={template.body} />
          </section>
        </CardContent>
      </Card>
      {error ? (
        <p className="text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      <div className="flex gap-3">
        <Button type="button" onClick={onAccept} disabled={pending}>
          {pending ? "Creating the page…" : "Accept"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/templates")}>
          Reject
        </Button>
      </div>
    </main>
  );
}
