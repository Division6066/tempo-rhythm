import { SiteFooter, SiteHeader } from "@/components/marketing/site-header";
import { Markdown } from "@/lib/markdown";

export function MarkdownPage({
  eyebrow,
  source,
}: {
  eyebrow: string;
  source: string;
}) {
  return (
    <div className="min-h-dvh bg-bg text-ink">
      <SiteHeader solid />
      <div className="mx-auto max-w-[820px] px-6 py-16 md:px-8 md:py-20">
        <p className="mb-4 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-accent">{eyebrow}</p>
        <Markdown source={source} />
      </div>
      <SiteFooter />
    </div>
  );
}
