"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

const PROJECT_COLORS = [
  "#6C63FF",
  "#00C9A7",
  "#FFB347",
  "#FF6B6B",
  "#9D4EDD",
  "#3B82F6",
  "#EC4899",
  "#10B981",
];

type Props = {
  open: boolean;
  onClose: () => void;
  folderId?: Id<"folders">;
  editProject?: {
    _id: Id<"projects">;
    name: string;
    color?: string;
    description?: string;
  };
};

export default function ProjectModal({ open, onClose, folderId, editProject }: Props) {
  const createProject = useMutation(api.projects.create);
  const updateProject = useMutation(api.projects.update);

  const [name, setName] = useState(editProject?.name ?? "");
  const [color, setColor] = useState(editProject?.color ?? "#6C63FF");
  const [description, setDescription] = useState(editProject?.description ?? "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (editProject) {
      await updateProject({
        id: editProject._id,
        name: name.trim(),
        color,
        description: description.trim() || undefined,
      });
    } else {
      await createProject({
        name: name.trim(),
        color,
        description: description.trim() || undefined,
        folderId,
        status: "active",
      });
    }
    onClose();
    setName("");
    setColor("#6C63FF");
    setDescription("");
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">{editProject ? "Edit Project" : "New Project"}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground cursor-pointer">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
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
          <Button type="submit" className="w-full" disabled={!name.trim()}>
            {editProject ? "Save Changes" : "Create Project"}
          </Button>
        </form>
      </div>
    </div>
  );
}
