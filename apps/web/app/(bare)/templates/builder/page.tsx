import { TemplateBuilderScreen } from "@/components/template-builder/TemplateBuilder";

type SearchParams = { from?: string | string[] };

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { from } = await searchParams;
  const fromId = Array.isArray(from) ? from[0] : from;
  return (
    <div data-testid="template-builder-route">
      <TemplateBuilderScreen fromId={fromId || undefined} />
    </div>
  );
}
