"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Settings as SettingsIcon,
  BrainCircuit,
  Clock,
  Moon,
  Sun,
  FileText,
  Filter,
  BookTemplate,
  Calendar,
  Hash,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
  const prefs = useQuery(api.preferences.get);
  const updatePrefs = useMutation(api.preferences.upsert);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    adhdMode: true,
    wakeTime: "07:00",
    sleepTime: "23:00",
    focusSessionMinutes: 25,
    breakMinutes: 5,
  });

  useEffect(() => {
    if (prefs) {
      setFormData({
        adhdMode: prefs.adhdMode,
        wakeTime: prefs.wakeTime,
        sleepTime: prefs.sleepTime,
        focusSessionMinutes: prefs.focusSessionMinutes,
        breakMinutes: prefs.breakMinutes,
      });
    }
  }, [prefs]);

  const handleChange = (key: string, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updatePrefs(formData);
    } finally {
      setSaving(false);
    }
  };

  if (prefs === undefined) {
    return (
      <AppLayout>
        <div className="flex h-[50vh] items-center justify-center">
          <div className="w-16 h-16 rounded-full animate-breathe bg-primary/20" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 pb-12">
        <div className="flex items-center gap-3">
          <SettingsIcon className="text-muted-foreground h-8 w-8" />
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        </div>

        <Card className="glass border-border/50">
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-base flex items-center gap-2 font-medium">
                  <BrainCircuit className="text-primary" size={18} />
                  ADHD Mode
                </label>
                <p className="text-sm text-muted-foreground">
                  Gentle prompts, visual chunking, and overwhelm reduction.
                </p>
              </div>
              <button
                onClick={() => handleChange("adhdMode", !formData.adhdMode)}
                className={`w-11 h-6 rounded-full transition-colors cursor-pointer ${formData.adhdMode ? "bg-primary" : "bg-muted"}`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full transition-transform ${formData.adhdMode ? "translate-x-5.5" : "translate-x-0.5"}`}
                />
              </button>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border/50">
          <CardContent className="p-6 space-y-6">
            <h2 className="font-semibold text-lg border-b border-border/50 pb-2">
              Routine
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm">
                  <Sun size={16} /> Wake Time
                </label>
                <Input
                  type="time"
                  value={formData.wakeTime}
                  onChange={(e) => handleChange("wakeTime", e.target.value)}
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm">
                  <Moon size={16} /> Sleep Time
                </label>
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
            <h2 className="font-semibold text-lg border-b border-border/50 pb-2">
              Focus Sessions
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm">
                  <Clock size={16} /> Focus (min)
                </label>
                <Input
                  type="number"
                  value={formData.focusSessionMinutes}
                  onChange={(e) =>
                    handleChange(
                      "focusSessionMinutes",
                      parseInt(e.target.value)
                    )
                  }
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm">
                  <Clock size={16} className="text-muted-foreground" /> Break
                  (min)
                </label>
                <Input
                  type="number"
                  value={formData.breakMinutes}
                  onChange={(e) =>
                    handleChange("breakMinutes", parseInt(e.target.value))
                  }
                  className="bg-background"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full h-12 text-lg"
          >
            {saving ? "Saving..." : "Save Settings"}
          </Button>
          <div className="grid grid-cols-2 gap-3">
            <Button asChild variant="outline" className="h-12">
              <Link href="/projects">Projects</Link>
            </Button>
            <Button asChild variant="outline" className="h-12">
              <Link href="/notes">Notes</Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Button asChild variant="outline" className="h-12 gap-2">
              <Link href="/templates">
                <BookTemplate size={16} /> Templates
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-12 gap-2">
              <Link href="/filters">
                <Filter size={16} /> Filters
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Button asChild variant="outline" className="h-12 gap-2">
              <Link href="/calendar">
                <Calendar size={16} /> Calendar
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-12 gap-2">
              <Link href="/chat">
                <MessageSquare size={16} /> AI Chat
              </Link>
            </Button>
          </div>
          <Button asChild variant="outline" className="w-full h-12">
            <Link href="/plan">Daily Plan</Link>
          </Button>
          <div className="mt-4 text-center">
            <p className="text-xs text-muted-foreground">
              Tip: Press Cmd+K (or Ctrl+K) to open the command bar
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
