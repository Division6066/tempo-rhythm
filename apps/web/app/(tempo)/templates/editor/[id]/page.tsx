import { TemplateEditorScreen } from "@/components/template-builder/TemplateBuilder";

type Params = { id: string };

export default async function Page({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  return (
    <div data-testid="template-editor-route">
      <TemplateEditorScreen templateId={id} />
    </div>
  );
}
