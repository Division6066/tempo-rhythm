import { createFileRoute } from "@tanstack/react-router";
import { AuthScreen } from "@/components/auth/auth-screen";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  return <AuthScreen mode="login" />;
}
