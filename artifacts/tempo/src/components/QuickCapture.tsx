import { useState } from "react";
import { useCreateTask, getListTasksQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function QuickCapture({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const [title, setTitle] = useState("");
  const createTask = useCreateTask();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    try {
      await createTask.mutateAsync({ 
        data: { 
          title, 
          status: "inbox", 
          priority: "medium" 
        }
      });
      setTitle("");
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: getListTasksQueryKey() });
      toast({ title: "Captured to Inbox", description: "Task saved successfully." });
    } catch (error) {
      toast({ variant: "destructive", title: "Failed to save", description: "Please try again." });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border shadow-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-xl flex items-center gap-2">
            <Sparkles className="text-primary" size={20} />
            Quick Capture
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <Input 
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What's on your mind?" 
            className="bg-background border-border text-lg py-6 focus-visible:ring-primary/50" 
          />
          <div className="flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createTask.isPending || !title.trim()} 
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {createTask.isPending ? "Adding..." : "Add to Inbox"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}