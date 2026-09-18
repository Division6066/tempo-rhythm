import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/study")({ component: () => <Outlet /> });
