import { createFileRoute } from "@tanstack/react-router";
import { AuthScreen } from "@/components/auth/auth-screen";

export const Route = createFileRoute("/sign-up")({ component: SignUpPage });

function SignUpPage() {
  return <AuthScreen mode="signup" />;
}
