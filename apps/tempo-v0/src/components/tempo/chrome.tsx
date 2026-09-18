import { useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { AppShell } from "@/components/tempo/app-shell";
import { studioStore, useStudio } from "@/lib/tempo/studio";
import { mockStore } from "@/lib/tempo/mock";

const BARE = new Set(["/login", "/sign-up", "/sign-in", "/onboarding"]);
const MARKETING = new Set(["/", "/about", "/changelog", "/privacy", "/terms"]);

export function Chrome({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const studio = useStudio();

  useEffect(() => {
    mockStore.hydrateFromStorage();
    studioStore.hydrate();
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", studio.theme);
    document.documentElement.setAttribute("data-dyslexia", studio.dyslexia ? "on" : "off");
  }, [studio.theme, studio.dyslexia]);

  const inner =
    BARE.has(pathname) || MARKETING.has(pathname) ? <>{children}</> : <AppShell>{children}</AppShell>;

  return (
    <>
      {inner}
      {studio.readingRuler ? <ReadingRuler /> : null}
    </>
  );
}

function ReadingRuler() {
  const [y, setY] = useState(120);
  useEffect(() => {
    function onMove(e: PointerEvent) {
      setY(e.clientY);
    }
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);
  return <div className="reading-ruler" style={{ top: y }} aria-hidden />;
}
