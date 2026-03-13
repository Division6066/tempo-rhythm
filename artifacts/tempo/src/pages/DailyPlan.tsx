import { useState } from "react";
import { useAiGeneratePlan, useListTasks, useListDailyPlans, useCreateDailyPlan, getListDailyPlansQueryKey, useListStagedSuggestions, useCreateStagedSuggestion, useAcceptStagedSuggestion, useRejectStagedSuggestion, useUpdateStagedSuggestionData, getListStagedSuggestionsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Sparkles, Check, X, Pencil } from "lucide-react";
import { format } from "date-fns";

type PlanBlock = { type: string; title?: string; items?: string[]; tasks?: string[]; task?: string; startTime?: string; duration?: number; prompt?: string };

export default function DailyPlan() {
  const todayDate = new Date().toISOString().split("T")[0];
  const { data: plans } = useListDailyPlans({ date: todayDate });
  const { data: todayTasks } = useListTasks({ status: "today" });
  const { data: stagedPlans } = useListStagedSuggestions({ type: "dailyPlan", status: "pending" });
  const generatePlan = useAiGeneratePlan();
  const createPlan = useCreateDailyPlan();
  const createStaged = useCreateStagedSuggestion();
  const acceptStaged = useAcceptStagedSuggestion();
  const rejectStaged = useRejectStagedSuggestion();
  const updateStagedData = useUpdateStagedSuggestionData();
  const queryClient = useQueryClient();

  const [isEditingPlan, setIsEditingPlan] = useState(false);
  const [editingBlocks, setEditingBlocks] = useState<PlanBlock[]>([]);

  const existingPlan = plans && plans.length > 0 ? plans[0] : null;
  const pendingStagedPlan = stagedPlans && stagedPlans.length > 0 ? stagedPlans[0] : null;
  const hasPlan = !!existingPlan;

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: getListDailyPlansQueryKey() });
    queryClient.invalidateQueries({ queryKey: getListStagedSuggestionsQueryKey() });
  };

  const handleGenerate = async () => {
    const res = await generatePlan.mutateAsync({
      data: {
        date: todayDate,
        taskIds: todayTasks?.map((t) => t.id) || [],
      },
    });
    await createStaged.mutateAsync({
      data: {
        type: "dailyPlan",
        data: { blocks: res.blocks, date: todayDate },
        reasoning: res.reasoning,
      },
    });
    invalidateAll();
  };

  const handleAcceptPlan = async (suggestionId: number, blocks: PlanBlock[]) => {
    await createPlan.mutateAsync({
      data: {
        date: todayDate,
        blocks: blocks as any,
        aiGenerated: true,
      },
    });
    await acceptStaged.mutateAsync({ id: suggestionId });
    invalidateAll();
  };

  const handleRejectPlan = async (suggestionId: number) => {
    await rejectStaged.mutateAsync({ id: suggestionId });
    invalidateAll();
  };

  const startEditingPlan = (blocks: PlanBlock[]) => {
    setIsEditingPlan(true);
    setEditingBlocks(blocks.map(b => ({ ...b, items: b.items ? [...b.items] : undefined, tasks: b.tasks ? [...b.tasks] : undefined })));
  };

  const cancelEditingPlan = () => {
    setIsEditingPlan(false);
    setEditingBlocks([]);
  };

  const updateBlock = (index: number, field: keyof PlanBlock, value: unknown) => {
    setEditingBlocks(prev => prev.map((b, i) => i === index ? { ...b, [field]: value } : b));
  };

  const removeBlock = (index: number) => {
    setEditingBlocks(prev => prev.filter((_, i) => i !== index));
  };

  const saveEditedPlan = async (suggestionId: number) => {
    const suggestion = stagedPlans?.find(s => s.id === suggestionId);
    if (!suggestion) return;
    const existingData = suggestion.data as Record<string, unknown>;
    await updateStagedData.mutateAsync({
      id: suggestionId,
      data: { data: { ...existingData, blocks: editingBlocks } },
    });
    setIsEditingPlan(false);
    setEditingBlocks([]);
    invalidateAll();
  };

  const renderBlock = (block: PlanBlock, i: number) => (
    <Card key={i} className="glass">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{block.title || block.type}</CardTitle>
      </CardHeader>
      <CardContent>
        {block.items && (
          <ul className="space-y-1">
            {block.items.map((item, idx) => (
              <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        )}
        {block.tasks && (
          <ul className="space-y-1">
            {block.tasks.map((task, idx) => (
              <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[hsl(168,100%,39%)] shrink-0" />
                {task}
              </li>
            ))}
          </ul>
        )}
        {block.task && <p className="text-sm text-muted-foreground">{block.task}</p>}
        {block.startTime && <p className="text-xs text-primary mt-2">{block.startTime} — {block.duration}min</p>}
        {block.prompt && <p className="text-sm text-muted-foreground italic">{block.prompt}</p>}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar className="text-primary h-8 w-8" />
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Daily Plan</h1>
            <p className="text-sm text-primary font-medium">{format(new Date(), "EEEE, MMMM do")}</p>
          </div>
        </div>
      </div>

      {!hasPlan && !pendingStagedPlan && (
        <Card className="glass border-dashed border-primary/50 text-center py-12">
          <CardContent className="space-y-6">
            <div className="w-20 h-20 bg-primary/10 rounded-full mx-auto flex items-center justify-center">
              <Sparkles className="text-primary w-10 h-10" />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-2">Let&apos;s plan your day</h2>
              <p className="text-muted-foreground max-w-xs mx-auto">
                AI will look at your tasks, energy peaks, and routines to build a realistic plan.
              </p>
            </div>
            <Button
              onClick={handleGenerate}
              disabled={generatePlan.isPending}
              size="lg"
              className="gap-2 bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
            >
              <Sparkles size={20} />
              {generatePlan.isPending ? "Analyzing & Planning..." : "Generate AI Plan"}
            </Button>
          </CardContent>
        </Card>
      )}

      {pendingStagedPlan && !hasPlan && (() => {
        const planBlocks = (pendingStagedPlan.data as Record<string, unknown>)?.blocks as PlanBlock[] || [];
        const displayBlocks = isEditingPlan ? editingBlocks : planBlocks;
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-primary/10 border border-primary/30 p-4 rounded-xl flex items-start gap-3">
              <Sparkles className="text-primary mt-0.5 shrink-0" size={16} />
              <div>
                <h3 className="font-semibold text-primary mb-1">
                  AI Suggestion {isEditingPlan && <span className="text-xs text-amber-400 font-normal ml-1">Editing</span>}
                </h3>
                <p className="text-sm text-foreground/80">{pendingStagedPlan.reasoning}</p>
              </div>
            </div>

            <div className="space-y-4">
              {displayBlocks.map((block, i) => (
                isEditingPlan ? (
                  <Card key={i} className="glass">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <Input
                          value={block.title || block.type || ""}
                          onChange={(e) => updateBlock(i, "title", e.target.value)}
                          className="bg-background border-border text-lg font-semibold h-9"
                          placeholder="Block title"
                        />
                        <Input
                          value={block.startTime || ""}
                          onChange={(e) => updateBlock(i, "startTime", e.target.value)}
                          className="bg-background border-border text-xs h-9 w-24"
                          placeholder="Time"
                        />
                        <Input
                          type="number"
                          value={block.duration || ""}
                          onChange={(e) => updateBlock(i, "duration", e.target.value ? parseInt(e.target.value) : undefined)}
                          className="bg-background border-border text-xs h-9 w-20"
                          placeholder="min"
                        />
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive shrink-0" onClick={() => removeBlock(i)}>
                          <X size={14} />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {block.task !== undefined && (
                        <Input
                          value={block.task || ""}
                          onChange={(e) => updateBlock(i, "task", e.target.value)}
                          className="bg-background border-border text-sm"
                          placeholder="Task description"
                        />
                      )}
                      {block.prompt !== undefined && (
                        <Input
                          value={block.prompt || ""}
                          onChange={(e) => updateBlock(i, "prompt", e.target.value)}
                          className="bg-background border-border text-sm italic"
                          placeholder="Prompt"
                        />
                      )}
                    </CardContent>
                  </Card>
                ) : renderBlock(block, i)
              ))}
            </div>

            <div className="fixed bottom-24 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-card border border-border p-2 rounded-full shadow-xl z-50">
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:bg-destructive/20 hover:text-destructive rounded-full"
                onClick={() => handleRejectPlan(pendingStagedPlan.id)}
                title="Reject plan"
              >
                <X size={20} />
              </Button>
              {isEditingPlan ? (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:bg-muted/20 rounded-full"
                    onClick={cancelEditingPlan}
                    title="Cancel edit"
                  >
                    <X size={18} />
                  </Button>
                  <Button
                    size="icon"
                    className="bg-amber-500 hover:bg-amber-600 text-white rounded-full shadow-lg"
                    onClick={() => saveEditedPlan(pendingStagedPlan.id)}
                    title="Save edits"
                    disabled={updateStagedData.isPending}
                  >
                    <Check size={20} />
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-amber-400 hover:bg-amber-500/20 rounded-full"
                    onClick={() => startEditingPlan(planBlocks)}
                    title="Edit plan"
                  >
                    <Pencil size={18} />
                  </Button>
                  <Button
                    size="icon"
                    className="bg-[hsl(168,100%,39%)] hover:bg-[hsl(168,100%,45%)] text-white rounded-full shadow-lg shadow-[hsl(168,100%,39%)]/20"
                    onClick={() => handleAcceptPlan(pendingStagedPlan.id, planBlocks)}
                    title="Accept plan"
                  >
                    <Check size={20} />
                  </Button>
                </>
              )}
            </div>
          </div>
        );
      })()}

      {existingPlan && (
        <div className="space-y-4">
          <div className="bg-[hsl(168,100%,39%)]/10 border border-[hsl(168,100%,39%)]/30 p-3 rounded-xl text-center">
            <p className="text-sm text-[hsl(168,100%,39%)] font-medium flex items-center justify-center gap-2">
              <Check size={16} /> Plan accepted
            </p>
          </div>
          {(existingPlan.blocks as PlanBlock[]).map((block, i) => (
            <Card key={i} className="glass">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-primary">{block.title || block.type || "Block"}</CardTitle>
              </CardHeader>
              <CardContent>
                {block.items && block.items.map((item, idx) => <p key={idx} className="text-sm text-foreground">{item}</p>)}
                {block.tasks && block.tasks.map((task, idx) => <p key={idx} className="text-sm text-foreground">{task}</p>)}
                {block.task && <p className="text-sm text-foreground">{block.task}</p>}
                {block.startTime && <p className="text-xs text-primary mt-2">{block.startTime} — {block.duration}min</p>}
                {block.prompt && <p className="text-sm text-foreground italic">{block.prompt}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
