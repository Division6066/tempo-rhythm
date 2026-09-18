import { Outlet, createFileRoute } from "@/lib/tempo-graft/router";

export const Route = createFileRoute("/study")({ component: () => <Outlet /> });
