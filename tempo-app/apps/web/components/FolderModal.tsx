"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

const FOLDER_ICONS = ["📁", "📂", "🗂️", "📋", "🎯", "💼", "🏠", "⚡", "🌟", "🔥", "💡", "🚀"];

type Props = {
  open: boolean;
  onClose: () => void;
  editFolder?: { _id: Id<"folders">; name: string; icon?: string };
};

export default function FolderModal({ open, onClose, editFolder }: Props) {
  const createFolder = useMutation(api.folders.create);
  const updateFolder = useMutation(api.folders.update);

  const [name, setName] = useState(editFolder?.name ?? "");
  const [icon, setIcon] = useState(editFolder?.icon ?? "📁");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (editFolder) {
      await updateFolder({ id: editFolder._id, name: name.trim(), icon });
    } else {
      await createFolder({ name: name.trim(), icon });
    }
    onClose();
    setName("");
    setIcon("📁");
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
          <h2 className="text-xl font-bold">{editFolder ? "Rename Folder" : "New Folder"}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground cursor-pointer">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Folder name"
            className="bg-background"
            autoFocus
          />
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">Icon</label>
            <div className="flex flex-wrap gap-2">
              {FOLDER_ICONS.map((ic) => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setIcon(ic)}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg border-2 cursor-pointer transition-colors ${
                    icon === ic ? "border-primary bg-primary/10" : "border-transparent hover:border-border"
                  }`}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={!name.trim()}>
            {editFolder ? "Save" : "Create Folder"}
          </Button>
        </form>
      </div>
    </div>
  );
}
