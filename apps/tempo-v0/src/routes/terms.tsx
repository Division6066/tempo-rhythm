import { createFileRoute } from "@tanstack/react-router";
import { MarkdownPage } from "@/components/marketing/markdown-page";
import { TERMS_MD } from "@/lib/content/pages";

export const Route = createFileRoute("/terms")({ component: TermsPage });

function TermsPage() {
  return <MarkdownPage eyebrow="Terms" source={TERMS_MD} />;
}
