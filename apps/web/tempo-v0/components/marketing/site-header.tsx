import { Link } from "@/lib/tempo-graft/router";
import { Moon, Sun } from "lucide-react";
import { BrandMark, Wordmark } from "@tempo-v0/components/tempo/brand";
import { Button } from "@tempo-v0/components/ui/button";
import { SignedIn, SignedOut, UserButton } from "@/lib/tempo-graft/auth/gates";
import { useCurrentUserState } from "@/lib/tempo-graft/auth/use-current-user";
import { studioStore, useStudio } from "@tempo-v0/lib/tempo/studio";
import { cn } from "@tempo-v0/lib/utils";

export function SiteHeader({ solid = false }: { solid?: boolean }) {
  const { isPending } = useCurrentUserState();
  const studio = useStudio();

  function toggleTheme() {
    studioStore.setTheme(studio.theme === "dark" ? "light" : "dark");
  }

  return (
    <header
      className={cn(
        "flex items-center gap-4 px-4 py-4 md:px-8",
        solid && "border-b border-border",
      )}
    >
      <Link to="/" className="flex items-center gap-2.5">
        <BrandMark size={28} />
        <Wordmark />
      </Link>
      <nav className="ml-auto hidden items-center gap-6 text-sm text-muted md:flex">
        <a href="/#features" className="hover:text-ink">
          Features
        </a>
        <a href="/#coach" className="hover:text-ink">
          Coach
        </a>
        <a href="/#pricing" className="hover:text-ink">
          Pricing
        </a>
        <Link to="/changelog" className="hover:text-ink">
          Changelog
        </Link>
        <Link to="/about" className="hover:text-ink">
          About
        </Link>
      </nav>
      <div className="flex items-center gap-2 md:ml-4">
        <button
          type="button"
          aria-label="Toggle theme"
          onClick={toggleTheme}
          className="grid size-9 place-items-center rounded-full border border-border bg-surface text-ink"
        >
          {studio.theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </button>
        {isPending ? (
          <div className="h-8 w-20 animate-pulse rounded-full bg-surface-2" />
        ) : (
          <>
            <SignedOut>
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                <Link to="/login">Sign in</Link>
              </Button>
              <Button asChild variant="gradient" size="sm" className="rounded-full">
                <Link to="/sign-up">Start your $1 week</Link>
              </Button>
            </SignedOut>
            <SignedIn>
              <Button asChild variant="ghost" size="sm">
                <Link to="/today">Open app</Link>
              </Button>
              <UserButton />
            </SignedIn>
          </>
        )}
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="bg-mkt-bg text-mkt-fg">
      <div className="mx-auto grid max-w-[1240px] gap-10 px-6 py-14 md:grid-cols-4 md:px-8">
        <div className="md:col-span-1">
          <div className="mb-4 flex items-center gap-3 text-mkt-fg">
            <BrandMark size={28} tone="inverse" />
            <Wordmark className="text-mkt-fg" />
          </div>
          <p className="max-w-[30ch] font-display text-lg leading-relaxed text-mkt-muted">
            A gentle planner for messy brains. Made in Tel Aviv by one person.
          </p>
        </div>
        <div>
          <h5 className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-mkt-subtle">
            Product
          </h5>
          <FooterLink href="/#features">Features</FooterLink>
          <FooterLink href="/#coach">The Coach</FooterLink>
          <FooterLink href="/#pricing">Pricing</FooterLink>
          <FooterLink href="/today">Try the app</FooterLink>
        </div>
        <div>
          <h5 className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-mkt-subtle">
            Company
          </h5>
          <FooterLink href="/about">About</FooterLink>
          <FooterLink href="/changelog">Changelog</FooterLink>
          <FooterLink href="/onboarding">Intake</FooterLink>
        </div>
        <div>
          <h5 className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-mkt-subtle">
            Legal
          </h5>
          <FooterLink href="/privacy">Privacy</FooterLink>
          <FooterLink href="/terms">Terms</FooterLink>
          <a
            href="mailto:amit@tempoflow.app"
            className="block text-sm leading-8 text-mkt-muted hover:text-mkt-fg"
          >
            amit@tempoflow.app
          </a>
        </div>
      </div>
      <div className="mx-auto flex max-w-[1240px] flex-col gap-2 border-t border-mkt-border px-6 py-6 font-mono text-xs text-mkt-subtle sm:flex-row sm:justify-between md:px-8">
        <span>© 2026 Tempo Flow</span>
        <span>v1.0 · One dollar. Seven days.</span>
      </div>
    </footer>
  );
}

function FooterLink({ href, children }: { href: string; children: string }) {
  return (
    <a href={href} className="block text-sm leading-8 text-mkt-muted hover:text-mkt-fg">
      {children}
    </a>
  );
}
