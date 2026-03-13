import { useState } from "react";
import { useListTags, useCreateTag, useDeleteTag, getListTagsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tag, Plus, Trash2, Hash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const TAG_COLORS = [
  { name: "Purple", value: "#6C63FF" },
  { name: "Teal", value: "#00C9A7" },
  { name: "Amber", value: "#FFB347" },
  { name: "Red", value: "#FF6B6B" },
  { name: "Blue", value: "#3B82F6" },
  { name: "Pink", value: "#EC4899" },
  { name: "Green", value: "#22C55E" },
  { name: "Gray", value: "#9CA3AF" },
];

export default function Tags() {
  const { data: tags, isLoading } = useListTags();
  const createTag = useCreateTag();
  const deleteTag = useDeleteTag();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState("#6C63FF");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await createTag.mutateAsync({ data: { name, color } });
      setOpen(false);
      setName("");
      queryClient.invalidateQueries({ queryKey: getListTagsQueryKey() });
      toast({ title: "Tag created" });
    } catch {
      toast({ variant: "destructive", title: "Failed to create tag" });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteTag.mutateAsync({ id });
      queryClient.invalidateQueries({ queryKey: getListTagsQueryKey() });
      toast({ title: "Tag deleted" });
    } catch {
      toast({ variant: "destructive", title: "Failed to delete tag" });
    }
  };

  if (isLoading) {
    return <div className="flex h-[50vh] items-center justify-center"><div className="w-16 h-16 rounded-full animate-breathe bg-primary/20" /></div>;
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Tag className="text-primary h-8 w-8" />
          <h1 className="text-3xl font-display font-bold">Tags</h1>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2"><Plus size={16} /> New Tag</Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader><DialogTitle>Create Tag</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 pt-4">
              <Input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Tag name"
                className="bg-background"
                autoFocus
              />
              <div>
                <label className="text-xs text-muted-foreground mb-2 block">Color</label>
                <div className="flex gap-2 flex-wrap">
                  {TAG_COLORS.map(c => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setColor(c.value)}
                      className={`w-8 h-8 rounded-full border-2 transition-transform ${color === c.value ? "border-foreground scale-110" : "border-transparent"}`}
                      style={{ backgroundColor: c.value }}
                    />
                  ))}
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={!name.trim() || createTag.isPending}>
                Create
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {(!tags || tags.length === 0) ? (
        <div className="text-center py-12">
          <Hash className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-30" />
          <p className="text-muted-foreground mb-4">No tags yet.</p>
          <Button variant="outline" onClick={() => setOpen(true)}>Create your first tag</Button>
        </div>
      ) : (
        <div className="flex flex-wrap gap-3">
          {tags.map(tag => (
            <div
              key={tag.id}
              className="group flex items-center gap-2 px-4 py-2 rounded-full border border-border/50 bg-card hover:border-primary/30 transition-colors"
            >
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tag.color || "#6C63FF" }} />
              <span className="text-sm font-medium">{tag.name}</span>
              <button
                onClick={() => handleDelete(tag.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive/80 ml-1"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
