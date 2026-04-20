/**
 * @screen: settings-profile
 * @category: Settings
 * @source: docs/design/claude-export/design-system/screens-6.jsx
 * @queries: users.getMe (Convex auth + users table by_email)
 * @mutations: users.patchProfile @index by_deletedAt
 * @auth: required
 * @env: NEXT_PUBLIC_CONVEX_URL
 */
"use client";

import { useState } from "react";
import { mockUser, mockUserProfileFields } from "@tempo/mock-data";
import { Button, Field, SoftCard } from "@tempo/ui/primitives";
import { ScreenSurface, type ViewMode } from "@/components/tempo-port/ScreenSurface";

export default function Page() {
  const [mode, setMode] = useState<ViewMode>("ready");
  const [name, setName] = useState(mockUser.name);
  const [email, setEmail] = useState(mockUser.email);
  const [displayName, setDisplayName] = useState<string>(mockUserProfileFields.displayName);

  return (
    <ScreenSurface mode={mode} onModeChange={setMode}>
      <div className="mx-auto max-w-xl space-y-8 p-6 pb-24 md:p-8">
        <header>
          <p className="font-eyebrow text-muted-foreground">Settings</p>
          <h1 className="text-h1 font-serif text-foreground">Profile</h1>
        </header>
        <SoftCard padding="md" className="space-y-4">
          <Field label="Full name" name="name" value={name} onChange={(e) => setName(e.target.value)} />
          <Field label="Email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Field
            label="Display name"
            name="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
          <Field label="Pronouns" name="pronouns" readOnly value={mockUserProfileFields.pronouns} />
          <label htmlFor="bio" className="flex flex-col gap-1.5">
            <span className="font-eyebrow text-muted-foreground">Bio</span>
            <textarea
              id="bio"
              readOnly
              rows={3}
              className="rounded-lg border border-border bg-card p-3 font-serif text-small text-foreground"
              value={mockUserProfileFields.bio}
            />
          </label>
          {/*
            @action saveProfile
            @mutation: users.patch @index by_email
            @soft-delete: no
            @auth: required
            @errors: toast
            @env: NEXT_PUBLIC_CONVEX_URL
          */}
          <Button type="button" variant="primary">
            Save profile
          </Button>
        </SoftCard>
      </div>
    </ScreenSurface>
  );
}
