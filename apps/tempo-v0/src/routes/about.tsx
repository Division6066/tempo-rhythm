import { createFileRoute } from "@tanstack/react-router";
import { MarkdownPage } from "@/components/marketing/markdown-page";
import { ABOUT_MD } from "@/lib/content/pages";

export const Route = createFileRoute("/about")({ component: AboutPage });

function AboutPage() {
  return <MarkdownPage eyebrow="About" source={ABOUT_MD} />;
}
