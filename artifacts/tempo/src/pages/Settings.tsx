import { useState, useEffect, useRef, useCallback, type ReactNode } from "react";
import { useLocation } from "wouter";
import {
  useGetPreferences,
  useUpdatePreferences,
  useListNoteTemplates,
  useDeleteAccount,
  useResetMemories,
  getGetPreferencesQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Settings as SettingsIcon,
  BrainCircuit,
  Clock,
  Moon,
  Sun,
  Calendar,
  StickyNote,
  Filter,
  LayoutTemplate,
  FileText,
  FolderKanban,
  MessageSquare,
  ChevronRight,
  FolderOpen,
  Tag,
  Brain,
  Timer,
  Zap,
  Battery,
  CheckCircle,
  Upload,
  Download,
  FileJson,
  FileType,
  Loader2,
  Bell,
  BellOff,
  Palette,
  Shield,
  AlertTriangle,
  Trash2,
  DatabaseBackup,
  Cpu,
  Eye,
  Mic,
  Smartphone,
  Share,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/components/providers/ThemeProvider";

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

const SECTIONS = [
  { id: "profile", label: "Profile & Navigation", icon: SettingsIcon },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "app", label: "App", icon: Smartphone },
  { id: "planning", label: "Planning & Schedule", icon: Clock },
  { id: "calendar", label: "Calendar", icon: Calendar },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "ai", label: "AI", icon: Cpu },
  { id: "templates", label: "Templates", icon: LayoutTemplate },
  { id: "data", label: "Data & Privacy", icon: Shield },
  { id: "lorepack", label: "Lore Pack", icon: Upload },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

function SettingsAccordion({
  sectionId,
  expanded,
  onToggle,
  children,
}: {
  sectionId: SectionId;
  expanded: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  const section = SECTIONS.find((s) => s.id === sectionId);
  if (!section) return null;
  const Icon = section.icon;

  return (
    <div id={`settings-section-${sectionId}`}>
      <button
        onClick={onToggle}
        className="lg:hidden w-full flex items-center justify-between px-4 py-3 rounded-lg bg-muted/50 text-sm font-medium transition-colors hover:bg-muted mb-2"
      >
        <div className="flex items-center gap-2">
          <Icon size={16} className="text-primary" />
          {section.label}
        </div>
        <ChevronRight
          size={14}
          className={`text-muted-foreground transition-transform duration-200 ${expanded ? "rotate-90" : ""}`}
        />
      </button>
      <div className={`${expanded ? "block" : "hidden"} lg:block`}>
        {children}
      </div>
    </div>
  );
}

function SegmentedControl({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex rounded-lg border border-border bg-muted/50 p-0.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            value === opt.value
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function SelectControl({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-2">
      <Label>Theme</Label>
      <SegmentedControl
        options={[
          { value: "dark", label: "Dark" },
          { value: "light", label: "Light" },
        ]}
        value={theme}
        onChange={(v) => setTheme(v as "dark" | "light")}
      />
    </div>
  );
}

export default function Settings() {
  const [, setLocation] = useLocation();
  const { data: prefs, isLoading } = useGetPreferences();
  const updatePrefs = useUpdatePreferences();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState<SectionId>("profile");
  const [expandedSections, setExpandedSections] = useState<Set<SectionId>>(new Set(["profile"]));

  const [formData, setFormData] = useState({
    adhdMode: true,
    wakeTime: "07:00",
    sleepTime: "23:00",
    focusSessionMinutes: 25,
    breakMinutes: 5,
    energyPeaks: [] as string[],
    planningStyle: "morning" as string,
    calendarLayout: "separate",
    defaultCalendarView: "week",
    timeSlotSnapMinutes: 30,
    workingHoursStart: "09:00",
    workingHoursEnd: "17:00",
    showWeekends: true,
    firstDayOfWeek: "monday",
    dateFormat: "MM/DD/YYYY",
    timeFormat: "12h",
    notificationsEnabled: false,
    notificationLeadMinutes: 10,
    dailyPlanReminderTime: "08:00",
    aiAutoCategorize: true,
    aiModel: "auto",
    deepThinkDefault: false,
    memoryAutoUpdate: true,
    voiceTranscriptionPrompt: "",
    defaultTemplates: {} as Record<string, number>,
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
        calendarLayout: prefs.calendarLayout || "separate",
        defaultCalendarView: prefs.defaultCalendarView || "week",
        timeSlotSnapMinutes: prefs.timeSlotSnapMinutes ?? 30,
        workingHoursStart: prefs.workingHoursStart || "09:00",
        workingHoursEnd: prefs.workingHoursEnd || "17:00",
        showWeekends: prefs.showWeekends ?? true,
        firstDayOfWeek: prefs.firstDayOfWeek || "monday",
        dateFormat: prefs.dateFormat || "MM/DD/YYYY",
        timeFormat: prefs.timeFormat || "12h",
        notificationsEnabled: prefs.notificationsEnabled ?? false,
        notificationLeadMinutes: prefs.notificationLeadMinutes ?? 10,
        dailyPlanReminderTime: prefs.dailyPlanReminderTime || "08:00",
        aiAutoCategorize: prefs.aiAutoCategorize ?? true,
        aiModel: prefs.aiModel || "auto",
        deepThinkDefault: prefs.deepThinkDefault ?? false,
        memoryAutoUpdate: prefs.memoryAutoUpdate ?? true,
        voiceTranscriptionPrompt: prefs.voiceTranscriptionPrompt || "",
        defaultTemplates: (prefs.defaultTemplates as Record<string, number>) || {},
      });
    }
  }, [prefs]);

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const persistPreferences = useCallback(
    async (data: typeof formData) => {
      try {
        await updatePrefs.mutateAsync({ data: data as unknown as import("@workspace/api-client-react").UpdatePreferencesBody });
        queryClient.invalidateQueries({ queryKey: getGetPreferencesQueryKey() });
        toast({ title: "Settings saved" });
      } catch {
        toast({ variant: "destructive", title: "Failed to save settings" });
      }
    },
    [updatePrefs, queryClient, toast],
  );

  const debouncedSave = useCallback(
    (data: typeof formData) => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        persistPreferences(data);
      }, 600);
    },
    [persistPreferences],
  );

  const handleChange = (key: string, value: string | number | boolean | string[] | Record<string, number>) => {
    setFormData((prev) => {
      const next = { ...prev, [key]: value };
      debouncedSave(next);
      return next;
    });
  };

  const toggleEnergyPeak = (id: string) => {
    const current = formData.energyPeaks;
    const updated = current.includes(id) ? current.filter((e) => e !== id) : [...current, id];
    handleChange("energyPeaks", updated);
  };

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  const scrollToSection = (id: SectionId) => {
    setActiveSection(id);
    const el = document.getElementById(`settings-section-${id}`);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const toggleSection = (id: SectionId) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="w-16 h-16 rounded-full animate-breathe bg-primary/20" />
      </div>
    );
  }

  return (
    <div className="flex gap-6 pb-12">
      <aside className="hidden lg:block w-52 shrink-0 sticky top-4 self-start">
        <nav className="space-y-0.5">
          {SECTIONS.map((sec) => (
            <button
              key={sec.id}
              onClick={() => scrollToSection(sec.id)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                activeSection === sec.id
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <sec.icon size={16} />
              {sec.label}
            </button>
          ))}
        </nav>
      </aside>

      <div className="flex-1 space-y-6 min-w-0">
        <div className="flex items-center gap-3">
          <SettingsIcon className="text-muted-foreground h-8 w-8" />
          <h1 className="text-3xl font-display font-bold text-foreground">Settings</h1>
        </div>

        <SettingsAccordion sectionId="profile" expanded={expandedSections.has("profile")} onToggle={() => toggleSection("profile")}>
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
        </SettingsAccordion>

        <SettingsAccordion sectionId="appearance" expanded={expandedSections.has("appearance")} onToggle={() => toggleSection("appearance")}>
          <Card className="glass border-border/50">
            <CardContent className="p-6 space-y-6">
              <h2 className="font-semibold text-lg border-b border-border/50 pb-2 flex items-center gap-2">
                <Palette size={18} className="text-muted-foreground" /> Appearance
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base flex items-center gap-2">
                      <BrainCircuit className="text-primary" size={18} />
                      ADHD Mode
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Gentle prompts, visual chunking, and overwhelm reduction.
                    </p>
                  </div>
                  <Switch checked={formData.adhdMode} onCheckedChange={(c) => handleChange("adhdMode", c)} />
                </div>

                <ThemeSelector />

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date Format</Label>
                    <SelectControl
                      options={[
                        { value: "MM/DD/YYYY", label: "MM/DD/YYYY" },
                        { value: "DD/MM/YYYY", label: "DD/MM/YYYY" },
                        { value: "YYYY-MM-DD", label: "YYYY-MM-DD" },
                      ]}
                      value={formData.dateFormat}
                      onChange={(v) => handleChange("dateFormat", v)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Time Format</Label>
                    <SegmentedControl
                      options={[
                        { value: "12h", label: "12h" },
                        { value: "24h", label: "24h" },
                      ]}
                      value={formData.timeFormat}
                      onChange={(v) => handleChange("timeFormat", v)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </SettingsAccordion>

        <SettingsAccordion sectionId="app" expanded={expandedSections.has("app")} onToggle={() => toggleSection("app")}>
          <InstallAppSection />
        </SettingsAccordion>

        <SettingsAccordion sectionId="planning" expanded={expandedSections.has("planning")} onToggle={() => toggleSection("planning")}>
          <Card className="glass border-border/50">
            <CardContent className="p-6 space-y-6">
              <h2 className="font-semibold text-lg border-b border-border/50 pb-2 flex items-center gap-2">
                <Clock size={18} className="text-muted-foreground" /> Planning & Schedule
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Sun size={16} /> Wake Time
                  </Label>
                  <Input
                    type="time"
                    value={formData.wakeTime}
                    onChange={(e) => handleChange("wakeTime", e.target.value)}
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Moon size={16} /> Sleep Time
                  </Label>
                  <Input
                    type="time"
                    value={formData.sleepTime}
                    onChange={(e) => handleChange("sleepTime", e.target.value)}
                    className="bg-background"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Zap size={16} className="text-primary" /> Focus (min)
                  </Label>
                  <Input
                    type="number"
                    value={formData.focusSessionMinutes}
                    onChange={(e) => handleChange("focusSessionMinutes", parseInt(e.target.value))}
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Clock size={16} className="text-muted-foreground" /> Break (min)
                  </Label>
                  <Input
                    type="number"
                    value={formData.breakMinutes}
                    onChange={(e) => handleChange("breakMinutes", parseInt(e.target.value))}
                    className="bg-background"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium text-sm flex items-center gap-2">
                  <Battery size={16} className="text-muted-foreground" /> Energy Peaks
                </h3>
                <p className="text-sm text-muted-foreground">
                  When do you feel most focused? AI uses this to schedule high-energy tasks at your peak times.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {ENERGY_OPTIONS.map((opt) => (
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
                        {formData.energyPeaks.includes(opt.id) && (
                          <CheckCircle size={14} className="text-teal-500" />
                        )}
                      </div>
                      <h3 className="font-medium text-sm">{opt.label}</h3>
                      <p className="text-[10px] text-muted-foreground">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </SettingsAccordion>

        <SettingsAccordion sectionId="calendar" expanded={expandedSections.has("calendar")} onToggle={() => toggleSection("calendar")}>
          <Card className="glass border-border/50">
            <CardContent className="p-6 space-y-6">
              <h2 className="font-semibold text-lg border-b border-border/50 pb-2 flex items-center gap-2">
                <Calendar size={18} className="text-muted-foreground" /> Calendar
              </h2>

              <div className="space-y-2">
                <Label>Layout</Label>
                <SegmentedControl
                  options={[
                    { value: "separate", label: "Separate" },
                    { value: "unified", label: "Unified" },
                    { value: "hybrid", label: "Hybrid" },
                  ]}
                  value={formData.calendarLayout}
                  onChange={(v) => handleChange("calendarLayout", v)}
                />
              </div>

              <div className="space-y-2">
                <Label>Default View</Label>
                <SegmentedControl
                  options={[
                    { value: "day", label: "Day" },
                    { value: "week", label: "Week" },
                    { value: "month", label: "Month" },
                  ]}
                  value={formData.defaultCalendarView}
                  onChange={(v) => handleChange("defaultCalendarView", v)}
                />
              </div>

              <div className="space-y-2">
                <Label>Snap Interval</Label>
                <SegmentedControl
                  options={[
                    { value: "15", label: "15 min" },
                    { value: "30", label: "30 min" },
                    { value: "60", label: "60 min" },
                  ]}
                  value={String(formData.timeSlotSnapMinutes)}
                  onChange={(v) => handleChange("timeSlotSnapMinutes", parseInt(v))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Working Hours Start</Label>
                  <Input
                    type="time"
                    value={formData.workingHoursStart}
                    onChange={(e) => handleChange("workingHoursStart", e.target.value)}
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Working Hours End</Label>
                  <Input
                    type="time"
                    value={formData.workingHoursEnd}
                    onChange={(e) => handleChange("workingHoursEnd", e.target.value)}
                    className="bg-background"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base flex items-center gap-2">
                    <Eye size={16} /> Show Weekends
                  </Label>
                </div>
                <Switch
                  checked={formData.showWeekends}
                  onCheckedChange={(c) => handleChange("showWeekends", c)}
                />
              </div>

              <div className="space-y-2">
                <Label>First Day of Week</Label>
                <SegmentedControl
                  options={[
                    { value: "sunday", label: "Sunday" },
                    { value: "monday", label: "Monday" },
                  ]}
                  value={formData.firstDayOfWeek}
                  onChange={(v) => handleChange("firstDayOfWeek", v)}
                />
              </div>
            </CardContent>
          </Card>
        </SettingsAccordion>

        <SettingsAccordion sectionId="notifications" expanded={expandedSections.has("notifications")} onToggle={() => toggleSection("notifications")}>
          <Card className="glass border-border/50">
            <CardContent className="p-6 space-y-6">
              <h2 className="font-semibold text-lg border-b border-border/50 pb-2 flex items-center gap-2">
                <Bell size={18} className="text-muted-foreground" /> Notifications
              </h2>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base flex items-center gap-2">
                    {formData.notificationsEnabled ? (
                      <Bell size={16} className="text-primary" />
                    ) : (
                      <BellOff size={16} />
                    )}
                    Enable Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Allow browser notifications for reminders and alerts.
                  </p>
                </div>
                <Switch
                  checked={formData.notificationsEnabled}
                  onCheckedChange={async (c) => {
                    if (c && "Notification" in window) {
                      const permission = await Notification.requestPermission();
                      if (permission !== "granted") {
                        toast({
                          variant: "destructive",
                          title: "Notification permission denied",
                        });
                        return;
                      }
                    }
                    handleChange("notificationsEnabled", c);
                  }}
                />
              </div>

              {formData.notificationsEnabled && (
                <>
                  <div className="space-y-2">
                    <Label>Lead Time</Label>
                    <SelectControl
                      options={[
                        { value: "5", label: "5 minutes before" },
                        { value: "10", label: "10 minutes before" },
                        { value: "15", label: "15 minutes before" },
                        { value: "30", label: "30 minutes before" },
                      ]}
                      value={String(formData.notificationLeadMinutes)}
                      onChange={(v) => handleChange("notificationLeadMinutes", parseInt(v))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Daily Plan Reminder</Label>
                    <Input
                      type="time"
                      value={formData.dailyPlanReminderTime}
                      onChange={(e) => handleChange("dailyPlanReminderTime", e.target.value)}
                      className="bg-background"
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </SettingsAccordion>

        <SettingsAccordion sectionId="ai" expanded={expandedSections.has("ai")} onToggle={() => toggleSection("ai")}>
          <Card className="glass border-border/50">
            <CardContent className="p-6 space-y-6">
              <h2 className="font-semibold text-lg border-b border-border/50 pb-2 flex items-center gap-2">
                <Cpu size={18} className="text-muted-foreground" /> AI Settings
              </h2>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Auto-Categorize Tasks</Label>
                  <p className="text-sm text-muted-foreground">
                    AI automatically assigns categories and tags to new tasks.
                  </p>
                </div>
                <Switch
                  checked={formData.aiAutoCategorize}
                  onCheckedChange={(c) => handleChange("aiAutoCategorize", c)}
                />
              </div>

              <div className="space-y-2">
                <Label>AI Model</Label>
                <Input
                  value={formData.aiModel}
                  onChange={(e) => handleChange("aiModel", e.target.value)}
                  placeholder="auto"
                  className="bg-background"
                />
                <p className="text-xs text-muted-foreground">
                  Set to "auto" to use the default model, or specify a model name.
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Deep Think Default</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable deep reasoning mode by default for AI responses.
                  </p>
                </div>
                <Switch
                  checked={formData.deepThinkDefault}
                  onCheckedChange={(c) => handleChange("deepThinkDefault", c)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Memory Auto-Update</Label>
                  <p className="text-sm text-muted-foreground">
                    AI automatically updates memories from conversations.
                  </p>
                </div>
                <Switch
                  checked={formData.memoryAutoUpdate}
                  onCheckedChange={(c) => handleChange("memoryAutoUpdate", c)}
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Mic size={16} /> Voice Transcription Prompt
                </Label>
                <Textarea
                  value={formData.voiceTranscriptionPrompt}
                  onChange={(e) => handleChange("voiceTranscriptionPrompt", e.target.value)}
                  placeholder="Optional prompt to guide voice transcription (e.g., 'Focus on action items and task extraction')"
                  className="min-h-[80px] bg-background"
                />
              </div>
            </CardContent>
          </Card>
        </SettingsAccordion>

        <SettingsAccordion sectionId="templates" expanded={expandedSections.has("templates")} onToggle={() => toggleSection("templates")}>
          <TemplatesSection
            defaultTemplates={formData.defaultTemplates}
            onChange={(v) => handleChange("defaultTemplates", v)}
          />
        </SettingsAccordion>

        <SettingsAccordion sectionId="data" expanded={expandedSections.has("data")} onToggle={() => toggleSection("data")}>
          <DataPrivacySection />
        </SettingsAccordion>

        <SettingsAccordion sectionId="lorepack" expanded={expandedSections.has("lorepack")} onToggle={() => toggleSection("lorepack")}>
          <LorePackImport />
        </SettingsAccordion>
      </div>
    </div>
  );
}

function TemplatesSection({
  defaultTemplates,
  onChange,
}: {
  defaultTemplates: Record<string, number>;
  onChange: (v: Record<string, number>) => void;
}) {
  const { data: templates } = useListNoteTemplates();
  const periodTypes = ["daily", "weekly", "monthly", "quarterly", "yearly"];

  return (
    <Card className="glass border-border/50">
      <CardContent className="p-6 space-y-6">
        <h2 className="font-semibold text-lg border-b border-border/50 pb-2 flex items-center gap-2">
          <LayoutTemplate size={18} className="text-muted-foreground" /> Default Templates
        </h2>
        <p className="text-sm text-muted-foreground">
          Choose which template to use by default for each period type.
        </p>

        <div className="space-y-3">
          {periodTypes.map((period) => (
            <div key={period} className="flex items-center justify-between gap-4">
              <Label className="capitalize w-24 shrink-0">{period}</Label>
              <select
                value={defaultTemplates[period] ?? ""}
                onChange={(e) => {
                  const val = e.target.value;
                  const updated = { ...defaultTemplates };
                  if (val === "") {
                    delete updated[period];
                  } else {
                    updated[period] = parseInt(val);
                  }
                  onChange(updated);
                }}
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="">None</option>
                {templates?.map((t: { id: number; name: string }) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function DataPrivacySection() {
  const { toast } = useToast();
  const resetMemories = useResetMemories();
  const deleteAccount = useDeleteAccount();
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const baseUrl = import.meta.env.VITE_API_URL || `${window.location.origin}/api`;
      const res = await fetch(`${baseUrl}/export`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("tempo_token")}`,
        },
      });
      if (!res.ok) throw new Error("Export failed");
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `tempo-export-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({ title: "Data exported successfully" });
    } catch {
      toast({ variant: "destructive", title: "Failed to export data" });
    } finally {
      setExporting(false);
    }
  };

  const handleResetMemories = async () => {
    try {
      await resetMemories.mutateAsync();
      setShowResetDialog(false);
      toast({ title: "All memories have been reset" });
    } catch {
      toast({ variant: "destructive", title: "Failed to reset memories" });
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== "DELETE") return;
    try {
      await deleteAccount.mutateAsync();
      setShowDeleteDialog(false);
      toast({ title: "Account deleted" });
      window.location.reload();
    } catch {
      toast({ variant: "destructive", title: "Failed to delete account" });
    }
  };

  return (
    <Card className="glass border-border/50">
      <CardContent className="p-6 space-y-6">
        <h2 className="font-semibold text-lg border-b border-border/50 pb-2 flex items-center gap-2">
          <Shield size={18} className="text-muted-foreground" /> Data & Privacy
        </h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base flex items-center gap-2">
                <Download size={16} /> Export All Data
              </Label>
              <p className="text-sm text-muted-foreground">Download all your data as a JSON file.</p>
            </div>
            <Button variant="outline" onClick={handleExport} disabled={exporting} size="sm">
              {exporting ? <Loader2 size={14} className="animate-spin mr-1" /> : <Download size={14} className="mr-1" />}
              {exporting ? "Exporting..." : "Export"}
            </Button>
          </div>

          <div className="border-t border-border/50 pt-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base flex items-center gap-2">
                  <DatabaseBackup size={16} /> Reset Memories
                </Label>
                <p className="text-sm text-muted-foreground">Delete all AI memories. This cannot be undone.</p>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowResetDialog(true)}
                size="sm"
                className="text-orange-500 border-orange-500/30 hover:bg-orange-500/10"
              >
                Reset
              </Button>
            </div>

            {showResetDialog && (
              <div className="mt-3 p-4 rounded-lg border border-orange-500/30 bg-orange-500/5 space-y-3">
                <p className="text-sm flex items-center gap-2">
                  <AlertTriangle size={16} className="text-orange-500" />
                  Are you sure you want to delete all memories?
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowResetDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleResetMemories}
                    disabled={resetMemories.isPending}
                    className="bg-orange-500 hover:bg-orange-600"
                  >
                    {resetMemories.isPending ? "Resetting..." : "Yes, Reset Memories"}
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-border/50 pt-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base flex items-center gap-2 text-destructive">
                  <Trash2 size={16} /> Delete Account
                </Label>
                <p className="text-sm text-muted-foreground">
                  Permanently delete all data. This action cannot be undone.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(true)}
                size="sm"
                className="text-destructive border-destructive/30 hover:bg-destructive/10"
              >
                Delete
              </Button>
            </div>

            {showDeleteDialog && (
              <div className="mt-3 p-4 rounded-lg border border-destructive/30 bg-destructive/5 space-y-3">
                <p className="text-sm flex items-center gap-2">
                  <AlertTriangle size={16} className="text-destructive" />
                  Type <strong>DELETE</strong> to confirm permanent account deletion.
                </p>
                <Input
                  value={deleteConfirm}
                  onChange={(e) => setDeleteConfirm(e.target.value)}
                  placeholder='Type "DELETE"'
                  className="bg-background"
                />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowDeleteDialog(false);
                      setDeleteConfirm("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleDeleteAccount}
                    disabled={deleteConfirm !== "DELETE" || deleteAccount.isPending}
                  >
                    {deleteAccount.isPending ? "Deleting..." : "Delete Everything"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function InstallAppSection() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(standalone);

    const ios =
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
      !(window as unknown as { MSStream?: unknown }).MSStream;
    setIsIOS(ios);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const installedHandler = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", installedHandler);
    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  return (
    <Card className="glass border-border/50">
      <CardContent className="p-6 space-y-6">
        <h2 className="font-semibold text-lg border-b border-border/50 pb-2 flex items-center gap-2">
          <Smartphone size={18} className="text-muted-foreground" /> App
        </h2>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-base flex items-center gap-2">
              <Download size={16} /> Install App
            </Label>
            <p className="text-sm text-muted-foreground">
              {isInstalled
                ? "TEMPO is installed on your device."
                : isIOS
                  ? "Tap the Share button in Safari, then \"Add to Home Screen\"."
                  : "Install TEMPO for quick access and offline use."}
            </p>
          </div>
          {isInstalled ? (
            <span className="text-xs text-green-400 bg-green-500/10 px-3 py-1.5 rounded-full font-medium flex items-center gap-1">
              <CheckCircle size={14} /> Installed
            </span>
          ) : isIOS ? (
            <span className="text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full font-medium flex items-center gap-1">
              <Share size={14} /> Use Share Menu
            </span>
          ) : deferredPrompt ? (
            <Button size="sm" onClick={handleInstall} className="gap-1.5">
              <Download size={14} /> Install
            </Button>
          ) : (
            <span className="text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full font-medium">
              Not available
            </span>
          )}
        </div>
      </CardContent>
    </Card>
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
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("tempo_token")}`,
        },
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
        headers: { Authorization: `Bearer ${localStorage.getItem("tempo_token")}` },
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
          Import tasks, notes, and memories from JSON, Markdown, or CSV. Use a Lore Pack to quickly set up your
          workspace.
        </p>

        <div className="flex gap-2">
          {(["json", "markdown", "csv"] as const).map((fmt) => (
            <button
              key={fmt}
              onClick={() => {
                setImportFormat(fmt);
                setImportData("");
                setImportResult(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                importFormat === fmt
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {fmt === "json" ? <FileJson size={14} /> : <FileType size={14} />}
              {fmt.toUpperCase()}
            </button>
          ))}
        </div>

        <Textarea
          value={importData}
          onChange={(e) => setImportData(e.target.value)}
          placeholder={
            importFormat === "json"
              ? '{"tasks": [...], "notes": [...], "memories": [...]}'
              : importFormat === "markdown"
                ? "# Tasks\n- Buy groceries [high]\n\n# Notes\n## My Note\nContent here..."
                : 'title,priority,status,notes\n"Task 1",high,inbox,"Details"'
          }
          className="min-h-[120px] font-mono text-xs bg-background"
        />

        <div className="flex gap-2">
          <Button onClick={loadTemplate} variant="outline" size="sm" className="flex items-center gap-1.5">
            <Download size={14} /> Load Template
          </Button>
          <Button
            onClick={handleImport}
            disabled={importing || !importData.trim()}
            size="sm"
            className="flex items-center gap-1.5"
          >
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
