import { useState } from "react";
import { useListMemories, useCreateMemory, useDeleteMemory, getListMemoriesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, Plus, Trash2, Sparkles, Info, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Memories() {
  const { data: memories, isLoading } = useListMemories();
  const createMemory = useCreateMemory();
  const deleteMemory = useDeleteMemory();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [newMemory, setNewMemory] = useState("");
  const [tier, setTier] = useState<"warm" | "cold">("warm");

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemory.trim()) return;
    try {
      await createMemory.mutateAsync({ data: { content: newMemory, tier } });
      setNewMemory("");
      queryClient.invalidateQueries({ queryKey: getListMemoriesQueryKey() });
      toast({ title: "Memory saved" });
    } catch {
      toast({ variant: "destructive", title: "Failed to save memory" });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMemory.mutateAsync({ id });
      queryClient.invalidateQueries({ queryKey: getListMemoriesQueryKey() });
      toast({ title: "Memory removed" });
    } catch {
      toast({ variant: "destructive", title: "Failed to remove memory" });
    }
  };

  if (isLoading) {
    return <div className="flex h-[50vh] items-center justify-center"><div className="w-16 h-16 rounded-full animate-breathe bg-primary/20" /></div>;
  }

  const hotMemories = memories?.filter(m => m.tier === "hot") || [];
  const warmMemories = memories?.filter(m => m.tier === "warm") || [];
  const coldMemories = memories?.filter(m => m.tier === "cold") || [];

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center gap-3">
        <Brain className="text-purple-400 h-8 w-8" />
        <div>
          <h1 className="text-3xl font-display font-bold">Memory</h1>
          <p className="text-sm text-muted-foreground">What TEMPO remembers about you</p>
        </div>
      </div>

      <Card className="glass border-primary/20 bg-primary/5">
        <CardContent className="p-4 flex items-start gap-3">
          <Info size={16} className="text-primary mt-0.5 shrink-0" />
          <p className="text-sm text-muted-foreground">
            These memories help the AI personalize your plans. Add things like "I need 30 min prep before meetings" or "I work best in the morning." You can edit or remove any memory.
          </p>
        </CardContent>
      </Card>

      <form onSubmit={handleAdd} className="flex gap-2">
        <Input
          value={newMemory}
          onChange={e => setNewMemory(e.target.value)}
          placeholder="e.g., I prefer chunked task lists over time blocks..."
          className="bg-card"
        />
        <Button type="submit" disabled={!newMemory.trim() || createMemory.isPending} className="shrink-0 gap-1">
          <Plus size={16} /> Add
        </Button>
      </form>

      <div className="flex gap-2">
        <button
          onClick={() => setTier("warm")}
          className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${tier === "warm" ? "bg-amber-500/10 border-amber-500 text-amber-400" : "border-border text-muted-foreground"}`}
        >
          Active preferences
        </button>
        <button
          onClick={() => setTier("cold")}
          className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${tier === "cold" ? "bg-blue-500/10 border-blue-500 text-blue-400" : "border-border text-muted-foreground"}`}
        >
          Background context
        </button>
      </div>

      {hotMemories.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-semibold text-violet-400 uppercase tracking-wider flex items-center gap-2">
            <BookOpen size={12} /> Core Knowledge ({hotMemories.length})
          </h2>
          {hotMemories.map(mem => (
            <Card key={mem.id} className="glass border-border/50 group">
              <CardContent className="p-4 flex items-start justify-between gap-3">
                <p className="text-sm text-muted-foreground/80">{mem.content}</p>
                <button
                  onClick={() => handleDelete(mem.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive shrink-0"
                >
                  <Trash2 size={14} />
                </button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {warmMemories.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-2">
            <Sparkles size={12} /> Active Preferences ({warmMemories.length})
          </h2>
          {warmMemories.map(mem => (
            <Card key={mem.id} className="glass border-border/50 group">
              <CardContent className="p-4 flex items-start justify-between gap-3">
                <p className="text-sm">{mem.content}</p>
                <button
                  onClick={() => handleDelete(mem.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive shrink-0"
                >
                  <Trash2 size={14} />
                </button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {coldMemories.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Background Context ({coldMemories.length})</h2>
          {coldMemories.map(mem => (
            <Card key={mem.id} className="glass border-border/50 group">
              <CardContent className="p-4 flex items-start justify-between gap-3">
                <p className="text-sm text-muted-foreground">{mem.content}</p>
                <button
                  onClick={() => handleDelete(mem.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive shrink-0"
                >
                  <Trash2 size={14} />
                </button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {(!memories || memories.length === 0) && (
        <div className="text-center py-8">
          <Brain className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-30" />
          <p className="text-muted-foreground">No memories yet. Add preferences to personalize your AI planning.</p>
        </div>
      )}
    </div>
  );
}
