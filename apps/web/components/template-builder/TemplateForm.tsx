"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type PeriodType = "daily" | "weekly" | "monthly" | "none";

export type TemplateDraft = {
  name: string;
  description: string;
  periodType: PeriodType;
  body: string;
};

const PERIODS: { value: PeriodType; label: string }[] = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "none", label: "Anytime" },
];

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
  if (blocks.length === 0) {
    return <p className="text-muted-foreground">Nothing to preview yet.</p>;
  }

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

function isPeriodType(value: string): value is PeriodType {
  return value === "daily" || value === "weekly" || value === "monthly" || value === "none";
}

type TemplateFormProps = {
  initial: TemplateDraft;
  readOnly?: boolean;
  pending?: boolean;
  error?: string;
  notice?: string;
  onSave?: (values: TemplateDraft) => void;
  onCopy?: () => void;
  onEdit?: () => void;
};

export function TemplateForm({
  initial,
  readOnly = false,
  pending = false,
  error = "",
  notice = "",
  onSave,
  onCopy,
  onEdit,
}: TemplateFormProps) {
  const [name, setName] = useState(initial.name);
  const [description, setDescription] = useState(initial.description);
  const [periodType, setPeriodType] = useState<PeriodType>(initial.periodType);
  const [body, setBody] = useState(initial.body);
  const canSave = name.trim().length > 0 && !readOnly && !pending && Boolean(onSave);

  const editName = (value: string) => {
    setName(value);
    onEdit?.();
  };
  const editDescription = (value: string) => {
    setDescription(value);
    onEdit?.();
  };
  const editPeriod = (value: string) => {
    if (!isPeriodType(value)) return;
    setPeriodType(value);
    onEdit?.();
  };
  const editBody = (value: string) => {
    setBody(value);
    onEdit?.();
  };

  const submit = () => {
    if (!canSave || !onSave) return;
    onSave({
      name: name.trim(),
      description,
      periodType,
      body,
    });
  };

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="template-name">Name</Label>
        <Input
          id="template-name"
          type="text"
          value={name}
          required
          disabled={readOnly}
          placeholder="Template name"
          onChange={(event) => editName(event.target.value)}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="template-description">Description</Label>
        <Input
          id="template-description"
          type="text"
          value={description}
          disabled={readOnly}
          placeholder="Optional. A sentence about when to use this."
          onChange={(event) => editDescription(event.target.value)}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="template-period">Period</Label>
        <select
          id="template-period"
          value={periodType}
          disabled={readOnly}
          onChange={(event) => editPeriod(event.target.value)}
          className="min-h-11 w-full rounded-xl border border-border bg-background px-3 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-70"
        >
          {PERIODS.map((period) => (
            <option key={period.value} value={period.value}>
              {period.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="template-body">Outline</Label>
        <textarea
          id="template-body"
          value={body}
          rows={12}
          disabled={readOnly}
          placeholder="Write the outline in markdown."
          onChange={(event) => editBody(event.target.value)}
          className="w-full resize-y rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-70"
        />
      </div>
      <section aria-label="Preview" className="rounded-2xl border border-border bg-card p-4">
        <h2 className="mb-3 font-heading text-xl text-foreground">Preview</h2>
        <MarkdownPreview body={body} />
      </section>
      {error ? (
        <p className="text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      {notice ? (
        <p className="text-muted-foreground" aria-live="polite">
          {notice}
        </p>
      ) : null}
      <div className="flex gap-3">
        {readOnly ? (
          <Button type="button" onClick={onCopy}>
            Make my own copy
          </Button>
        ) : (
          <Button type="button" onClick={submit} disabled={!canSave}>
            {pending ? "Saving…" : "Save"}
          </Button>
        )}
      </div>
    </form>
  );
}
