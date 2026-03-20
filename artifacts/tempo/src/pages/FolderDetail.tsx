import { useRoute, useLocation } from "wouter";
import {
  useListFolders,
  useListProjects,
  useListTasks,
} from "@workspace/api-client-react";
import type { Project } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, FolderGit2, ChevronRight, FolderOpen } from "lucide-react";

function ProjectCard({ project, taskCount }: { project: Project; taskCount: number }) {
  const [, setLocation] = useLocation();

  return (
    <Card
      className="glass border-border/50 hover:border-primary/30 transition-colors cursor-pointer group"
      onClick={() => setLocation(`/projects/${project.id}`)}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${project.color ?? "#C96442"}25` }}
          >
            <FolderGit2 size={18} style={{ color: project.color ?? "#C96442" }} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
              {project.name}
            </h3>
            {project.description && (
              <p className="text-xs text-muted-foreground truncate mt-0.5">{project.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
              {taskCount} task{taskCount !== 1 ? "s" : ""}
            </span>
            <ChevronRight size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function FolderDetail() {
  const [, params] = useRoute("/folders/:id");
  const [, setLocation] = useLocation();

  const folderId = params?.id ? parseInt(params.id) : null;

  const { data: allFolders } = useListFolders();
  const { data: allProjectsList } = useListProjects();
  const { data: tasks } = useListTasks();

  const folder = allFolders?.find(f => f.id === folderId);
  const projects = allProjectsList?.filter(p => p.folderId === folderId);

  if (!folderId) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Folder not found.</p>
        <Button variant="ghost" onClick={() => setLocation("/folders")} className="mt-4">
          <ArrowLeft size={16} className="mr-2" /> Back to Folders
        </Button>
      </div>
    );
  }

  if (!folder) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="w-16 h-16 rounded-full animate-breathe bg-primary/20" />
      </div>
    );
  }

  const activeProjects = (projects ?? []).filter((p) => p.status === "active");

  const getTaskCount = (projectId: number) => {
    return (tasks ?? []).filter((t) => t.projectId === projectId && t.status !== "done").length;
  };

  return (
    <div className="space-y-6 pb-12">
      <button
        onClick={() => setLocation("/folders")}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft size={16} /> Folders
      </button>

      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center flex-shrink-0 text-3xl">
          {folder.icon ?? "📁"}
        </div>
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">{folder.name}</h1>
          {folder.description && (
            <p className="text-muted-foreground text-sm mt-1">{folder.description}</p>
          )}
          <p className="text-xs text-muted-foreground mt-2">
            {activeProjects.length} project{activeProjects.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Projects
        </h2>
        {activeProjects.length === 0 ? (
          <div className="text-center py-12">
            <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-30" />
            <p className="text-muted-foreground">No projects in this folder yet.</p>
            <p className="text-sm text-muted-foreground/60 mt-1">
              Add projects from the sidebar.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                taskCount={getTaskCount(project.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
