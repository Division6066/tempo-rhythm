import { ProfileReady } from "@/components/today/ProfileReady";
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
      <ProfileReady>
        <TemplateRun templateId={id} />
      </ProfileReady>
    </div>
  );
}
