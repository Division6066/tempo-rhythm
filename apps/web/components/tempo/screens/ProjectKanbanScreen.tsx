"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Pill, SoftCard } from "@tempo/ui/primitives";
import { mockProjects, mockTasks } from "@tempo/mock-data";
import { ScreenHeader } from "@/components/tempo/ScreenHeader";
import { useDemoToast } from "@/components/tempo/DemoToast";

type Props = { projectId: string };
type Lane = "todo" | "in_progress" | "review" | "done";

const LANES: { id: Lane; label: string; tone: "neutral" | "amber" | "slate" | "moss" }[] = [
  { id: "todo", label: "To do", tone: "neutral" },
  { id: "in_progress", label: "In progress", tone: "amber" },
  { id: "review", label: "Review", tone: "slate" },
  { id: "done", label: "Done", tone: "moss" },
];

/**
 * ProjectKanbanScreen — four-lane kanban board. Move via buttons (drag is demo-only).
 * @source docs/design/claude-export/design-system/screens-4.jsx (ScreenProjectKanban)
 */
export function ProjectKanbanScreen({ projectId }: Props) {
  const router = useRouter();
  const toast = useDemoToast();
  const project = useMemo(
    () => mockProjects.find((p) => p.id === projectId) ?? mockProjects[0],
    [projectId],
  );

  // Seed lanes from mock tasks
  const [laneMap, setLaneMap] = useState<Record<Lane, string[]>>({
    todo: mockTasks.filter((t) => t.status === "todo").map((t) => t.id),
    in_progress: mockTasks.filter((t) => t.status === "in_progress").map((t) => t.id),
    review: [],
    done: mockTasks.filter((t) => t.status === "done").map((t) => t.id),
  });

  const taskById = useMemo(() => {
    const map = new Map<string, (typeof mockTasks)[number]>();
    for (const t of mockTasks) map.set(t.id, t);
    return map;
  }, []);

  const move = (taskId: string, to: Lane) => {
    /*
     * @behavior: Move a card between lanes.
     * @convex-mutation-needed: kanban.moveCard
     * @optimistic: move locally, server reconciles
     */
    setLaneMap((prev) => {
      const next: Record<Lane, string[]> = {
        todo: prev.todo.filter((id) => id !== taskId),
        in_progress: prev.in_progress.filter((id) => id !== taskId),
        review: prev.review.filter((id) => id !== taskId),
        done: prev.done.filter((id) => id !== taskId),
      };
      next[to] = [...next[to], taskId];
      return next;
    });
    toast(`Moved to ${to}. (demo) kanban.moveCard.`);
  };

  return (
    <div className="flex flex-col">
      <ScreenHeader
        eyebrow={project.title}
        title="Kanban"
        lede="Drag is frontend-only in the demo. Click the → buttons to advance a card."
        right={
          <Button variant="ghost" size="sm" onClick={() => router.push(`/projects/${project.id}`)}>
            ← Detail
          </Button>
        }
      />

      <div className="grid gap-4 overflow-x-auto px-6 py-6 md:grid-cols-4">
        {LANES.map((lane) => (
          <SoftCard
            key={lane.id}
            tone="sunken"
            padding="md"
            className="min-h-[320px]"
          >
            <div className="mb-3 flex items-center justify-between">
              <Pill tone={lane.tone}>{lane.label}</Pill>
              <span className="font-tabular text-caption text-muted-foreground">
                {laneMap[lane.id].length}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {laneMap[lane.id].map((id) => {
                const task = taskById.get(id);
                if (!task) return null;
                const nextLane =
                  lane.id === "todo"
                    ? "in_progress"
                    : lane.id === "in_progress"
                      ? "review"
                      : lane.id === "review"
                        ? "done"
                        : null;
                return (
                  <div
                    key={task.id}
                    className="flex flex-col gap-2 rounded-lg bg-card p-3 shadow-whisper"
                  >
                    <span className="text-body">{task.title}</span>
                    <div className="flex items-center justify-between">
                      <span className="text-caption text-muted-foreground">
                        {task.estimateMinutes}m · {task.energy}
                      </span>
                      {nextLane ? (
                        <Button
                          variant="soft"
                          size="sm"
                          onClick={() => move(task.id, nextLane)}
                        >
                          →
                        </Button>
                      ) : null}
                    </div>
                  </div>
                );
              })}
              {laneMap[lane.id].length === 0 ? (
                <div className="rounded-lg border border-dashed border-border-soft p-4 text-center text-caption text-muted-foreground">
                  empty
                </div>
              ) : null}
            </div>
          </SoftCard>
        ))}
      </div>
    </div>
  );
}
