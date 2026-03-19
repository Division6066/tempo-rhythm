import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Brain, Eye, EyeOff, FlaskConical } from "lucide-react";

const TEST_EMAIL = "beta1@tempo.app";
const TEST_PASSWORD = "beta1pass";

export default function Login() {
  const { signIn } = useAuthActions();
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function signInWith(emailVal: string, passwordVal: string) {
    setError("");
    setLoading(true);
    try {
      await signIn("password", { email: emailVal, password: passwordVal, flow: "signIn" });
      setLocation("/");
    } catch (err: any) {
      setError(err?.message || "Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await signInWith(email, password);
  }

  async function handleTestLogin() {
    setEmail(TEST_EMAIL);
    setPassword(TEST_PASSWORD);
    await signInWith(TEST_EMAIL, TEST_PASSWORD);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Brain className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">Tempo</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Your ADHD-friendly daily planner
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <Link href="/forgot-password" className="text-xs text-muted-foreground hover:text-primary transition-colors">
              Forgot password?
            </Link>
          </div>

          {error && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>

        <div className="border-t pt-4">
          <button
            type="button"
            onClick={handleTestLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 text-xs text-muted-foreground hover:text-foreground py-2 px-3 rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
          >
            <FlaskConical className="h-3.5 w-3.5" />
            Use test account (beta1@tempo.app)
          </button>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link href="/signup" className="text-primary hover:underline font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
