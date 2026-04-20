import type { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
};

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div
      className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
      dir="rtl"
    >
      <div>
        <h1 className="font-bold text-3xl tracking-tight text-foreground">{title}</h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-muted-foreground text-sm leading-relaxed">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function AppPageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[calc(100vh-5rem)] bg-background px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-5xl">{children}</div>
    </div>
  );
}
