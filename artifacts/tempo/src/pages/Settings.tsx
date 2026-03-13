import { useState, useEffect } from "react";
import { useGetPreferences, useUpdatePreferences, getGetPreferencesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Settings as SettingsIcon, BrainCircuit, Clock, Moon, Sun } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
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

  const handleChange = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      await updatePrefs.mutateAsync({
        data: formData
      });
      queryClient.invalidateQueries({ queryKey: getGetPreferencesQueryKey() });
      toast({ title: "Settings saved" });
    } catch (e) {
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
          <h2 className="font-semibold text-lg border-b border-border/50 pb-2">Routine</h2>
          
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
          <h2 className="font-semibold text-lg border-b border-border/50 pb-2">Focus Sessions</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Clock size={16}/> Focus (min)</Label>
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

      <Button onClick={handleSave} disabled={updatePrefs.isPending} className="w-full h-12 text-lg">
        {updatePrefs.isPending ? "Saving..." : "Save Settings"}
      </Button>
    </div>
  );
}