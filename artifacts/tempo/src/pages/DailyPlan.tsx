import { useState } from "react";
import { useAiGeneratePlan, useListTasks, useListDailyPlans } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Sparkles, Check, X, Edit3 } from "lucide-react";
import { format } from "date-fns";

export default function DailyPlan() {
  const { data: plans } = useListDailyPlans({ date: new Date().toISOString().split('T')[0] });
  const { data: todayTasks } = useListTasks({ status: "today" });
  const generatePlan = useAiGeneratePlan();
  
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);

  const existingPlan = plans && plans.length > 0 ? plans[0] : null;

  const handleGenerate = async () => {
    const res = await generatePlan.mutateAsync({
      data: {
        date: new Date().toISOString().split('T')[0],
        taskIds: todayTasks?.map(t => t.id) || []
      }
    });
    setGeneratedPlan(res);
  };

  const hasPlan = !!existingPlan || !!generatedPlan;

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar className="text-primary h-8 w-8" />
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Daily Plan</h1>
            <p className="text-sm text-primary font-medium">{format(new Date(), 'EEEE, MMMM do')}</p>
          </div>
        </div>
      </div>

      {!hasPlan && (
        <Card className="glass border-dashed border-primary/50 text-center py-12">
          <CardContent className="space-y-6">
            <div className="w-20 h-20 bg-primary/10 rounded-full mx-auto flex items-center justify-center">
              <Sparkles className="text-primary w-10 h-10" />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-2">Let's plan your day</h2>
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

      {generatedPlan && !existingPlan && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
          <div className="bg-primary/10 border border-primary/30 p-4 rounded-xl">
            <h3 className="font-semibold text-primary mb-1">AI Reasoning</h3>
            <p className="text-sm text-foreground/80">{generatedPlan.reasoning}</p>
          </div>

          <div className="space-y-4">
            {generatedPlan.blocks.map((block: any, i: number) => (
              <Card key={i} className="glass">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{block.title || block.type}</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="whitespace-pre-wrap font-sans text-sm text-muted-foreground">
                    {JSON.stringify(block, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-card border border-border p-2 rounded-full shadow-xl">
            <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/20 hover:text-destructive rounded-full" onClick={() => setGeneratedPlan(null)}>
              <X size={20} />
            </Button>
            <Button variant="ghost" size="icon" className="text-foreground hover:bg-white/10 rounded-full">
              <Edit3 size={20} />
            </Button>
            <Button size="icon" className="bg-teal-500 hover:bg-teal-400 text-white rounded-full shadow-lg shadow-teal-500/20">
              <Check size={20} />
            </Button>
          </div>
        </div>
      )}

      {existingPlan && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button variant="outline" size="sm" className="gap-2">
              <Edit3 size={16} /> Edit Plan
            </Button>
          </div>
          {existingPlan.blocks.map((block: any, i: number) => (
            <Card key={i} className="glass">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-primary">{block.title || "Block"}</CardTitle>
              </CardHeader>
              <CardContent>
                 <pre className="whitespace-pre-wrap font-sans text-sm">
                    {JSON.stringify(block, null, 2)}
                  </pre>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}