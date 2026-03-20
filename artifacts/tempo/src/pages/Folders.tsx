import { useState } from "react";
import { useListFolders, useCreateFolder, useDeleteFolder, useReorderFolders, getListFoldersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { FolderOpen, Plus, Trash2, Briefcase, GraduationCap, Heart, Home, Code, GripVertical, type LucideIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy, useSortable, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Folder } from "@workspace/api-zod";

const AREA_ICONS: Record<string, LucideIcon> = {
  Work: Briefcase,
  Personal: Heart,
  Study: GraduationCap,
  Home: Home,
  Projects: Code,
};

function SortableFolderCard({ folder, onDelete }: { folder: Folder; onDelete: (id: number) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: String(folder.id) });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  const IconComponent = AREA_ICONS[folder.name] || FolderOpen;

  return (
    <div ref={setNodeRef} style={style}>
      <Card className="glass border-border/50 hover:border-primary/30 transition-colors group">
        <CardContent className="p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button {...attributes} {...listeners} className="cursor-grab text-muted-foreground hover:text-foreground shrink-0 touch-none" onClick={e => e.stopPropagation()}>
              <GripVertical size={16} />
            </button>
            <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center text-warning">
              <IconComponent size={20} />
            </div>
            <div>
              <h3 className="font-semibold">{folder.name}</h3>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-destructive"
            onClick={() => onDelete(folder.id)}
          >
            <Trash2 size={14} />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Folders() {
  const { data: folders, isLoading } = useListFolders();
  const createFolder = useCreateFolder();
  const deleteFolder = useDeleteFolder();
  const reorderFolders = useReorderFolders();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await createFolder.mutateAsync({ data: { name } });
      setOpen(false);
      setName("");
      queryClient.invalidateQueries({ queryKey: getListFoldersQueryKey() });
      toast({ title: "Area created" });
    } catch {
      toast({ variant: "destructive", title: "Failed to create area" });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteFolder.mutateAsync({ id });
      queryClient.invalidateQueries({ queryKey: getListFoldersQueryKey() });
      toast({ title: "Area deleted" });
    } catch {
      toast({ variant: "destructive", title: "Failed to delete area" });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !folders) return;
    const items = [...folders];
    const oldIndex = items.findIndex(f => String(f.id) === String(active.id));
    const newIndex = items.findIndex(f => String(f.id) === String(over.id));
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = arrayMove(items, oldIndex, newIndex);
    try {
      await reorderFolders.mutateAsync({ data: { folderIds: reordered.map(f => f.id) } });
      queryClient.invalidateQueries({ queryKey: getListFoldersQueryKey() });
    } catch {}
  };

  if (isLoading) {
    return <div className="flex h-[50vh] items-center justify-center"><div className="w-16 h-16 rounded-full animate-breathe bg-primary/20" /></div>;
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FolderOpen className="text-warning h-8 w-8" />
          <h1 className="text-3xl font-display font-bold">Areas</h1>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2"><Plus size={16} /> New Area</Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader><DialogTitle>Create Area</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 pt-4">
              <Input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g., Work, Personal, Study"
                className="bg-background"
                autoFocus
              />
              <Button type="submit" className="w-full" disabled={!name.trim() || createFolder.isPending}>
                Create
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <p className="text-sm text-muted-foreground">
        Areas are broad life categories. Organize your tasks and notes into areas like Work, Personal, or Study.
      </p>

      {(!folders || folders.length === 0) ? (
        <div className="text-center py-12">
          <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-30" />
          <p className="text-muted-foreground mb-4">No areas yet.</p>
          <Button variant="outline" onClick={() => setOpen(true)}>Create your first area</Button>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={folders.map((f: Folder) => String(f.id))} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {folders.map((folder: Folder) => (
                <SortableFolderCard key={folder.id} folder={folder} onDelete={handleDelete} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
