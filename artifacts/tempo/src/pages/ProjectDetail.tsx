import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import {
  useListProjects,
  useUpdateProject,
  useDeleteProject,
  useListTasks,
  useListNotes,
  getListProjectsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Trash2, CheckCircle2, FileText, Archive, RotateCcw, Palette } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import TaskCard from "@/components/TaskCard";

const PROJECT_COLORS = ["#C96442", "#6B9E7D", "#C9A54E", "#B85450", "#9D7E6C", "#5B8A9A", "#B07398", "#5A8F6E"];

export default function ProjectDetail() {
  const [, params] = useRoute("/projects/:id");
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: projects } = useListProjects();
  const { data: tasks } = useListTasks();
  const { data: notes } = useListNotes();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();

  const projectId = params?.id ? parseInt(params.id) : null;
  const project = projects?.find(p => p.id === projectId);

  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [showColorPicker, setShowColorPicker] = useState(false);

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Project not found.</p>
        <Button variant="ghost" onClick={() => setLocation("/projects")} className="mt-4">
          <ArrowLeft size={16} className="mr-2" /> Back to Projects
        </Button>
      </div>
    );
  }

  const projectTasks = tasks?.filter(t => t.projectId === projectId) || [];
  const projectNotes = notes?.filter(n => n.projectId === projectId) || [];
  const activeTasks = projectTasks.filter(t => t.status !== "done");
  const doneTasks = projectTasks.filter(t => t.status === "done");
  const progress = projectTasks.length > 0 ? (doneTasks.length / projectTasks.length) * 100 : 0;

  const handleRename = async () => {
    if (!editName.trim()) return;
    await updateProject.mutateAsync({ id: project.id, data: { name: editName } });
    queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() });
    setEditing(false);
    toast({ title: "Project renamed" });
  };

  const handleColorChange = async (newColor: string) => {
    await updateProject.mutateAsync({ id: project.id, data: { color: newColor } });
    queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() });
    setShowColorPicker(false);
    toast({ title: "Color updated" });
  };

  const handleArchive = async () => {
    const newStatus = project.status === "archived" ? "active" : "archived";
    await updateProject.mutateAsync({ id: project.id, data: { status: newStatus } });
    queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() });
    toast({ title: newStatus === "archived" ? "Project archived" : "Project restored" });
  };

  const handleDelete = async () => {
    await deleteProject.mutateAsync({ id: project.id });
    queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() });
    setLocation("/projects");
    toast({ title: "Project deleted" });
  };

  return (
    <div className="space-y-6 pb-12">
      <button onClick={() => setLocation("/projects")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft size={16} /> Projects
      </button>

      <div className="flex items-center gap-4">
        <button
          className="w-6 h-6 rounded-full shrink-0 ring-2 ring-transparent hover:ring-primary/50 transition-all"
          style={{ backgroundColor: project.color || "#C96442" }}
          onClick={() => setShowColorPicker(!showColorPicker)}
          title="Change color"
        />
        {editing ? (
          <form onSubmit={(e) => { e.preventDefault(); handleRename(); }} className="flex gap-2 flex-1">
            <Input value={editName} onChange={e => setEditName(e.target.value)} autoFocus className="bg-card" />
            <Button type="submit" size="sm">Save</Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(false)}>Cancel</Button>
          </form>
        ) : (
          <h1
            className="text-3xl font-display font-bold cursor-pointer hover:text-primary transition-colors"
            onClick={() => { setEditing(true); setEditName(project.name); }}
          >
            {project.name}
          </h1>
        )}
      </div>

      {showColorPicker && (
        <div className="flex gap-2 items-center bg-card border border-border rounded-xl p-3">
          <Palette size={16} className="text-muted-foreground shrink-0" />
          {PROJECT_COLORS.map(c => (
            <button
              key={c}
              onClick={() => handleColorChange(c)}
              className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                (project.color || "#C96442") === c ? "border-foreground scale-110" : "border-transparent"
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      )}

      {project.description && (
        <p className="text-sm text-muted-foreground">{project.description}</p>
      )}

      {projectTasks.length > 0 && (
        <Card className="glass border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Progress</span>
              <span className="text-sm font-medium">{doneTasks.length} / {projectTasks.length}</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <CheckCircle2 size={14} /> Tasks ({projectTasks.length})
        </h2>
        {activeTasks.length > 0 && (
          <div className="space-y-2">
            {activeTasks.map(task => <TaskCard key={task.id} task={task} />)}
          </div>
        )}
        {doneTasks.length > 0 && (
          <div className="space-y-2 opacity-60">
            {doneTasks.map(task => <TaskCard key={task.id} task={task} />)}
          </div>
        )}
        {projectTasks.length === 0 && (
          <p className="text-sm text-muted-foreground py-4">No tasks linked to this project yet.</p>
        )}
      </div>

      {projectNotes.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <FileText size={14} /> Notes ({projectNotes.length})
          </h2>
          <div className="space-y-2">
            {projectNotes.map(note => (
              <Card
                key={note.id}
                className="glass border-border/50 hover:border-primary/30 transition-colors cursor-pointer"
                onClick={() => setLocation(`/notes/${note.id}`)}
              >
                <CardContent className="p-4">
                  <h3 className="font-medium text-sm">{note.title}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-4 border-t border-border/50">
        <Button variant="outline" className="gap-2" onClick={handleArchive}>
          {project.status === "archived" ? <><RotateCcw size={14} /> Restore</> : <><Archive size={14} /> Archive</>}
        </Button>
        <Button variant="destructive" className="gap-2" onClick={handleDelete}>
          <Trash2 size={14} /> Delete
        </Button>
      </div>
    </div>
  );
}
