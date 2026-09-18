import { createFileRoute } from "@/lib/tempo-graft/router";
import { LandingView } from "@tempo-v0/components/marketing/landing-view";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <LandingView />;
}
