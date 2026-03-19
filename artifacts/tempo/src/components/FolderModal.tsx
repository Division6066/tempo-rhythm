import { useState, useEffect } from "react";
import {
  useCreateFolder,
  useUpdateFolder,
  getListFoldersQueryKey,
} from "@workspace/api-client-react";
import type { Folder } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

const FOLDER_ICONS = ["📁", "📂", "🗂️", "📋", "🎯", "💼", "🏠", "⚡", "🌟", "🔥", "💡", "🚀"];

type Props = {
  open: boolean;
  onClose: () => void;
  editFolder?: Folder;
};

export default function FolderModal({ open, onClose, editFolder }: Props) {
  const queryClient = useQueryClient();
  const createFolder = useCreateFolder();
  const updateFolder = useUpdateFolder();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [icon, setIcon] = useState("📁");

  useEffect(() => {
    if (open) {
      setName(editFolder?.name ?? "");
      setIcon(editFolder?.icon ?? "📁");
    }
  }, [open, editFolder]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      if (editFolder) {
        await updateFolder.mutateAsync({ id: editFolder.id, data: { name: name.trim(), icon } });
        toast({ title: "Folder renamed" });
      } else {
        await createFolder.mutateAsync({ data: { name: name.trim(), icon } });
        toast({ title: "Folder created" });
      }
      queryClient.invalidateQueries({ queryKey: getListFoldersQueryKey() });
      onClose();
    } catch {
      toast({ variant: "destructive", title: "Failed to save folder" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle>{editFolder ? "Rename Folder" : "New Folder"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
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
          <Button
            type="submit"
            className="w-full"
            disabled={!name.trim() || createFolder.isPending || updateFolder.isPending}
          >
            {editFolder ? "Save" : "Create Folder"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
