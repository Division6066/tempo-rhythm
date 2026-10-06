import { TemplateRun } from "@/components/template-run/TemplateRun";

type Params = { id: string };

export default async function Page({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  return (
    <div data-testid="template-run-route">
      <TemplateRun templateId={id} />
    </div>
  );
}
