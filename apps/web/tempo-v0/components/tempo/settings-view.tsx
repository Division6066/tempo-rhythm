import { UserButton } from "@/lib/tempo-graft/auth/gates";
import { useCurrentUser } from "@/lib/tempo-graft/auth/use-current-user";
import { studioStore, useStudio } from "@tempo-v0/lib/tempo/studio";
import { Button } from "@tempo-v0/components/ui/button";
import { Link } from "@/lib/tempo-graft/router";

function Switch({ on, toggle }: { on: boolean; toggle: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={toggle}
      className={`h-7 w-12 rounded-full ${on ? "bg-accent" : "bg-border"}`}
    >
      <span className={`block size-5 rounded-full bg-surface transition-transform ${on ? "translate-x-6" : "translate-x-1"}`} />
    </button>
  );
}

export function SettingsView() {
  const user = useCurrentUser();
  const studio = useStudio();

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <header>
        <p className="text-sm text-muted">You · settings</p>
        <h1 className="font-display text-4xl font-medium tracking-tight">Preferences</h1>
      </header>
      <section className="rounded-xl border border-border bg-surface p-5">
        <h2 className="font-display text-xl">Account</h2>
        {user ? (
          <div className="mt-3">
            <UserButton />
            <p className="mt-2 text-sm text-muted">{user.primaryEmail}</p>
          </div>
        ) : (
          <p className="mt-2 text-sm text-muted">
            Previewing as a guest.{" "}
            <Link to="/login" className="text-accent">
              Sign in
            </Link>{" "}
            to keep the week across devices.
          </p>
        )}
      </section>
      <section className="rounded-xl border border-border bg-surface p-5">
        <h2 className="font-display text-xl">Reading</h2>
        <p className="mt-1 text-sm text-muted">
          Built for dyslexia and wandering attention. None of these are a diagnosis. They just make the page quieter.
        </p>
        <label className="mt-4 flex items-center justify-between gap-3 text-sm">
          OpenDyslexic
          <Switch on={studio.dyslexia} toggle={() => studioStore.setDyslexia(!studio.dyslexia)} />
        </label>
        <label className="mt-4 flex items-center justify-between gap-3 text-sm">
          Reading ruler
          <Switch on={studio.readingRuler} toggle={() => studioStore.setReadingRuler(!studio.readingRuler)} />
        </label>
        <label className="mt-4 flex items-center justify-between gap-3 text-sm">
          Focus (hide chrome)
          <Switch on={studio.focusMode} toggle={() => studioStore.setFocusMode(!studio.focusMode)} />
        </label>
        <label className="mt-4 flex items-center justify-between gap-3 text-sm">
          Dark paper
          <Switch on={studio.theme === "dark"} toggle={() => studioStore.setTheme(studio.theme === "dark" ? "light" : "dark")} />
        </label>
      </section>
      <section className="rounded-xl border border-border bg-surface p-5">
        <h2 className="font-display text-xl">Markdown syntax</h2>
        <p className="mt-1 text-sm text-muted">The page is the file. These tokens render, index, and slash-insert.</p>
        <ul className="mt-4 space-y-1.5 font-mono text-[12px] leading-relaxed text-ink">
          <li>{"* [ ] open · [x] done · [>] moved · [-] cancelled"}</li>
          <li>{"!! priority · @09:30 time · #tag · @person"}</li>
          <li>{">tomorrow · @repeat(weekly) · @remind(14:00)"}</li>
          <li>{"[[wiki]] · ==highlight== · **term** — definition"}</li>
          <li>{"> [!note] · [!tip] · [!warn] · [!important]"}</li>
          <li>/daily /weekly /month /year /enhance /cards /guide /blank /pin /carry</li>
        </ul>
      </section>
      <section className="rounded-xl border border-border bg-surface p-5">
        <h2 className="font-display text-xl">Coach warmth</h2>
        <p className="mt-1 text-sm text-muted">0 is businesslike. 10 is your kindest friend. Default 6.</p>
        <input
          type="range"
          min={0}
          max={10}
          value={studio.warmth}
          onChange={(e) => studioStore.setWarmth(Number(e.target.value))}
          className="mt-4 w-full accent-accent"
        />
      </section>
      <Button asChild variant="outline">
        <Link to="/onboarding">Replay intake</Link>
      </Button>
    </div>
  );
}
