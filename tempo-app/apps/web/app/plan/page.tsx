"use client";

import { useState } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Sparkles, Check, X, Edit3 } from "lucide-react";
import { format } from "date-fns";

type PlanBlock = { type: string; title?: string; items?: string[]; tasks?: string[]; task?: string; startTime?: string; duration?: number; prompt?: string };

export default function DailyPlanPage() {
  const todayDate = new Date().toISOString().split("T")[0];
  const plans = useQuery(api.dailyPlans.list, { date: todayDate });
  const stagedPlans = useQuery(api.staging.listPending, { type: "dailyPlan" });
  const generatePlan = useAction(api.ai.generatePlan);
  const createStaged = useMutation(api.staging.create);
  const acceptStaged = useMutation(api.staging.accept);
  const rejectStaged = useMutation(api.staging.reject);
  const createPlan = useMutation(api.dailyPlans.create);

  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState("");

  const existingPlan = plans && plans.length > 0 ? plans[0] : null;
  const pendingStagedPlan = stagedPlans && stagedPlans.length > 0 ? stagedPlans[0] : null;
  const hasPlan = !!existingPlan;

  const handleGenerate = async () => {
    setGenerating(true);
    setGenerateError("");
    try {
      const res = await generatePlan({ date: todayDate });
      await createStaged({
        type: "dailyPlan",
        data: { blocks: res.blocks, date: todayDate },
        reasoning: res.reasoning,
      });
    } catch {
      setGenerateError("AI planning is currently unavailable. Please try again later or plan your day manually.");
    } finally {
      setGenerating(false);
    }
  };

  const handleAcceptPlan = async (suggestionId: Id<"stagedSuggestions">, blocks: PlanBlock[]) => {
    await createPlan({
      date: todayDate,
      blocks,
      aiGenerated: true,
    });
    await acceptStaged({ id: suggestionId });
  };

  const handleRejectPlan = async (suggestionId: Id<"stagedSuggestions">) => {
    await rejectStaged({ id: suggestionId });
  };

  return (
    <AppLayout>
      <div className="space-y-6 pb-12">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="text-primary h-8 w-8" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">Daily Plan</h1>
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
              <Button onClick={handleGenerate} disabled={generating} size="lg" className="gap-2 bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
                <Sparkles size={20} />
                {generating ? "Analyzing & Planning..." : "Generate AI Plan"}
              </Button>
              {generateError && (
                <div className="bg-destructive/10 border border-destructive/30 text-destructive text-sm rounded-lg px-4 py-3 mt-4 max-w-sm mx-auto">
                  {generateError}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {pendingStagedPlan && !hasPlan && (
          <div className="space-y-4">
            <div className="bg-primary/10 border border-primary/30 p-4 rounded-xl flex items-start gap-3">
              <Sparkles className="text-primary mt-0.5 shrink-0" size={16} />
              <div>
                <h3 className="font-semibold text-primary mb-1">AI Suggestion</h3>
                <p className="text-sm text-foreground/80">{pendingStagedPlan.reasoning}</p>
              </div>
            </div>

            <div className="space-y-4">
              {((pendingStagedPlan.data as { blocks: PlanBlock[] }).blocks || []).map((block: PlanBlock, i: number) => (
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
                            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0" />
                            {task}
                          </li>
                        ))}
                      </ul>
                    )}
                    {block.task && <p className="text-sm text-muted-foreground">{block.task}</p>}
                    {block.startTime && <p className="text-xs text-primary mt-2">{block.startTime} - {block.duration}min</p>}
                    {block.prompt && <p className="text-sm text-muted-foreground italic">{block.prompt}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="fixed bottom-24 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-card border border-border p-2 rounded-full shadow-xl z-50">
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:bg-destructive/20 hover:text-destructive rounded-full"
                onClick={() => handleRejectPlan(pendingStagedPlan._id)}
                title="Reject plan"
              >
                <X size={20} />
              </Button>
              <Button
                size="icon"
                className="bg-teal-500 hover:bg-teal-400 text-white rounded-full shadow-lg shadow-teal-500/20"
                onClick={() => handleAcceptPlan(pendingStagedPlan._id, (pendingStagedPlan.data as { blocks: PlanBlock[] }).blocks)}
                title="Accept plan"
              >
                <Check size={20} />
              </Button>
            </div>
          </div>
        )}

        {existingPlan && (
          <div className="space-y-4">
            <div className="bg-teal-500/10 border border-teal-500/30 p-3 rounded-xl text-center">
              <p className="text-sm text-teal-400 font-medium flex items-center justify-center gap-2">
                <Check size={16} /> Plan accepted
              </p>
            </div>
            {(existingPlan.blocks as PlanBlock[]).map((block: PlanBlock, i: number) => (
              <Card key={i} className="glass">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-primary">{block.title || block.type || "Block"}</CardTitle>
                </CardHeader>
                <CardContent>
                  {block.items && (
                    <ul className="space-y-1">
                      {block.items.map((item, idx) => <li key={idx} className="text-sm text-foreground">{item}</li>)}
                    </ul>
                  )}
                  {block.tasks && (
                    <ul className="space-y-1">
                      {block.tasks.map((task, idx) => <li key={idx} className="text-sm text-foreground">{task}</li>)}
                    </ul>
                  )}
                  {block.task && <p className="text-sm text-foreground">{block.task}</p>}
                  {block.startTime && <p className="text-xs text-primary mt-2">{block.startTime} - {block.duration}min</p>}
                  {block.prompt && <p className="text-sm text-foreground italic">{block.prompt}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
