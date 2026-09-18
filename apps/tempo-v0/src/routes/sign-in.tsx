import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/sign-in")({ component: SignInAlias });

function SignInAlias() {
  return <Navigate to="/login" />;
}
