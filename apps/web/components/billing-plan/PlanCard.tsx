import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/** Shape returned by `api.users.getMyPlan` when someone is signed in. */
export type CurrentPlan = {
  plan: "none" | "trial" | "basic" | "pro" | "max";
  status: "inactive" | "active" | "grace" | "cancelled";
  label: string;
  betaAccess: "none" | "tester" | "founder";
  entitlementTier: "none" | "basic" | "pro" | "max" | "god";
  userType: "free" | "paid";
  isBeta: boolean;
};

const STATUS_TEXT: Record<CurrentPlan["status"], string> = {
  inactive: "Inactive",
  active: "Active",
  grace: "Grace",
  cancelled: "Cancelled",
};

const BETA_TEXT: Record<CurrentPlan["betaAccess"], string> = {
  none: "None",
  tester: "Tester",
  founder: "Founder",
};

const PRICE_PLACEHOLDER = "—";

export function PlanCard({ plan }: { plan: CurrentPlan }) {
  const label = plan.label.trim() ? plan.label : PRICE_PLACEHOLDER;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{label}</CardTitle>
        <CardDescription>Beta access is free while Tempo is in beta.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <dl className="flex flex-col gap-2">
          <div>
            <dt>Status</dt>
            <dd>{STATUS_TEXT[plan.status]}</dd>
          </div>
          <div>
            <dt>Beta access</dt>
            <dd>{BETA_TEXT[plan.betaAccess]}</dd>
          </div>
          <div>
            <dt>Price</dt>
            <dd>{PRICE_PLACEHOLDER}</dd>
          </div>
        </dl>
        <p className="text-muted-foreground text-sm">Paid plans arrive after beta.</p>
      </CardContent>
    </Card>
  );
}
