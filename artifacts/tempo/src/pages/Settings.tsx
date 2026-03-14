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
  ChevronRight, FolderOpen, Tag, Brain, Timer, Zap, Battery, CheckCircle,
  Upload, Download, FileJson, FileType, Loader2
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
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

      <LorePackImport />
    </div>
  );
}

function LorePackImport() {
  const [importFormat, setImportFormat] = useState<"json" | "markdown" | "csv">("json");
  const [importData, setImportData] = useState("");
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ tasks: number; notes: number; memories: number } | null>(null);
  const { toast } = useToast();

  const handleImport = async () => {
    if (!importData.trim()) {
      toast({ variant: "destructive", title: "Paste some data first" });
      return;
    }
    setImporting(true);
    setImportResult(null);
    try {
      const baseUrl = import.meta.env.VITE_API_URL || `${window.location.origin}/api`;
      const res = await fetch(`${baseUrl}/import`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("tempo_token")}` },
        body: JSON.stringify({ format: importFormat, data: importData }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Import failed");
      setImportResult(result.imported);
      setImportData("");
      toast({ title: `Imported ${result.total} items` });
    } catch (err) {
      toast({ variant: "destructive", title: err instanceof Error ? err.message : "Import failed" });
    } finally {
      setImporting(false);
    }
  };

  const loadTemplate = async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || `${window.location.origin}/api`;
      const res = await fetch(`${baseUrl}/import/template?format=${importFormat}`, {
        headers: { "Authorization": `Bearer ${localStorage.getItem("tempo_token")}` },
      });
      const text = importFormat === "json" ? JSON.stringify(await res.json(), null, 2) : await res.text();
      setImportData(text);
    } catch {
      toast({ variant: "destructive", title: "Failed to load template" });
    }
  };

  return (
    <Card className="glass border-border/50">
      <CardContent className="p-6 space-y-4">
        <h2 className="font-semibold text-lg border-b border-border/50 pb-2 flex items-center gap-2">
          <Upload size={18} className="text-muted-foreground" /> Lore Pack Import
        </h2>
        <p className="text-sm text-muted-foreground">
          Import tasks, notes, and memories from JSON, Markdown, or CSV. Use a Lore Pack to quickly set up your workspace.
        </p>

        <div className="flex gap-2">
          {(["json", "markdown", "csv"] as const).map(fmt => (
            <button
              key={fmt}
              onClick={() => { setImportFormat(fmt); setImportData(""); setImportResult(null); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                importFormat === fmt ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {fmt === "json" ? <FileJson size={14} /> : <FileType size={14} />}
              {fmt.toUpperCase()}
            </button>
          ))}
        </div>

        <Textarea
          value={importData}
          onChange={e => setImportData(e.target.value)}
          placeholder={
            importFormat === "json" ? '{"tasks": [...], "notes": [...], "memories": [...]}'
            : importFormat === "markdown" ? "# Tasks\n- Buy groceries [high]\n\n# Notes\n## My Note\nContent here..."
            : "title,priority,status,notes\n\"Task 1\",high,inbox,\"Details\""
          }
          className="min-h-[120px] font-mono text-xs bg-background"
        />

        <div className="flex gap-2">
          <Button onClick={loadTemplate} variant="outline" size="sm" className="flex items-center gap-1.5">
            <Download size={14} /> Load Template
          </Button>
          <Button onClick={handleImport} disabled={importing || !importData.trim()} size="sm" className="flex items-center gap-1.5">
            {importing ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
            {importing ? "Importing..." : "Import"}
          </Button>
        </div>

        {importResult && (
          <div className="p-3 rounded-lg bg-teal-500/10 border border-teal-500/30 text-sm">
            <p className="font-medium text-teal-400">Import complete:</p>
            <ul className="mt-1 space-y-0.5 text-muted-foreground">
              {importResult.tasks > 0 && <li>{importResult.tasks} tasks imported</li>}
              {importResult.notes > 0 && <li>{importResult.notes} notes imported</li>}
              {importResult.memories > 0 && <li>{importResult.memories} memories imported</li>}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
