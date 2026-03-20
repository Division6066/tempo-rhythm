import { useState, useEffect } from "react";
import { useListMemories, useCreateMemory, useDeleteMemory, getListMemoriesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, Plus, Trash2, Sparkles, Info, BookOpen, BarChart3, Loader2, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MemoryStatRow {
  tier: string;
  count: string;
  avg_decay: string;
  oldest: string;
  newest: string;
}

export default function Memories() {
  const { data: memories, isLoading } = useListMemories();
  const createMemory = useCreateMemory();
  const deleteMemory = useDeleteMemory();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [newMemory, setNewMemory] = useState("");
  const [tier, setTier] = useState<"warm" | "cold">("warm");
  const [stats, setStats] = useState<MemoryStatRow[]>([]);
  const [statsLoading, setStatsLoading] = useState(false);
  const [decaying, setDecaying] = useState(false);

  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || `${window.location.origin}/api`;
      const res = await fetch(`${apiUrl}/memories/stats`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("tempo_token")}` },
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch {} finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [memories]);

  const handleDecay = async () => {
    setDecaying(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || `${window.location.origin}/api`;
      const res = await fetch(`${apiUrl}/memories/decay`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("tempo_token")}` },
      });
      if (!res.ok) throw new Error("Decay failed");
      const data = await res.json();
      queryClient.invalidateQueries({ queryKey: getListMemoriesQueryKey() });
      toast({
        title: "Memory cleanup complete",
        description: data.pruned > 0 ? `Removed ${data.pruned} faded memories` : "All memories refreshed",
      });
      fetchStats();
    } catch {
      toast({ variant: "destructive", title: "Failed to run memory cleanup" });
    } finally {
      setDecaying(false);
    }
  };

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
  const totalMemories = (memories?.length || 0);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center gap-3">
        <Brain className="text-primary h-8 w-8" />
        <div>
          <h1 className="text-3xl font-display font-bold">Memory</h1>
          <p className="text-sm text-muted-foreground">What TEMPO remembers about you</p>
        </div>
      </div>

      {totalMemories > 0 && (
        <Card className="glass border-border/50">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider flex items-center gap-2 text-muted-foreground">
                <BarChart3 size={14} /> Memory Stats
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDecay}
                disabled={decaying}
                className="text-xs gap-1.5"
              >
                {decaying ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                {decaying ? "Cleaning..." : "Clean up old memories"}
              </Button>
            </div>
            {statsLoading ? (
              <div className="flex justify-center py-2"><Loader2 size={16} className="animate-spin text-muted-foreground" /></div>
            ) : stats.length > 0 ? (
              <div className="grid grid-cols-3 gap-3">
                {stats.map((s) => {
                  const tierColors: Record<string, string> = {
                    hot: "text-violet-400 bg-violet-500/10 border-violet-500/20",
                    warm: "text-amber-400 bg-amber-500/10 border-amber-500/20",
                    cold: "text-blue-400 bg-blue-500/10 border-blue-500/20",
                  };
                  const cls = tierColors[s.tier] || "text-muted-foreground bg-muted border-border";
                  return (
                    <div key={s.tier} className={`rounded-lg border p-3 ${cls}`}>
                      <div className="text-xs font-semibold uppercase">{s.tier}</div>
                      <div className="text-2xl font-bold mt-1">{s.count}</div>
                      <div className="text-[10px] mt-1 opacity-80">
                        Avg decay: {Number(s.avg_decay).toFixed(0)}%
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No stats available</p>
            )}
          </CardContent>
        </Card>
      )}

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
          className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${tier === "warm" ? "bg-warning/10 border-warning text-warning" : "border-border text-muted-foreground"}`}
        >
          Active preferences
        </button>
        <button
          onClick={() => setTier("cold")}
          className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${tier === "cold" ? "bg-info/10 border-info text-info" : "border-border text-muted-foreground"}`}
        >
          Background context
        </button>
      </div>

      {hotMemories.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-semibold text-primary uppercase tracking-wider flex items-center gap-2">
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
          <h2 className="text-xs font-semibold text-warning uppercase tracking-wider flex items-center gap-2">
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
          <h2 className="text-xs font-semibold text-info uppercase tracking-wider">Background Context ({coldMemories.length})</h2>
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
