import { createFileRoute } from "@/lib/tempo-graft/router";
import { AuthScreen } from "@tempo-v0/components/auth/auth-screen";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  return <AuthScreen mode="login" />;
}
