import { createFileRoute } from "@/lib/tempo-graft/router";
import { AuthScreen } from "@tempo-v0/components/auth/auth-screen";

export const Route = createFileRoute("/sign-up")({ component: SignUpPage });

function SignUpPage() {
  return <AuthScreen mode="signup" />;
}
