"use client";

import { useState } from "react";
import { Button, Pill, SoftCard } from "@tempo/ui/primitives";
import { mockSettingsSections, mockUser } from "@tempo/mock-data";
import { ScreenHeader } from "@/components/tempo/ScreenHeader";
import { useDemoToast } from "@/components/tempo/DemoToast";

/**
 * SettingsProfileScreen — profile pane of the settings tri-fold.
 * @source docs/design/claude-export/design-system/screens-6.jsx (ScreenSettingsProfile)
 */
export function SettingsProfileScreen() {
  const toast = useDemoToast();
  const [name, setName] = useState(mockUser.name);
  const [email, setEmail] = useState(mockUser.email);
  const [timezone, setTimezone] = useState(mockUser.timezone);
  const [dyslexia, setDyslexia] = useState(false);

  return (
    <div className="flex flex-col">
      <ScreenHeader
        eyebrow="Settings"
        title="Profile"
        lede="Name, email, timezone, and accessibility preferences."
        badge={{ label: `${mockUser.tier} tier`, tone: "orange" }}
      />

      <div className="grid gap-5 px-6 py-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <SoftCard tone="default" padding="md">
          <h3 className="mb-3 text-h4 font-serif">You</h3>
          <div className="flex flex-col gap-4">
            <label className="flex flex-col gap-1 text-small">
              <span className="font-eyebrow">Display name</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-lg border border-border-soft bg-surface-sunken px-3 py-2 text-body focus:border-primary focus:outline-none"
                /*
                 * @behavior: Save display name on blur (debounced).
                 * @convex-mutation-needed: profiles.updateDisplayName
                 */
              />
            </label>
            <label className="flex flex-col gap-1 text-small">
              <span className="font-eyebrow">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-lg border border-border-soft bg-surface-sunken px-3 py-2 text-body focus:border-primary focus:outline-none"
                /*
                 * @behavior: Change contact email; sends verification link.
                 * @convex-action-needed: auth.changeEmail
                 * @provider-needed: convex-auth
                 */
              />
            </label>
            <label className="flex flex-col gap-1 text-small">
              <span className="font-eyebrow">Timezone</span>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="rounded-lg border border-border-soft bg-surface-sunken px-3 py-2 text-body focus:border-primary focus:outline-none"
                /*
                 * @behavior: Save timezone; used for daily midnight reset + voice caps.
                 * @convex-mutation-needed: profiles.setTimezone
                 */
              >
                {[
                  "Asia/Jerusalem",
                  "Europe/London",
                  "America/New_York",
                  "America/Los_Angeles",
                  "UTC",
                ].map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-5 flex items-center justify-between rounded-lg bg-surface-sunken p-3">
            <div>
              <div className="text-small">OpenDyslexic typeface</div>
              <div className="text-caption text-muted-foreground">
                Switches body text to a dyslexia-friendly font system-wide.
              </div>
            </div>
            {/*
             * @behavior: Persist accessibility preference; re-renders root typography.
             * @convex-mutation-needed: profiles.setTypographyPreference
             * @schema-delta: profiles.typographyPreference
             */}
            <Button
              variant={dyslexia ? "primary" : "soft"}
              size="sm"
              onClick={() => {
                setDyslexia((prev) => !prev);
                toast(
                  dyslexia
                    ? "OpenDyslexic off. (demo)"
                    : "OpenDyslexic on. (demo)",
                );
              }}
            >
              {dyslexia ? "On" : "Off"}
            </Button>
          </div>

          <div className="mt-5 flex items-center justify-end">
            {/*
             * @behavior: Persist all profile fields above.
             * @convex-mutation-needed: profiles.saveProfile
             */}
            <Button
              variant="primary"
              size="md"
              onClick={() => toast("Saved. (demo) profiles.saveProfile.")}
            >
              Save changes
            </Button>
          </div>
        </SoftCard>

        <div className="flex flex-col gap-5">
          <SoftCard tone="default" padding="md">
            <div className="font-eyebrow mb-2">Settings sections</div>
            <ul className="flex flex-col gap-3">
              {mockSettingsSections.map((section) => (
                <li
                  key={section.id}
                  className="flex items-center justify-between rounded-lg bg-surface-sunken p-3"
                >
                  <div>
                    <div className="text-small">{section.label}</div>
                    <div className="text-caption text-muted-foreground">
                      {section.detail}
                    </div>
                  </div>
                  <Pill tone="neutral">open</Pill>
                </li>
              ))}
            </ul>
          </SoftCard>

          <SoftCard tone="sunken" padding="md">
            <div className="font-eyebrow mb-2">Account</div>
            <div className="flex flex-col gap-2">
              {/*
               * @behavior: Download a zip of every note, task, habit, and journal entry.
               * @convex-action-needed: account.exportAllData
               */}
              <Button
                variant="soft"
                size="sm"
                onClick={() => toast("Export queued. (demo) account.exportAllData.")}
              >
                Export my data
              </Button>
              {/*
               * @behavior: Sign the user out of this device.
               * @convex-action-needed: auth.signOut
               */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toast("Signed out. (demo) auth.signOut.")}
              >
                Sign out
              </Button>
              {/*
               * @behavior: Delete account; soft-delete with 30-day grace period.
               * @convex-action-needed: account.requestDeletion
               * @confirm: typed confirmation "delete my tempo flow"
               */}
              <Button
                variant="destructive"
                size="sm"
                onClick={() => toast("Deletion requested. (demo) account.requestDeletion.")}
              >
                Delete account
              </Button>
            </div>
          </SoftCard>
        </div>
      </div>
    </div>
  );
}
