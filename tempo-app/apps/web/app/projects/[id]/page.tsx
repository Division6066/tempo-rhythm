"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import AppLayout from "@/components/AppLayout";
import TaskCard from "@/components/TaskCard";
import Link from "next/link";
import { ChevronLeft, FolderGit2, FileText } from "lucide-react";

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const projectId = id as Id<"projects">;

  const project = useQuery(api.projects.get, { id: projectId });
  const allTasks = useQuery(api.tasks.getAllTasks);
  const notes = useQuery(api.notes.getNotesByProject, { projectId });

  if (project === undefined) {
    return (
      <AppLayout>
        <div className="flex h-[50vh] items-center justify-center">
          <div className="w-16 h-16 rounded-full animate-breathe bg-primary/20" />
        </div>
      </AppLayout>
    );
  }

  if (project === null) {
    return (
      <AppLayout>
        <div className="text-center py-16">
          <p className="text-muted-foreground">Project not found.</p>
          <Link href="/projects" className="text-primary hover:underline text-sm mt-2 block">
            Back to Projects
          </Link>
        </div>
      </AppLayout>
    );
  }

  const projectTasks = (allTasks ?? []).filter((t) => t.projectId === projectId);
  const activeTasks = projectTasks.filter((t) => t.status !== "done");
  const completedTasks = projectTasks.filter((t) => t.status === "done");

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/projects" className="flex items-center gap-1 hover:text-foreground transition-colors">
            <ChevronLeft size={14} />
            Projects
          </Link>
        </div>

        <div
          className="rounded-2xl p-6 border border-border/50"
          style={{ background: `linear-gradient(135deg, ${project.color ?? "#6C63FF"}20, ${project.color ?? "#6C63FF"}05)` }}
        >
          <div className="flex items-start gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${project.color ?? "#6C63FF"}30` }}
            >
              <FolderGit2 size={24} style={{ color: project.color ?? "#6C63FF" }} />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-foreground">{project.name}</h1>
              {project.description && (
                <p className="text-muted-foreground mt-1 text-sm">{project.description}</p>
              )}
              <div className="flex items-center gap-3 mt-3">
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                  {activeTasks.length} active task{activeTasks.length !== 1 ? "s" : ""}
                </span>
                <span className="text-xs text-muted-foreground">
                  {completedTasks.length} completed
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Active Tasks
          </h2>
          {activeTasks.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4 text-center">No active tasks in this project.</p>
          ) : (
            <div className="space-y-2">
              {activeTasks.map((task) => (
                <TaskCard key={task._id} task={task} />
              ))}
            </div>
          )}
        </div>

        {completedTasks.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-border/50">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Completed
            </h2>
            <div className="opacity-60 space-y-2">
              {completedTasks.map((task) => (
                <TaskCard key={task._id} task={task} />
              ))}
            </div>
          </div>
        )}

        {(notes ?? []).length > 0 && (
          <div className="space-y-4 pt-4 border-t border-border/50">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <FileText size={12} />
              Notes
            </h2>
            <div className="space-y-2">
              {(notes ?? []).map((note) => (
                <Link key={note._id} href={`/notes/${note._id}`}>
                  <div className="glass p-4 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-white/5 transition-all">
                    <p className="font-medium text-sm">{note.title}</p>
                    {note.content && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{note.content}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
