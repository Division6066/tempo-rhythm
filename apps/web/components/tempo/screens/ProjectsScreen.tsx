"use client";

import { useRouter } from "next/navigation";
import { Button, Pill, SoftCard } from "@tempo/ui/primitives";
import { mockProjects } from "@tempo/mock-data";
import { ScreenHeader } from "@/components/tempo/ScreenHeader";
import { useDemoToast } from "@/components/tempo/DemoToast";

/**
 * ProjectsScreen — project index with color chip + open task count.
 * @source docs/design/claude-export/design-system/screens-4.jsx (ScreenProjects)
 */
export function ProjectsScreen() {
  const router = useRouter();
  const toast = useDemoToast();

  return (
    <div className="flex flex-col">
      <ScreenHeader
        eyebrow="Library"
        title="Projects"
        lede="Containers for the work, not the life. Small + few is better."
        right={
          <>
            {/*
             * @behavior: Create a new project with color and due date.
             * @convex-mutation-needed: projects.create
             */}
            <Button
              variant="primary"
              size="sm"
              onClick={() => toast("Created. (demo) projects.create.")}
            >
              + New project
            </Button>
          </>
        }
      />

      <div className="grid gap-5 px-6 py-6 md:grid-cols-2">
        {mockProjects.map((project) => (
          <SoftCard key={project.id} tone="default" padding="md">
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block h-3 w-3 rounded-full"
                    style={{
                      backgroundColor:
                        project.color === "terracotta"
                          ? "var(--color-tempo-orange)"
                          : project.color === "moss"
                            ? "var(--color-moss)"
                            : "var(--color-slate-blue)",
                    }}
                    aria-hidden
                  />
                  <span className="font-eyebrow">{project.color}</span>
                </div>
                {/*
                 * @behavior: Open project detail with tasks + notes + timeline tabs.
                 * @navigate: /projects/{projectId}
                 */}
                <button
                  type="button"
                  className="text-left font-serif text-h3 hover:underline"
                  onClick={() => router.push(`/projects/${project.id}`)}
                >
                  {project.title}
                </button>
                <div className="flex items-center gap-2">
                  <Pill tone="neutral">{project.dueDateLabel}</Pill>
                  <Pill tone="orange">
                    {project.openTaskCount} open tasks
                  </Pill>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {/*
                 * @behavior: Open project kanban view.
                 * @navigate: /projects/{projectId}/kanban
                 */}
                <Button
                  variant="soft"
                  size="sm"
                  onClick={() => router.push(`/projects/${project.id}/kanban`)}
                >
                  Kanban →
                </Button>
              </div>
            </div>
          </SoftCard>
        ))}
      </div>
    </div>
  );
}
