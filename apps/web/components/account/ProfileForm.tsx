"use client";

import { useMutation, useQuery } from "convex/react";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/convex/_generated/api";

type Status = "idle" | "saving" | "saved" | "error";

export function ProfileForm() {
  const profile = useQuery(api.users.getProfile, {});
  const updateMyProfile = useMutation(api.users.updateMyProfile);
  const [draftName, setDraftName] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  if (profile === undefined) {
    return <p aria-live="polite">Loading your profile…</p>;
  }
  if (profile === null) {
    return <p>Sign in to edit your profile.</p>;
  }

  const fullName = draftName ?? profile.fullName ?? "";

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const trimmed = fullName.trim();
    if (!trimmed) {
      setStatus("error");
      setMessage("Add a name so Tempo knows what to call you.");
      return;
    }
    setStatus("saving");
    setMessage("");
    try {
      await updateMyProfile({ fullName: trimmed });
      setDraftName(trimmed);
      setStatus("saved");
      setMessage("Saved");
    } catch {
      setStatus("error");
      setMessage("Could not save your name. You can try again.");
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="profile-email">Email</Label>
        <Input id="profile-email" type="email" value={profile.email ?? ""} readOnly />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="profile-name">Name</Label>
        <Input
          id="profile-name"
          value={fullName}
          autoComplete="name"
          onChange={(event) => {
            setDraftName(event.target.value);
            if (status !== "idle") {
              setStatus("idle");
              setMessage("");
            }
          }}
        />
      </div>
      <Button type="submit" disabled={status === "saving"}>
        {status === "saving" ? "Saving…" : "Save"}
      </Button>
      {message ? (
        <p aria-live="polite" role={status === "error" ? "alert" : "status"}>
          {message}
        </p>
      ) : null}
    </form>
  );
}
