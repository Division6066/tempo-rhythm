/**
 * @screen: project-detail
 * @category: Library
 * @source: docs/design/claude-export/design-system/screens-4.jsx
 * @queries: projects.getById (Long Run 2), tasks.listByProjectId (Long Run 2)
 * @mutations: tasks.softDelete @index by_userId_deletedAt
 * @routes-to: /projects/[id]/kanban
 * @auth: required
 * @env: NEXT_PUBLIC_CONVEX_URL
 */
"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  mockProjectDetailTasks,
  mockProjectLinkedNoteTitles,
  mockProjects,
} from "@tempo/mock-data";
import { Button, SoftCard, TaskRow } from "@tempo/ui/primitives";
import { ScreenSurface, type ViewMode } from "@/components/tempo-port/ScreenSurface";

export default function Page() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === "string" ? params.id : "";
  const [mode, setMode] = useState<ViewMode>("ready");
  const [tasks, setTasks] = useState(() =>
    id === "proj-tempo-10"
      ? mockProjectDetailTasks.map((t) => ({ ...t, done: t.status === "done" }))
      : [],
  );

  const project = useMemo(() => mockProjects.find((p) => p.id === id) ?? null, [id]);

  const toggle = (taskId: string, next: boolean) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, done: next, status: next ? ("done" as const) : ("todo" as const) } : t,
      ),
    );
  };

  if (!project) {
    return (
      <ScreenSurface mode={mode} onModeChange={setMode}>
        <div className="p-8">
          <SoftCard padding="md">
            <p className="text-muted-foreground">Project not found.</p>
            <Link href="/projects" className="mt-4 inline-block text-primary underline">
              Back to projects
            </Link>
          </SoftCard>
        </div>
      </ScreenSurface>
    );
  }

  return (
    <ScreenSurface mode={mode} onModeChange={setMode}>
      <div className="mx-auto max-w-4xl space-y-8 p-6 pb-24 md:p-8">
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/projects" className="text-small text-muted-foreground hover:text-foreground">
            ← Projects
          </Link>
          {/*
            @action openProjectKanban
            @navigate: /projects/{id}/kanban
            @query: tasks.listByProject (Long Run 2)
            @auth: required
            @env: NEXT_PUBLIC_CONVEX_URL
          */}
          <Button type="button" variant="soft" size="sm" onClick={() => router.push(`/projects/${id}/kanban`)}>
            Kanban
          </Button>
        </div>
        <header>
          <h1 className="text-h1 font-serif text-foreground">{project.name}</h1>
          <p className="mt-2 text-body text-muted-foreground">
            {project.taskIds.length} tasks · {project.noteIds.length} notes linked
          </p>
        </header>

        <SoftCard padding="md">
          <h2 className="font-eyebrow text-muted-foreground">Tasks</h2>
          <div className="mt-3 divide-y divide-border-soft">
            {tasks.length === 0 ? (
              <p className="py-4 text-small text-muted-foreground">No tasks in mock for this project.</p>
            ) : (
              tasks.map((t) => (
                <TaskRow
                  key={t.id}
                  taskId={t.id}
                  title={t.title}
                  done={t.done}
                  meta={[t.dueLabel, t.estimatedMinutes != null ? `${t.estimatedMinutes} min` : ""]
                    .filter(Boolean)
                    .join(" · ")}
                  onToggle={(tid, next) => toggle(tid, next)}
                />
              ))
            )}
          </div>
        </SoftCard>

        <SoftCard tone="sunken" padding="md">
          <h2 className="font-eyebrow text-muted-foreground">Linked notes</h2>
          <ul className="mt-2 list-inside list-disc text-small text-foreground">
            {mockProjectLinkedNoteTitles.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </SoftCard>
      </div>
    </ScreenSurface>
  );
}
