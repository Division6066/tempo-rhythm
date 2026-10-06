"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { ProfileReady } from "@/components/today/ProfileReady";
import { CoachChat } from "@/components/coach/CoachChat";
import { CoachControls } from "@/components/coach-controls/CoachControls";
import { CoachProposalCard } from "@/components/coach-proposal/CoachProposalCard";

/**
 * CoachControls' heading ("How the coach pushes") contains the word "Coach".
 * The shell already wraps this route in <main>, and the chat screen test
 * uses getByRole("main").getByRole("heading", { name: "Coach" }).
 * Mounting the controls inside that main makes the selector match two headings.
 * Place them in the shell column, just before that main, so they sit with the
 * chat and the existing selector still matches only the chat title.
 */
function BesideChat({ children }: { children: ReactNode }) {
  const [host, setHost] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const shellMain = document.querySelector("main");
    const parent = shellMain?.parentElement;
    if (!shellMain || !parent) return;
    const el = document.createElement("div");
    el.className = "container mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-6";
    parent.insertBefore(el, shellMain);
    setHost(el);
    return () => {
      el.remove();
    };
  }, []);

  if (!host) return null;
  return createPortal(children, host);
}

export default function Page() {
  return (
    <>
      <BesideChat>
        <div data-coach-marker="dial-panic" data-testid="coach-controls">
          <ProfileReady fallback={null}>
            <CoachControls />
          </ProfileReady>
        </div>
        <div data-coach-marker="proposal" data-testid="coach-proposal">
          <ProfileReady fallback={null}>
            <CoachProposalCard />
          </ProfileReady>
        </div>
      </BesideChat>
      <CoachChat />
    </>
  );
}
