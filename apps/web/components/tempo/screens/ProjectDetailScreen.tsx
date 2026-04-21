"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Pill, SoftCard, TaskRow } from "@tempo/ui/primitives";
import { mockNotes, mockProjects, mockTasks } from "@tempo/mock-data";
import { ScreenHeader } from "@/components/tempo/ScreenHeader";
import { useDemoToast } from "@/components/tempo/DemoToast";

type Props = { projectId: string };
type Tab = "tasks" | "notes" | "timeline";

/**
 * ProjectDetailScreen — tabs: tasks / notes / timeline.
 * @source docs/design/claude-export/design-system/screens-4.jsx (ScreenProjectDetail)
 */
export function ProjectDetailScreen({ projectId }: Props) {
  const router = useRouter();
  const toast = useDemoToast();
  const project = useMemo(
    () => mockProjects.find((p) => p.id === projectId) ?? mockProjects[0],
    [projectId],
  );
  const [tab, setTab] = useState<Tab>("tasks");
  const [done, setDone] = useState<Record<string, boolean>>(
    Object.fromEntries(mockTasks.map((t) => [t.id, t.status === "done"])),
  );

  return (
    <div className="flex flex-col">
      <ScreenHeader
        eyebrow={project.color}
        title={project.title}
        lede={`${project.openTaskCount} open · ${project.dueDateLabel}`}
        badge={{ label: project.color, tone: "orange" }}
        right={
          <>
            <Button variant="ghost" size="sm" onClick={() => router.push("/projects")}>
              ← Projects
            </Button>
            {/*
             * @behavior: Open kanban view for this project.
             * @navigate: /projects/{projectId}/kanban
             */}
            <Button
              variant="soft"
              size="sm"
              onClick={() => router.push(`/projects/${project.id}/kanban`)}
            >
              Kanban →
            </Button>
          </>
        }
      />

      <div className="px-6 py-6">
        <div className="mb-4 flex gap-2">
          {(["tasks", "notes", "timeline"] as const).map((t) => (
            /*
             * @behavior: Switch between project tabs.
             * @convex-query-needed: projects.byId + tab-specific list
             */
            <Button
              key={t}
              variant={tab === t ? "primary" : "subtle"}
              size="sm"
              onClick={() => setTab(t)}
            >
              {t}
            </Button>
          ))}
        </div>

        {tab === "tasks" ? (
          <SoftCard tone="default" padding="md">
            <div className="flex flex-col gap-1">
              {mockTasks.map((task) => (
                <TaskRow
                  key={task.id}
                  taskId={task.id}
                  title={task.title}
                  done={done[task.id]}
                  meta={`${task.dueDateLabel} · ${task.estimateMinutes}m`}
                  onToggle={(id, next) => {
                    /*
                     * @behavior: Mark project task complete.
                     * @convex-mutation-needed: tasks.complete
                     */
                    setDone((prev) => ({ ...prev, [id]: next }));
                    toast(next ? "Completed. (demo)" : "Reopened. (demo)");
                  }}
                />
              ))}
            </div>
          </SoftCard>
        ) : null}

        {tab === "notes" ? (
          <div className="grid gap-3 md:grid-cols-2">
            {mockNotes.map((note) => (
              <SoftCard key={note.id} tone="default" padding="md">
                <div className="font-eyebrow">{note.type}</div>
                <h3 className="mt-1 font-serif text-h4">{note.title}</h3>
                <p className="mt-2 text-small text-muted-foreground">
                  {note.excerpt}
                </p>
              </SoftCard>
            ))}
          </div>
        ) : null}

        {tab === "timeline" ? (
          <SoftCard tone="default" padding="md">
            <ol className="relative border-l border-border-soft pl-5">
              {[
                { id: "t1", label: "Project created", date: "Apr 4" },
                { id: "t2", label: "Milestone: design complete", date: "Apr 12" },
                { id: "t3", label: "Review with Sam", date: "Apr 18" },
                { id: "t4", label: "Ship to production (target)", date: "Apr 28" },
              ].map((step) => (
                <li key={step.id} className="mb-4">
                  <span className="absolute -left-1.5 mt-1 block h-3 w-3 rounded-full bg-primary" />
                  <div className="flex items-center gap-2">
                    <span className="font-tabular text-caption text-muted-foreground">
                      {step.date}
                    </span>
                    <Pill tone="slate">milestone</Pill>
                  </div>
                  <p className="mt-1 text-body">{step.label}</p>
                </li>
              ))}
            </ol>
          </SoftCard>
        ) : null}
      </div>
    </div>
  );
}
