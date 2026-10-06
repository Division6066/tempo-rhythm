"use client";

import { useMutation, useQuery } from "convex/react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useUserReady } from "@/lib/useUserReady";
import { TemplateCard, type TemplateCardModel } from "./TemplateCard";

type LibraryScope = "all" | "starter" | "mine";

type ListedTemplate = TemplateCardModel & {
  body: string;
  updatedAt?: number;
};

const TABS: { id: LibraryScope; label: string }[] = [
  { id: "all", label: "All" },
  { id: "starter", label: "Starter" },
  { id: "mine", label: "Mine" },
];

function visibleTemplates(templates: ListedTemplate[], scope: LibraryScope): ListedTemplate[] {
  if (scope === "starter") {
    return templates.filter((template) => template.source === "starter");
  }
  if (scope === "mine") {
    return templates.filter((template) => template.source === "user");
  }
  return templates;
}

function emptyCopy(scope: LibraryScope): { title: string; detail: string } {
  if (scope === "starter") {
    return {
      title: "No starter templates to show.",
      detail: "The starter set will appear here when it is available.",
    };
  }
  if (scope === "mine") {
    return {
      title: "No templates of your own yet.",
      detail: "New template starts a blank one you can shape.",
    };
  }
  return {
    title: "No templates yet.",
    detail: "Starters and templates you make will sit here together.",
  };
}

export function TemplatesLibrary() {
  const userReady = useUserReady();
  const templates = useQuery(api.templates.list, userReady ? { scope: "all" } : "skip");
  const remove = useMutation(api.templates.remove);
  const [scope, setScope] = useState<LibraryScope>("all");
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState("");

  const selectScope = (next: LibraryScope) => {
    setScope(next);
    setPendingDeleteId(null);
    setDeleteError("");
  };

  const confirmDelete = async (templateId: string) => {
    setDeletingId(templateId);
    setDeleteError("");
    try {
      await remove({ templateId: templateId as Id<"templates"> });
      setPendingDeleteId((current) => (current === templateId ? null : current));
    } catch {
      setDeleteError("Could not delete that template. It is still here.");
    } finally {
      setDeletingId((current) => (current === templateId ? null : current));
    }
  };

  return (
    <main className="container mx-auto max-w-4xl px-6 py-12">
      <div className="space-y-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-eyebrow text-muted-foreground">Library</p>
            <h1 className="font-heading text-4xl font-semibold text-foreground">Templates</h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Starter outlines and templates you have made.
            </p>
          </div>
          <Button asChild>
            <Link href="/templates/builder">New template</Link>
          </Button>
        </header>

        <div role="tablist" aria-label="Template source" className="flex flex-wrap gap-2">
          {TABS.map((tab) => {
            const selected = scope === tab.id;
            return (
              <Button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={selected}
                variant={selected ? "default" : "outline"}
                onClick={() => selectScope(tab.id)}
              >
                {tab.label}
              </Button>
            );
          })}
        </div>

        {templates === undefined ? (
          <div aria-busy="true" aria-live="polite" className="space-y-3">
            <p className="sr-only">Loading templates.</p>
            <div className="h-28 animate-pulse rounded-2xl bg-muted motion-reduce:animate-none" />
            <div className="h-28 animate-pulse rounded-2xl bg-muted motion-reduce:animate-none" />
            <div className="h-28 animate-pulse rounded-2xl bg-muted motion-reduce:animate-none" />
          </div>
        ) : (
          <TemplateList
            templates={visibleTemplates(templates, scope)}
            scope={scope}
            pendingDeleteId={pendingDeleteId}
            deletingId={deletingId}
            deleteError={deleteError}
            onAskDelete={(templateId) => {
              setDeleteError("");
              setPendingDeleteId(templateId);
            }}
            onConfirmDelete={(templateId) => {
              void confirmDelete(templateId);
            }}
            onCancelDelete={() => setPendingDeleteId(null)}
          />
        )}
      </div>
    </main>
  );
}

type TemplateListProps = {
  templates: ListedTemplate[];
  scope: LibraryScope;
  pendingDeleteId: string | null;
  deletingId: string | null;
  deleteError: string;
  onAskDelete: (templateId: string) => void;
  onConfirmDelete: (templateId: string) => void;
  onCancelDelete: () => void;
};

function TemplateList({
  templates,
  scope,
  pendingDeleteId,
  deletingId,
  deleteError,
  onAskDelete,
  onConfirmDelete,
  onCancelDelete,
}: TemplateListProps) {
  if (templates.length === 0) {
    const copy = emptyCopy(scope);
    return (
      <div className="rounded-3xl border border-dashed border-border bg-card/70 px-6 py-12 text-center">
        <p className="text-lg font-medium text-foreground">{copy.title}</p>
        <p className="mt-2 text-sm text-muted-foreground">{copy.detail}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {deleteError ? (
        <p role="alert" className="text-sm text-destructive">
          {deleteError}
        </p>
      ) : null}
      <ul className="space-y-3">
        {templates.map((template) => (
          <li key={template.templateId}>
            <TemplateCard
              template={template}
              confirming={pendingDeleteId === template.templateId}
              deleting={deletingId === template.templateId}
              onAskDelete={onAskDelete}
              onConfirmDelete={onConfirmDelete}
              onCancelDelete={onCancelDelete}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
