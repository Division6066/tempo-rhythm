import { createFileRoute } from "@/lib/tempo-graft/router";
import { MarkdownPage } from "@tempo-v0/components/marketing/markdown-page";
import { TERMS_MD } from "@tempo-v0/lib/content/pages";

export const Route = createFileRoute("/terms")({ component: TermsPage });

function TermsPage() {
  return <MarkdownPage eyebrow="Terms" source={TERMS_MD} />;
}
