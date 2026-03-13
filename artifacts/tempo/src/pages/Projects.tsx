import { useState } from "react";
import { useLocation } from "wouter";
import { useListProjects, useCreateProject, useListTasks, getListProjectsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { FolderGit2, Plus, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Projects() {
  const [, setLocation] = useLocation();
  const { data: projects, isLoading } = useListProjects();
  const { data: tasks } = useListTasks();
  const createProject = useCreateProject();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState("#6C63FF");
  const [description, setDescription] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await createProject.mutateAsync({
        data: { name, color, description, status: "active" }
      });
      setOpen(false);
      setName("");
      setDescription("");
      queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() });
      toast({ title: "Project created" });
    } catch {
      toast({ variant: "destructive", title: "Failed to create project" });
    }
  };

  if (isLoading) {
    return <div className="flex h-[50vh] items-center justify-center"><div className="w-16 h-16 rounded-full animate-breathe bg-primary/20" /></div>;
  }

  const active = projects?.filter(p => p.status === "active") || [];
  const archived = projects?.filter(p => p.status === "archived") || [];
  const colors = ["#6C63FF", "#00C9A7", "#FFB347", "#FF6B6B", "#9D4EDD", "#3B82F6", "#EC4899", "#22C55E"];

  const getTaskCounts = (projectId: number) => {
    const projectTasks = tasks?.filter(t => t.projectId === projectId) || [];
    const done = projectTasks.filter(t => t.status === "done").length;
    return { total: projectTasks.length, done };
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FolderGit2 className="text-teal-400 h-8 w-8" />
          <h1 className="text-3xl font-display font-bold">Projects</h1>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2"><Plus size={16} /> New Project</Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader><DialogTitle>Create Project</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 pt-4">
              <Input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Project name"
                className="bg-background"
                autoFocus
              />
              <Input
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Short description (optional)"
                className="bg-background"
              />
              <div>
                <label className="text-xs text-muted-foreground mb-2 block">Color</label>
                <div className="flex gap-2 flex-wrap">
                  {colors.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-8 h-8 rounded-full border-2 transition-transform ${color === c ? "border-white scale-110" : "border-transparent"}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={!name.trim() || createProject.isPending}>
                Create
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {active.length === 0 && archived.length === 0 ? (
        <div className="text-center py-12">
          <FolderGit2 className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-30" />
          <p className="text-muted-foreground mb-4">No projects yet.</p>
          <Button variant="outline" onClick={() => setOpen(true)}>Create your first project</Button>
        </div>
      ) : (
        <>
          {active.length > 0 && (
            <div className="space-y-3">
              {active.map(project => {
                const counts = getTaskCounts(project.id);
                const progress = counts.total > 0 ? (counts.done / counts.total) * 100 : 0;
                return (
                  <Card
                    key={project.id}
                    className="glass border-border/50 hover:border-primary/30 transition-colors cursor-pointer group"
                    onClick={() => setLocation(`/projects/${project.id}`)}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: project.color || "#6C63FF" }} />
                          <div>
                            <h3 className="font-semibold text-lg">{project.name}</h3>
                            {project.description && <p className="text-sm text-muted-foreground mt-0.5">{project.description}</p>}
                          </div>
                        </div>
                        <ChevronRight size={18} className="text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      {counts.total > 0 && (
                        <div className="mt-3 flex items-center gap-3">
                          <div className="h-1.5 flex-1 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
                          </div>
                          <span className="text-xs text-muted-foreground">{counts.done}/{counts.total}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
          {archived.length > 0 && (
            <div className="space-y-3 pt-4">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Archived</h2>
              {archived.map(project => (
                <Card
                  key={project.id}
                  className="glass border-border/30 opacity-60 cursor-pointer"
                  onClick={() => setLocation(`/projects/${project.id}`)}
                >
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: project.color || "#6C63FF" }} />
                    <span className="text-sm">{project.name}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
