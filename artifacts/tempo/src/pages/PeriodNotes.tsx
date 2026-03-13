import { useState } from "react";
import { useLocation } from "wouter";
import { useListNotes, useCreateNote, getListNotesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Plus, FileText } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type PeriodType = "weekly" | "monthly" | "yearly";

function getCurrentPeriodDate(type: PeriodType): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  if (type === "weekly") {
    const day = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
    return `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, "0")}-${String(monday.getDate()).padStart(2, "0")}`;
  }
  if (type === "monthly") return `${y}-${String(m + 1).padStart(2, "0")}-01`;
  return `${y}-01-01`;
}

function formatPeriodLabel(type: PeriodType, date: string): string {
  const d = new Date(date + "T12:00:00");
  if (type === "weekly") {
    const end = new Date(d);
    end.setDate(end.getDate() + 6);
    return `Week of ${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
  }
  if (type === "monthly") return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  return d.getFullYear().toString();
}

export default function PeriodNotes() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [periodType, setPeriodType] = useState<PeriodType>("weekly");

  const { data: notes, isLoading } = useListNotes({ periodType });
  const createNote = useCreateNote();

  const handleCreatePeriodNote = async () => {
    const periodDate = getCurrentPeriodDate(periodType);
    const existing = notes?.find((n) => n.periodDate === periodDate);
    if (existing) {
      setLocation(`/notes/${existing.id}`);
      return;
    }

    try {
      const title = formatPeriodLabel(periodType, periodDate);
      const res = await createNote.mutateAsync({
        data: {
          title,
          content: `# ${title}\n\n## Highlights\n- \n\n## Notes\n\n`,
          periodType,
          periodDate,
        },
      });
      queryClient.invalidateQueries({ queryKey: getListNotesQueryKey() });
      setLocation(`/notes/${res.id}`);
    } catch {
      toast({ variant: "destructive", title: "Failed to create period note" });
    }
  };

  return (
    <div className="space-y-4 pb-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold flex items-center gap-2">
          <Calendar size={24} className="text-primary" /> Period Notes
        </h1>
        <Button size="sm" className="gap-1" onClick={handleCreatePeriodNote} disabled={createNote.isPending}>
          <Plus size={14} /> New {periodType}
        </Button>
      </div>

      <Tabs value={periodType} onValueChange={(v) => setPeriodType(v as PeriodType)}>
        <TabsList className="w-full">
          <TabsTrigger value="weekly" className="flex-1">Weekly</TabsTrigger>
          <TabsTrigger value="monthly" className="flex-1">Monthly</TabsTrigger>
          <TabsTrigger value="yearly" className="flex-1">Yearly</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="flex h-[30vh] items-center justify-center">
          <div className="w-12 h-12 rounded-full animate-breathe bg-primary/20" />
        </div>
      ) : notes && notes.length > 0 ? (
        <div className="space-y-2">
          {notes.map((note) => (
            <button
              key={note.id}
              onClick={() => setLocation(`/notes/${note.id}`)}
              className="w-full text-left p-4 bg-card rounded-xl border border-border hover:border-primary/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <FileText size={18} className="text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{note.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {note.periodDate && formatPeriodLabel(periodType, note.periodDate)}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <Calendar size={48} className="mx-auto mb-3 opacity-30" />
          <p>No {periodType} notes yet</p>
          <p className="text-sm mt-1">Create one to start tracking your {periodType} progress</p>
        </div>
      )}
    </div>
  );
}
