"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FolderGit2, Plus } from "lucide-react";

export default function ProjectsPage() {
  const projects = useQuery(api.projects.list);
  const createProject = useMutation(api.projects.create);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState("#6C63FF");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await createProject({ name, color, status: "active" });
    setOpen(false);
    setName("");
  };

  const colors = ["#6C63FF", "#00C9A7", "#FFB347", "#FF6B6B", "#9D4EDD", "#3B82F6"];

  if (!projects) {
    return (
      <AppLayout>
        <div className="flex h-[50vh] items-center justify-center">
          <div className="w-16 h-16 rounded-full animate-breathe bg-primary/20" />
        </div>
      </AppLayout>
    );
  }

  const active = projects.filter((p) => p.status === "active");

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FolderGit2 className="text-teal-400 h-8 w-8" />
            <h1 className="text-3xl font-bold text-foreground">Projects</h1>
          </div>
          <Button size="sm" className="gap-2" onClick={() => setOpen(true)}>
            <Plus size={16} /> New Project
          </Button>
        </div>

        {open && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)}>
            <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-xl font-bold mb-4">Create Project</h2>
              <form onSubmit={handleCreate} className="space-y-4">
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Project name" className="bg-background" autoFocus />
                <div>
                  <label className="text-xs text-muted-foreground mb-2 block">Color</label>
                  <div className="flex gap-2">
                    {colors.map((c) => (
                      <button key={c} type="button" onClick={() => setColor(c)} className={`w-8 h-8 rounded-full border-2 cursor-pointer ${color === c ? "border-white" : "border-transparent"}`} style={{ backgroundColor: c }} />
                    ))}
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={!name.trim()}>Create</Button>
              </form>
            </div>
          </div>
        )}

        <div className="space-y-4 mt-6">
          {active.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No active projects.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {active.map((project) => (
                <div key={project._id} className="glass p-5 rounded-xl border border-border/50 hover:border-primary/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: project.color || "#6C63FF" }} />
                    <h3 className="font-semibold text-lg">{project.name}</h3>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
