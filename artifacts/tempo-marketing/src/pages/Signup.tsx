import { Link, useLocation } from "wouter";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";

export default function Signup() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        localStorage.setItem("tempo-token", data.token);
        localStorage.setItem("tempo-user", JSON.stringify(data.user));
        setLocation("/onboarding");
      } else {
        setError(data.error || "Unable to create account");
      }
    } catch {
      setError("Unable to connect to server");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout hideNavFooter>
      <SEO title="Sign Up — TEMPO" description="Create your free TEMPO account and start organizing your day with an ADHD-friendly AI planner." path="/signup" robots="noindex,nofollow" />
      <div className="min-h-screen flex flex-col md:flex-row">
        <div className="hidden md:block md:w-1/2 bg-accent relative overflow-hidden order-2 md:order-1">
          <img 
            src={`${import.meta.env.BASE_URL}images/focus-illustration.png`} 
            alt="Focus" 
            className="absolute inset-0 w-full h-full object-cover mix-blend-multiply opacity-80"
          />
          <div className="absolute bottom-12 left-12 right-12 bg-white/80 backdrop-blur-md p-8 rounded-3xl border border-white">
            <h2 className="text-2xl font-serif mb-2 text-foreground">Find your focus.</h2>
            <p className="text-muted-foreground">Join thousands of others who have simplified their daily planning.</p>
          </div>
        </div>

        <div className="w-full md:w-1/2 flex flex-col justify-center px-8 md:px-16 lg:px-24 py-12 order-1 md:order-2">
          <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors w-fit mb-12">
            <ArrowLeft size={16} /> Back to home
          </Link>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="max-w-md w-full mx-auto"
          >
            <h1 className="text-4xl font-serif mb-2">Create an account</h1>
            <p className="text-muted-foreground mb-8">Start your 14-day free trial. No credit card required.</p>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="signup-name" className="text-sm font-medium text-foreground">Full Name</label>
                <input 
                  id="signup-name"
                  type="text" 
                  required
                  autoComplete="name"
                  placeholder="Jane Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="signup-email" className="text-sm font-medium text-foreground">Email</label>
                <input 
                  id="signup-email"
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
                <label htmlFor="signup-password" className="text-sm font-medium text-foreground">Password</label>
                <input 
                  id="signup-password"
                  type="password" 
                  required
                  autoComplete="new-password"
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
                ) : "Create account"}
              </button>
            </form>

            <p className="text-center mt-8 text-sm text-muted-foreground">
              Already have an account? <Link href="/login" className="text-primary font-medium hover:underline">Log in</Link>
            </p>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
