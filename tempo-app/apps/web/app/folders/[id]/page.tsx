"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import AppLayout from "@/components/AppLayout";
import Link from "next/link";
import { ChevronLeft, FolderGit2 } from "lucide-react";

function ProjectCard({ projectId }: { projectId: Id<"projects"> }) {
  const project = useQuery(api.projects.get, { id: projectId });
  const taskCount = useQuery(api.projects.getTaskCount, { projectId });

  if (!project) return null;

  return (
    <Link href={`/projects/${project._id}`}>
      <div className="glass p-5 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-white/5 transition-all group">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${project.color ?? "#6C63FF"}25` }}
          >
            <FolderGit2 size={18} style={{ color: project.color ?? "#6C63FF" }} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
              {project.name}
            </h3>
            {project.description && (
              <p className="text-xs text-muted-foreground truncate mt-0.5">{project.description}</p>
            )}
          </div>
          <div className="flex-shrink-0">
            <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
              {taskCount ?? 0} task{(taskCount ?? 0) !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function FolderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const folderId = id as Id<"folders">;

  const folder = useQuery(api.folders.get, { id: folderId });
  const projects = useQuery(api.projects.listByFolder, { folderId });

  if (folder === undefined) {
    return (
      <AppLayout>
        <div className="flex h-[50vh] items-center justify-center">
          <div className="w-16 h-16 rounded-full animate-breathe bg-primary/20" />
        </div>
      </AppLayout>
    );
  }

  if (folder === null) {
    return (
      <AppLayout>
        <div className="text-center py-16">
          <p className="text-muted-foreground">Folder not found.</p>
          <Link href="/projects" className="text-primary hover:underline text-sm mt-2 block">
            Back to Projects
          </Link>
        </div>
      </AppLayout>
    );
  }

  const activeProjects = (projects ?? []).filter((p) => p.status === "active");

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/projects" className="flex items-center gap-1 hover:text-foreground transition-colors">
            <ChevronLeft size={14} />
            Projects
          </Link>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center flex-shrink-0 text-3xl">
            {folder.icon ?? "📁"}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{folder.name}</h1>
            {folder.description && (
              <p className="text-muted-foreground text-sm mt-1">{folder.description}</p>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              {activeProjects.length} project{activeProjects.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Projects
          </h2>
          {activeProjects.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No projects in this folder yet.</p>
              <p className="text-sm text-muted-foreground/60 mt-1">
                Add projects from the sidebar.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {activeProjects.map((project) => (
                <ProjectCard key={project._id} projectId={project._id} />
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
