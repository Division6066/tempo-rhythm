import { createFileRoute } from "@tanstack/react-router";
import { LandingView } from "@/components/marketing/landing-view";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <LandingView />;
}
