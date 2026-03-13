import { useEffect } from "react";
import { useLocation } from "wouter";
import {
  useListNoteTemplates,
  useCreateNoteTemplate,
  useDeleteNoteTemplate,
  useSeedNoteTemplates,
  useCreateNote,
  getListNoteTemplatesQueryKey,
  getListNotesQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { FileText, Plus, Trash2, LayoutTemplate } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function NoteTemplates() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: templates, isLoading } = useListNoteTemplates();
  const seedTemplates = useSeedNoteTemplates();
  const createTemplate = useCreateNoteTemplate();
  const deleteTemplate = useDeleteNoteTemplate();
  const createNote = useCreateNote();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState("");

  useEffect(() => {
    if (templates && templates.length === 0) {
      seedTemplates.mutateAsync().then(() => {
        queryClient.invalidateQueries({ queryKey: getListNoteTemplatesQueryKey() });
      });
    }
  }, [templates]);

  const handleUseTemplate = async (template: { name: string; content: string }) => {
    try {
      const now = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
      const title = template.name.replace("{{date}}", now);
      const content = template.content.replace(/\{\{date\}\}/g, now).replace(/\{\{title\}\}/g, title);

      const res = await createNote.mutateAsync({
        data: { title, content },
      });
      queryClient.invalidateQueries({ queryKey: getListNotesQueryKey() });
      setLocation(`/notes/${res.id}`);
    } catch {
      toast({ variant: "destructive", title: "Failed to create note from template" });
    }
  };

  const handleCreateTemplate = async () => {
    if (!newName) return;
    try {
      await createTemplate.mutateAsync({
        data: {
          name: newName,
          description: newDescription,
          content: newContent || `# ${newName}\n\n`,
          category: newCategory || "custom",
          isBuiltIn: false,
        },
      });
      queryClient.invalidateQueries({ queryKey: getListNoteTemplatesQueryKey() });
      setNewName("");
      setNewDescription("");
      setNewContent("");
      setNewCategory("");
      setShowCreateDialog(false);
      toast({ title: "Template created" });
    } catch {
      toast({ variant: "destructive", title: "Failed to create template" });
    }
  };

  const handleDeleteTemplate = async (id: number) => {
    try {
      await deleteTemplate.mutateAsync({ id });
      queryClient.invalidateQueries({ queryKey: getListNoteTemplatesQueryKey() });
      toast({ title: "Template deleted" });
    } catch {
      toast({ variant: "destructive", title: "Failed to delete template" });
    }
  };

  return (
    <div className="space-y-4 pb-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold flex items-center gap-2">
          <LayoutTemplate size={24} className="text-primary" /> Templates
        </h1>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1"><Plus size={14} /> New Template</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Template</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Template name" value={newName} onChange={(e) => setNewName(e.target.value)} />
              <Input placeholder="Description" value={newDescription} onChange={(e) => setNewDescription(e.target.value)} />
              <Input placeholder="Category (e.g. daily, work)" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} />
              <Textarea placeholder="Template content (markdown)" value={newContent} onChange={(e) => setNewContent(e.target.value)} className="min-h-[150px]" />
              <Button className="w-full" onClick={handleCreateTemplate} disabled={createTemplate.isPending}>Create</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex h-[30vh] items-center justify-center">
          <div className="w-12 h-12 rounded-full animate-breathe bg-primary/20" />
        </div>
      ) : templates && templates.length > 0 ? (
        <div className="space-y-2">
          {templates.map((tmpl) => (
            <div key={tmpl.id} className="p-4 bg-card rounded-xl border border-border">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-primary shrink-0" />
                    <p className="font-medium">{tmpl.name}</p>
                    {tmpl.isBuiltIn && <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded">Built-in</span>}
                  </div>
                  {tmpl.description && <p className="text-xs text-muted-foreground mt-1 ml-6">{tmpl.description}</p>}
                  <span className="text-[10px] text-muted-foreground ml-6">{tmpl.category}</span>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" className="text-xs" onClick={() => handleUseTemplate(tmpl)}>
                    Use
                  </Button>
                  {!tmpl.isBuiltIn && (
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteTemplate(tmpl.id)}>
                      <Trash2 size={14} />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <LayoutTemplate size={48} className="mx-auto mb-3 opacity-30" />
          <p>Loading templates...</p>
        </div>
      )}
    </div>
  );
}
