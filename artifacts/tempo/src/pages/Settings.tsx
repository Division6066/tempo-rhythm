import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useGetPreferences, useUpdatePreferences, getGetPreferencesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Settings as SettingsIcon, BrainCircuit, Clock, Moon, Sun, Calendar,
  StickyNote, Filter, LayoutTemplate, FileText, FolderKanban, MessageSquare,
  ChevronRight, FolderOpen, Tag, Brain, Timer, Zap, Battery, CheckCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const NAV_LINKS = [
  { label: "Notes", icon: FileText, path: "/notes" },
  { label: "Projects", icon: FolderKanban, path: "/projects" },
  { label: "Areas / Folders", icon: FolderOpen, path: "/folders" },
  { label: "Tags", icon: Tag, path: "/tags" },
  { label: "Period Notes", icon: StickyNote, path: "/period-notes" },
  { label: "Task Filters", icon: Filter, path: "/filters" },
  { label: "Templates", icon: LayoutTemplate, path: "/templates" },
  { label: "Daily Plan", icon: Calendar, path: "/plan" },
  { label: "Focus Timer", icon: Timer, path: "/focus" },
  { label: "AI Chat", icon: MessageSquare, path: "/chat" },
  { label: "AI Memory", icon: Brain, path: "/memories" },
];

const ENERGY_OPTIONS = [
  { id: "early_morning", label: "Early Morning", desc: "6–9 AM", icon: "🌅" },
  { id: "late_morning", label: "Late Morning", desc: "9–12 PM", icon: "☀️" },
  { id: "early_afternoon", label: "Early Afternoon", desc: "12–3 PM", icon: "🌤" },
  { id: "late_afternoon", label: "Late Afternoon", desc: "3–6 PM", icon: "🌇" },
  { id: "evening", label: "Evening", desc: "6–9 PM", icon: "🌙" },
  { id: "night", label: "Night", desc: "9 PM+", icon: "🦉" },
];

export default function Settings() {
  const [, setLocation] = useLocation();
  const { data: prefs, isLoading } = useGetPreferences();
  const updatePrefs = useUpdatePreferences();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    adhdMode: true,
    wakeTime: "07:00",
    sleepTime: "23:00",
    focusSessionMinutes: 25,
    breakMinutes: 5,
    energyPeaks: [] as string[],
    planningStyle: "morning" as string,
  });

  useEffect(() => {
    if (prefs) {
      setFormData({
        adhdMode: prefs.adhdMode,
        wakeTime: prefs.wakeTime,
        sleepTime: prefs.sleepTime,
        focusSessionMinutes: prefs.focusSessionMinutes,
        breakMinutes: prefs.breakMinutes,
        energyPeaks: (prefs.energyPeaks as string[]) || [],
        planningStyle: (prefs.planningStyle as string) || "morning",
      });
    }
  }, [prefs]);

  const handleChange = (key: string, value: string | number | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const toggleEnergyPeak = (id: string) => {
    const current = formData.energyPeaks;
    const updated = current.includes(id) ? current.filter(e => e !== id) : [...current, id];
    handleChange("energyPeaks", updated);
  };

  const handleSave = async () => {
    try {
      await updatePrefs.mutateAsync({ data: formData });
      queryClient.invalidateQueries({ queryKey: getGetPreferencesQueryKey() });
      toast({ title: "Settings saved" });
    } catch {
      toast({ variant: "destructive", title: "Failed to save settings" });
    }
  };

  if (isLoading) {
    return <div className="flex h-[50vh] items-center justify-center"><div className="w-16 h-16 rounded-full animate-breathe bg-primary/20" /></div>;
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center gap-3">
        <SettingsIcon className="text-muted-foreground h-8 w-8" />
        <h1 className="text-3xl font-display font-bold text-foreground">Settings</h1>
      </div>

      <Card className="glass border-border/50">
        <CardContent className="p-4 space-y-1">
          {NAV_LINKS.map((link) => (
            <button
              key={link.path}
              onClick={() => setLocation(link.path)}
              className="w-full flex items-center justify-between px-3 py-3 rounded-lg hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-3">
                <link.icon size={18} className="text-primary" />
                <span className="text-sm font-medium">{link.label}</span>
              </div>
              <ChevronRight size={16} className="text-muted-foreground" />
            </button>
          ))}
        </CardContent>
      </Card>

      <Card className="glass border-border/50">
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base flex items-center gap-2">
                <BrainCircuit className="text-primary" size={18} />
                ADHD Mode
              </Label>
              <p className="text-sm text-muted-foreground">Gentle prompts, visual chunking, and overwhelm reduction.</p>
            </div>
            <Switch 
              checked={formData.adhdMode}
              onCheckedChange={(c) => handleChange("adhdMode", c)}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="glass border-border/50">
        <CardContent className="p-6 space-y-6">
          <h2 className="font-semibold text-lg border-b border-border/50 pb-2 flex items-center gap-2">
            <Clock size={18} className="text-muted-foreground" /> Routine
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Sun size={16}/> Wake Time</Label>
              <Input 
                type="time" 
                value={formData.wakeTime}
                onChange={(e) => handleChange("wakeTime", e.target.value)}
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Moon size={16}/> Sleep Time</Label>
              <Input 
                type="time" 
                value={formData.sleepTime}
                onChange={(e) => handleChange("sleepTime", e.target.value)}
                className="bg-background"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="glass border-border/50">
        <CardContent className="p-6 space-y-6">
          <h2 className="font-semibold text-lg border-b border-border/50 pb-2 flex items-center gap-2">
            <Timer size={18} className="text-muted-foreground" /> Focus Sessions
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Zap size={16} className="text-primary"/> Focus (min)</Label>
              <Input 
                type="number" 
                value={formData.focusSessionMinutes}
                onChange={(e) => handleChange("focusSessionMinutes", parseInt(e.target.value))}
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Clock size={16} className="text-muted-foreground"/> Break (min)</Label>
              <Input 
                type="number" 
                value={formData.breakMinutes}
                onChange={(e) => handleChange("breakMinutes", parseInt(e.target.value))}
                className="bg-background"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="glass border-border/50">
        <CardContent className="p-6 space-y-4">
          <h2 className="font-semibold text-lg border-b border-border/50 pb-2 flex items-center gap-2">
            <Battery size={18} className="text-muted-foreground" /> Energy Peaks
          </h2>
          <p className="text-sm text-muted-foreground">When do you feel most focused? AI uses this to schedule high-energy tasks at your peak times.</p>
          <div className="grid grid-cols-2 gap-3">
            {ENERGY_OPTIONS.map(opt => (
              <button
                key={opt.id}
                onClick={() => toggleEnergyPeak(opt.id)}
                className={`p-3 rounded-xl border transition-all text-left ${
                  formData.energyPeaks.includes(opt.id)
                    ? "bg-teal-500/10 border-teal-500"
                    : "bg-card border-border"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-lg">{opt.icon}</span>
                  {formData.energyPeaks.includes(opt.id) && <CheckCircle size={14} className="text-teal-500" />}
                </div>
                <h3 className="font-medium text-sm">{opt.label}</h3>
                <p className="text-[10px] text-muted-foreground">{opt.desc}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={updatePrefs.isPending} className="w-full h-12 text-lg">
        {updatePrefs.isPending ? "Saving..." : "Save Settings"}
      </Button>
    </div>
  );
}
