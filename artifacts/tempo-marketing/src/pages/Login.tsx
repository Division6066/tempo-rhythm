import { Link } from "wouter";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { useAuthActions } from "@convex-dev/auth/react";

const MAIN_APP_URL = import.meta.env.VITE_MAIN_APP_URL || "/";

export default function Login() {
  const { signIn } = useAuthActions();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await signIn("password", { email, password, flow: "signIn" });
      window.location.href = MAIN_APP_URL;
    } catch (err: any) {
      setError(err?.message || "Invalid email or password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout hideNavFooter>
      <SEO title="Log In — TEMPO" description="Log in to your TEMPO account to access your ADHD-friendly AI planner." path="/login" robots="noindex,nofollow" />
      <div className="min-h-screen flex flex-col md:flex-row">
        <div className="w-full md:w-1/2 flex flex-col justify-center px-8 md:px-16 lg:px-24 py-12">
          <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors w-fit mb-12">
            <ArrowLeft size={16} /> Back to home
          </Link>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="max-w-md w-full mx-auto"
          >
            <h1 className="text-4xl font-serif mb-2">Welcome back</h1>
            <p className="text-muted-foreground mb-8">Enter your details to access your planner.</p>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="login-email" className="text-sm font-medium text-foreground">Email</label>
                <input
                  id="login-email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label htmlFor="login-password" className="text-sm font-medium text-foreground">Password</label>
                  <a href="mailto:support@tempo.app" className="text-xs text-primary hover:underline">Forgot password?</a>
                </div>
                <input
                  id="login-password"
                  type="password"
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-primary-foreground font-semibold py-3.5 rounded-xl hover:bg-primary/90 transition-all mt-4 disabled:opacity-70 flex justify-center items-center h-[52px]"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : "Log in"}
              </button>
            </form>

            <p className="text-center mt-8 text-sm text-muted-foreground">
              Don't have an account? <Link href="/signup" className="text-primary font-medium hover:underline">Sign up</Link>
            </p>
          </motion.div>
        </div>

        <div className="hidden md:block md:w-1/2 bg-accent relative overflow-hidden">
          <img
            src={`${import.meta.env.BASE_URL}images/hero-abstract.png`}
            alt="Abstract"
            className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-multiply"
          />
          <div className="absolute inset-0 flex items-center justify-center p-12">
            <div className="max-w-md text-center">
              <h2 className="text-3xl font-serif text-foreground mb-4">"The only planner I haven't abandoned after a week."</h2>
              <p className="text-muted-foreground font-medium">— Alex R.</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
