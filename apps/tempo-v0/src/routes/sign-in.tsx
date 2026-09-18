import { createFileRoute, Navigate } from "@/lib/tempo-graft/router";

export const Route = createFileRoute("/sign-in")({ component: SignInAlias });

function SignInAlias() {
  return <Navigate to="/login" />;
}
