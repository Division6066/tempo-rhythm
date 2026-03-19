import { useState, useEffect } from "react";
import { useGetPreferences, useUpdatePreferences, getGetPreferencesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Settings2, Sun, Moon, Brain, Clock, Battery, Zap, Loader2, CheckCircle } from "lucide-react";

const ENERGY_OPTIONS = [
  { id: "early_morning", label: "Early Morning", desc: "6–9 AM", icon: "🌅" },
  { id: "late_morning", label: "Late Morning", desc: "9–12 PM", icon: "☀️" },
  { id: "early_afternoon", label: "Early Afternoon", desc: "12–3 PM", icon: "🌤" },
  { id: "late_afternoon", label: "Late Afternoon", desc: "3–6 PM", icon: "🌇" },
  { id: "evening", label: "Evening", desc: "6–9 PM", icon: "🌙" },
  { id: "night", label: "Night", desc: "9 PM+", icon: "🦉" },
];

export default function Preferences() {
  const { data: prefs, isLoading } = useGetPreferences();
  const updatePrefs = useUpdatePreferences();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    wakeTime: "07:00",
    sleepTime: "23:00",
    focusSessionMinutes: 25,
    breakMinutes: 5,
    prepBufferMinutes: 10,
    energyPeaks: [] as string[],
    planningStyle: "morning" as "morning" | "reactive" | "evening",
    adhdMode: true,
  });

  useEffect(() => {
    if (prefs) {
      setFormData({
        wakeTime: prefs.wakeTime || "07:00",
        sleepTime: prefs.sleepTime || "23:00",
        focusSessionMinutes: prefs.focusSessionMinutes || 25,
        breakMinutes: prefs.breakMinutes || 5,
        prepBufferMinutes: prefs.prepBufferMinutes || 10,
        energyPeaks: (prefs.energyPeaks as string[]) || [],
        planningStyle: (prefs.planningStyle as "morning" | "reactive" | "evening") || "morning",
        adhdMode: prefs.adhdMode ?? true,
      });
    }
  }, [prefs]);

  const setField = (key: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const toggleEnergyPeak = (id: string) => {
    const current = formData.energyPeaks;
    const updated = current.includes(id) ? current.filter((e) => e !== id) : [...current, id];
    setField("energyPeaks", updated);
  };

  const handleSave = async () => {
    try {
      await updatePrefs.mutateAsync({
        data: {
          wakeTime: formData.wakeTime,
          sleepTime: formData.sleepTime,
          focusSessionMinutes: formData.focusSessionMinutes,
          breakMinutes: formData.breakMinutes,
          prepBufferMinutes: formData.prepBufferMinutes,
          energyPeaks: formData.energyPeaks,
          planningStyle: formData.planningStyle,
          adhdMode: formData.adhdMode,
        },
      });
      queryClient.invalidateQueries({ queryKey: getGetPreferencesQueryKey() });
      toast({ title: "Preferences saved" });
    } catch {
      toast({ variant: "destructive", title: "Failed to save preferences" });
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="w-16 h-16 rounded-full animate-breathe bg-primary/20" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center gap-3">
        <Settings2 className="text-primary h-8 w-8" />
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Preferences</h1>
          <p className="text-sm text-muted-foreground">Personalize your Tempo experience</p>
        </div>
      </div>

      <Card className="glass border-border/50">
        <CardContent className="p-6 space-y-5">
          <h2 className="font-semibold text-base flex items-center gap-2 border-b border-border/50 pb-2">
            <Brain size={16} className="text-primary" /> Work Style
          </h2>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">ADHD Mode</Label>
              <p className="text-xs text-muted-foreground mt-0.5">Gentle prompts, visual chunking, and overwhelm reduction</p>
            </div>
            <Switch
              checked={formData.adhdMode}
              onCheckedChange={(v) => setField("adhdMode", v)}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Planning Style</Label>
            <Select value={formData.planningStyle} onValueChange={(v) => setField("planningStyle", v)}>
              <SelectTrigger className="bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="morning">Morning Planner — plan the night before or morning</SelectItem>
                <SelectItem value="reactive">Reactive — handle things as they come</SelectItem>
                <SelectItem value="evening">Evening Planner — review and plan in the evening</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="glass border-border/50">
        <CardContent className="p-6 space-y-5">
          <h2 className="font-semibold text-base flex items-center gap-2 border-b border-border/50 pb-2">
            <Clock size={16} className="text-muted-foreground" /> Daily Routine
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm flex items-center gap-1.5">
                <Sun size={14} /> Wake Time
              </Label>
              <Input
                type="time"
                value={formData.wakeTime}
                onChange={(e) => setField("wakeTime", e.target.value)}
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm flex items-center gap-1.5">
                <Moon size={14} /> Sleep Time
              </Label>
              <Input
                type="time"
                value={formData.sleepTime}
                onChange={(e) => setField("sleepTime", e.target.value)}
                className="bg-background"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Prep Buffer — time needed before tasks start (minutes)</Label>
            <div className="flex items-center gap-3">
              <Slider
                min={0}
                max={30}
                step={5}
                value={[formData.prepBufferMinutes]}
                onValueChange={([v]) => setField("prepBufferMinutes", v)}
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground w-10 text-right">{formData.prepBufferMinutes}m</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="glass border-border/50">
        <CardContent className="p-6 space-y-5">
          <h2 className="font-semibold text-base flex items-center gap-2 border-b border-border/50 pb-2">
            <Zap size={16} className="text-muted-foreground" /> Focus Sessions
          </h2>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm">Focus Duration</Label>
              <div className="flex items-center gap-3">
                <Slider
                  min={10}
                  max={90}
                  step={5}
                  value={[formData.focusSessionMinutes]}
                  onValueChange={([v]) => setField("focusSessionMinutes", v)}
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground w-12 text-right">{formData.focusSessionMinutes}m</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Break Duration</Label>
              <div className="flex items-center gap-3">
                <Slider
                  min={1}
                  max={30}
                  step={1}
                  value={[formData.breakMinutes]}
                  onValueChange={([v]) => setField("breakMinutes", v)}
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground w-12 text-right">{formData.breakMinutes}m</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="glass border-border/50">
        <CardContent className="p-6 space-y-4">
          <h2 className="font-semibold text-base flex items-center gap-2 border-b border-border/50 pb-2">
            <Battery size={16} className="text-muted-foreground" /> Energy Peaks
          </h2>
          <p className="text-sm text-muted-foreground">When do you feel most focused? AI uses this to schedule high-energy tasks.</p>
          <div className="grid grid-cols-2 gap-3">
            {ENERGY_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => toggleEnergyPeak(opt.id)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  formData.energyPeaks.includes(opt.id)
                    ? "bg-primary/10 border-primary/50"
                    : "bg-card border-border hover:bg-muted/50"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-base">{opt.icon}</span>
                  {formData.energyPeaks.includes(opt.id) && (
                    <CheckCircle size={14} className="text-primary" />
                  )}
                </div>
                <h3 className="text-xs font-medium">{opt.label}</h3>
                <p className="text-[10px] text-muted-foreground">{opt.desc}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Button
        onClick={handleSave}
        disabled={updatePrefs.isPending}
        className="w-full h-12 text-base"
      >
        {updatePrefs.isPending ? (
          <><Loader2 size={16} className="mr-2 animate-spin" />Saving...</>
        ) : (
          "Save Preferences"
        )}
      </Button>
    </div>
  );
}
