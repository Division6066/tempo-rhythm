"use client";

import { useMutation, useQuery } from "convex/react";
import { useMemo, useState } from "react";
import { useTheme } from "@/components/providers/ThemeProvider";
import { Label } from "@/components/ui/label";
import { api } from "@/convex/_generated/api";
import { useUserReady } from "@/lib/useUserReady";

type Theme = "system" | "light" | "dark";
type Locale = "en" | "he";
type WeekStartsOn = 0 | 1 | 6;

type PreferencesPatch = {
  theme?: Theme;
  locale?: Locale;
  weekStartsOn?: WeekStartsOn;
  timeZone?: string;
  emailReminders?: boolean;
  inAppNotifications?: boolean;
};

const selectClass = "h-10 rounded-md border border-input bg-background px-3 text-sm";

function listTimeZones(current: string): string[] {
  let zones: string[] = [];
  try {
    zones = Intl.supportedValuesOf("timeZone");
  } catch {
    zones = [];
  }
  return zones.includes(current) ? zones : [current, ...zones];
}

export function PreferencesForm() {
  const userReady = useUserReady();
  const preferences = useQuery(api.preferences.get, userReady ? {} : "skip");
  const updatePreferences = useMutation(api.preferences.update);
  const { setTheme } = useTheme();
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);
  const timeZone = preferences?.timeZone ?? "UTC";
  const timeZones = useMemo(() => listTimeZones(timeZone), [timeZone]);

  if (preferences === undefined) {
    return <p aria-live="polite">Loading your preferences…</p>;
  }

  const save = async (patch: PreferencesPatch) => {
    setFailed(false);
    setMessage("");
    try {
      await updatePreferences(patch);
      if (patch.theme !== undefined) setTheme(patch.theme);
      setMessage("Saved");
    } catch {
      setFailed(true);
      setMessage("Could not save that change. You can try again.");
    }
  };

  return (
    <form onSubmit={(event) => event.preventDefault()} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="pref-theme">Theme</Label>
        <select
          id="pref-theme"
          className={selectClass}
          value={preferences.theme}
          onChange={(event) => save({ theme: event.target.value as Theme })}
        >
          <option value="system">System</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="pref-locale">Language</Label>
        <select
          id="pref-locale"
          className={selectClass}
          value={preferences.locale}
          onChange={(event) => save({ locale: event.target.value as Locale })}
        >
          <option value="en">English</option>
          <option value="he">עברית</option>
        </select>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="pref-week-start">Week starts on</Label>
        <select
          id="pref-week-start"
          className={selectClass}
          value={String(preferences.weekStartsOn)}
          onChange={(event) => save({ weekStartsOn: Number(event.target.value) as WeekStartsOn })}
        >
          <option value="1">Monday</option>
          <option value="0">Sunday</option>
          <option value="6">Saturday</option>
        </select>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="pref-time-zone">Time zone</Label>
        <select
          id="pref-time-zone"
          className={selectClass}
          value={preferences.timeZone}
          onChange={(event) => save({ timeZone: event.target.value })}
        >
          {timeZones.map((zone) => (
            <option key={zone} value={zone}>
              {zone}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <input
          id="pref-email-reminders"
          type="checkbox"
          checked={preferences.emailReminders}
          onChange={(event) => save({ emailReminders: event.target.checked })}
        />
        <Label htmlFor="pref-email-reminders">Email reminders</Label>
      </div>
      <div className="flex items-center gap-2">
        <input
          id="pref-in-app"
          type="checkbox"
          checked={preferences.inAppNotifications}
          onChange={(event) => save({ inAppNotifications: event.target.checked })}
        />
        <Label htmlFor="pref-in-app">In-app notifications</Label>
      </div>
      {message ? (
        <p aria-live="polite" role={failed ? "alert" : "status"}>
          {message}
        </p>
      ) : null}
    </form>
  );
}
