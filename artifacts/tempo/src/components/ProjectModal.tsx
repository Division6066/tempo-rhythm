import { useState, useEffect } from "react";
import {
  useCreateProject,
  useUpdateProject,
  getListProjectsQueryKey,
} from "@workspace/api-client-react";
import type { Project } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

const PROJECT_COLORS = [
  "#C96442",
  "#6B9E7D",
  "#C9A54E",
  "#B85450",
  "#9D7E6C",
  "#5B8A9A",
  "#B07398",
  "#5A8F6E",
];

type Props = {
  open: boolean;
  onClose: () => void;
  folderId?: number;
  editProject?: Project;
};

export default function ProjectModal({ open, onClose, folderId, editProject }: Props) {
  const queryClient = useQueryClient();
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [color, setColor] = useState("#C96442");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (open) {
      setName(editProject?.name ?? "");
      setColor(editProject?.color ?? "#C96442");
      setDescription(editProject?.description ?? "");
    }
  }, [open, editProject]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      if (editProject) {
        await updateProject.mutateAsync({
          id: editProject.id,
          data: { name: name.trim(), color, description: description.trim() || null },
        });
        toast({ title: "Project updated" });
      } else {
        await createProject.mutateAsync({
          data: {
            name: name.trim(),
            color,
            description: description.trim() || null,
            folderId: folderId ?? null,
            status: "active",
          },
        });
        toast({ title: "Project created" });
      }
      queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() });
      onClose();
    } catch {
      toast({ variant: "destructive", title: "Failed to save project" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle>{editProject ? "Edit Project" : "New Project"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Project name"
            className="bg-background"
            autoFocus
          />
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            className="bg-background"
          />
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">Color</label>
            <div className="flex flex-wrap gap-2">
              {PROJECT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full border-2 cursor-pointer transition-transform hover:scale-110 ${
                    color === c ? "border-white scale-110" : "border-transparent"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={!name.trim() || createProject.isPending || updateProject.isPending}
          >
            {editProject ? "Save Changes" : "Create Project"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
