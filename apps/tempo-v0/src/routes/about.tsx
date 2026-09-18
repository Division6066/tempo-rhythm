import { createFileRoute } from "@/lib/tempo-graft/router";
import { MarkdownPage } from "@tempo-v0/components/marketing/markdown-page";
import { ABOUT_MD } from "@tempo-v0/lib/content/pages";

export const Route = createFileRoute("/about")({ component: AboutPage });

function AboutPage() {
  return <MarkdownPage eyebrow="About" source={ABOUT_MD} />;
}
