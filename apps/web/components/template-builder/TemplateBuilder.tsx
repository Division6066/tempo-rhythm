"use client";

import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { type ReactNode, useState } from "react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useUserReady } from "@/lib/useUserReady";
import { type TemplateDraft, TemplateForm } from "./TemplateForm";

const EMPTY_DRAFT: TemplateDraft = {
  name: "",
  description: "",
  periodType: "daily",
  body: "",
};

function Screen({
  title,
  detail,
  children,
}: {
  title: string;
  detail?: string;
  children: ReactNode;
}) {
  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-12">
      <header className="flex flex-col gap-2">
        <p className="font-eyebrow text-muted-foreground">Template</p>
        <h1 className="font-heading text-4xl text-foreground">{title}</h1>
        {detail ? <p className="text-muted-foreground">{detail}</p> : null}
      </header>
      {children}
    </main>
  );
}

function Loading() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <p aria-live="polite">Loading this template…</p>
    </main>
  );
}

function NotFound() {
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

function draftFromTemplate(template: {
  name: string;
  description?: string;
  periodType: TemplateDraft["periodType"];
  body: string;
}): TemplateDraft {
  return {
    name: template.name,
    description: template.description ?? "",
    periodType: template.periodType,
    body: template.body,
  };
}

export function TemplateBuilderScreen({ fromId }: { fromId?: string }) {
  const router = useRouter();
  const userReady = useUserReady();
  const template = useQuery(
    api.templates.get,
    fromId && userReady ? { templateId: fromId } : "skip",
  );
  const create = useMutation(api.templates.create);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  if (fromId && template === undefined) {
    return <Loading />;
  }
  if (fromId && template === null) {
    return <NotFound />;
  }

  const initial = template ? draftFromTemplate(template) : EMPTY_DRAFT;

  const onSave = async (values: TemplateDraft) => {
    if (pending) return;
    setPending(true);
    setError("");
    const description = values.description.trim();
    try {
      await create({
        name: values.name.trim(),
        periodType: values.periodType,
        body: values.body,
        ...(description ? { description } : {}),
      });
      router.push("/templates");
    } catch {
      setError("Could not save this template. You can try again.");
      setPending(false);
    }
  };

  return (
    <Screen
      title={fromId ? "Your copy" : "New template"}
      detail={
        fromId
          ? "This starts from an outline. Change what you want, then save."
          : "Give it a name, then save. You can change it later."
      }
    >
      <TemplateForm
        key={fromId ?? "blank"}
        initial={initial}
        pending={pending}
        error={error}
        onSave={onSave}
      />
    </Screen>
  );
}

export function TemplateEditorScreen({ templateId }: { templateId: string }) {
  const router = useRouter();
  const userReady = useUserReady();
  const template = useQuery(api.templates.get, userReady ? { templateId } : "skip");
  const update = useMutation(api.templates.update);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  if (template === undefined) {
    return <Loading />;
  }
  if (template === null) {
    return <NotFound />;
  }

  const readOnly = template.source === "starter";

  const onSave = async (values: TemplateDraft) => {
    if (pending || readOnly) return;
    setPending(true);
    setError("");
    setNotice("");
    try {
      await update({
        templateId: templateId as Id<"templates">,
        name: values.name.trim(),
        description: values.description.trim(),
        periodType: values.periodType,
        body: values.body,
      });
      setNotice("Saved.");
      setPending(false);
    } catch {
      setError("Could not save this template. You can try again.");
      setPending(false);
    }
  };

  return (
    <Screen
      title={readOnly ? template.name : "Edit template"}
      detail={
        readOnly
          ? "This starter is read-only. Make a copy if you want to change it."
          : "Change the name, period, or outline, then save."
      }
    >
      <TemplateForm
        key={template.templateId}
        initial={draftFromTemplate(template)}
        readOnly={readOnly}
        pending={pending}
        error={error}
        notice={notice}
        onEdit={() => setNotice("")}
        onSave={readOnly ? undefined : onSave}
        onCopy={
          readOnly
            ? () => {
                router.push(`/templates/builder?from=${encodeURIComponent(template.templateId)}`);
              }
            : undefined
        }
      />
    </Screen>
  );
}
