"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export type TemplatePeriod = "daily" | "weekly" | "monthly" | "none";

export type TemplateCardModel = {
  templateId: string;
  source: "starter" | "user";
  name: string;
  description?: string;
  periodType: TemplatePeriod;
  sections: string[];
};

const PERIOD_LABEL: Record<TemplatePeriod, string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  none: "Anytime",
};

const SECTION_PREVIEW_LIMIT = 4;

export function templatePath(kind: "run" | "editor", templateId: string): string {
  return `/templates/${kind}/${encodeURIComponent(templateId)}`;
}

type TemplateCardProps = {
  template: TemplateCardModel;
  confirming: boolean;
  deleting: boolean;
  onAskDelete: (templateId: string) => void;
  onConfirmDelete: (templateId: string) => void;
  onCancelDelete: () => void;
};

export function TemplateCard({
  template,
  confirming,
  deleting,
  onAskDelete,
  onConfirmDelete,
  onCancelDelete,
}: TemplateCardProps) {
  const preview = template.sections.slice(0, SECTION_PREVIEW_LIMIT);
  const hiddenCount = template.sections.length - preview.length;
  const own = template.source === "user";
  const useHref = templatePath("run", template.templateId);
  const editHref = templatePath("editor", template.templateId);

  return (
    <article
      data-template-id={template.templateId}
      className="rounded-2xl border border-border bg-card p-4 shadow-card"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-medium text-foreground">{template.name}</h2>
            <span className="rounded-pill bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              {PERIOD_LABEL[template.periodType]}
            </span>
          </div>
          {template.description ? (
            <p className="text-sm text-muted-foreground">{template.description}</p>
          ) : null}
          {preview.length > 0 ? (
            <ul aria-label={`${template.name} sections`} className="flex flex-wrap gap-2">
              {preview.map((section) => (
                <li
                  key={section}
                  className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground"
                >
                  {section}
                </li>
              ))}
              {hiddenCount > 0 ? (
                <li className="px-1 py-1 text-xs text-muted-foreground">{hiddenCount} more</li>
              ) : null}
            </ul>
          ) : (
            <p className="text-xs text-muted-foreground">No section headings</p>
          )}
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Button asChild variant="outline">
            <Link href={useHref} aria-label={`Use ${template.name}`}>
              Use
            </Link>
          </Button>
          {own ? (
            <Button asChild variant="outline">
              <Link href={editHref} aria-label={`Edit ${template.name}`}>
                Edit
              </Link>
            </Button>
          ) : null}
          {own && confirming ? (
            <>
              <Button
                type="button"
                variant="destructive"
                aria-label={`Confirm delete ${template.name}`}
                disabled={deleting}
                onClick={() => onConfirmDelete(template.templateId)}
              >
                Confirm delete
              </Button>
              <Button
                type="button"
                variant="outline"
                aria-label={`Cancel delete ${template.name}`}
                disabled={deleting}
                onClick={onCancelDelete}
              >
                Cancel
              </Button>
            </>
          ) : null}
          {own && !confirming ? (
            <Button
              type="button"
              variant="outline"
              aria-label={`Delete ${template.name}`}
              onClick={() => onAskDelete(template.templateId)}
            >
              Delete
            </Button>
          ) : null}
        </div>
      </div>
    </article>
  );
}
