"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles } from "lucide-react";

export function QuickCapture({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [title, setTitle] = useState("");
  const createTask = useMutation(api.tasks.create);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    try {
      await createTask({ title, status: "inbox", priority: "medium" });
      setTitle("");
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => onOpenChange(false)}>
      <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Sparkles className="text-primary" size={20} />
          Quick Capture
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What's on your mind?"
            className="bg-background border-border text-lg py-6 focus-visible:ring-primary/50"
          />
          <div className="flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={saving || !title.trim()} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              {saving ? "Adding..." : "Add to Inbox"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
