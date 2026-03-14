import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Crown, Check } from "lucide-react";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";

interface UserProfile {
  username: string;
  displayName: string;
  email: string;
  role: string;
  plan: string;
  planDetails: {
    name: string;
    price: string;
    features: string[];
    isBetaTester: boolean;
  };
}

export default function Login() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState<UserProfile | null>(null);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("tempo-user");
    const token = localStorage.getItem("tempo-token");
    if (stored && token) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.displayName && parsed.planDetails) {
          setUser(parsed);
        } else {
          localStorage.removeItem("tempo-user");
          localStorage.removeItem("tempo-token");
        }
      } catch {
        localStorage.removeItem("tempo-user");
        localStorage.removeItem("tempo-token");
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        localStorage.setItem("tempo-token", data.token);
        localStorage.setItem("tempo-user", JSON.stringify(data.user));
        setUser(data.user);
        setRedirecting(true);
        setTimeout(() => {
          window.location.href = "/calendar";
        }, 1500);
      } else {
        setError(data.error || "Invalid credentials");
      }
    } catch {
      setError("Unable to connect to server");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("tempo-token");
    localStorage.removeItem("tempo-user");
    setUser(null);
    setRedirecting(false);
  };

  const handleOpenApp = () => {
    window.location.href = "/calendar";
  };

  if (user) {
    return (
      <Layout hideNavFooter>
        <SEO title="Dashboard — TEMPO" description="Manage your TEMPO account and subscription." path="/login" robots="noindex,nofollow" />
        <div className="min-h-screen flex flex-col md:flex-row">
          <div className="w-full md:w-1/2 flex flex-col justify-center px-8 md:px-16 lg:px-24 py-12">
            <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors w-fit mb-12">
              <ArrowLeft size={16} /> Back to home
            </Link>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-md w-full mx-auto"
            >
              {redirecting ? (
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Check className="text-green-600" size={32} />
                  </div>
                  <h1 className="text-3xl font-serif mb-2">Welcome back, {user.displayName}!</h1>
                  <p className="text-muted-foreground mb-4">Taking you to your calendar...</p>
                  <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin mx-auto"></div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                      {user.displayName.charAt(0)}
                    </div>
                    <div>
                      <h1 className="text-2xl font-serif">{user.displayName}</h1>
                      <p className="text-muted-foreground text-sm">{user.email}</p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200 rounded-2xl p-6 mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Crown className="text-violet-600" size={20} />
                      <span className="font-semibold text-violet-900">{user.planDetails.name} Plan</span>
                      {user.planDetails.isBetaTester && (
                        <span className="text-xs bg-violet-600 text-white px-2 py-0.5 rounded-full font-medium">Beta Tester</span>
                      )}
                    </div>
                    <p className="text-violet-700 font-medium text-lg mb-4">{user.planDetails.price}</p>
                    <ul className="space-y-2">
                      {user.planDetails.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-violet-800">
                          <Check size={14} className="text-violet-600 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex items-center gap-3 text-sm text-muted-foreground mb-6">
                    <span className="capitalize bg-secondary px-2 py-1 rounded-lg text-xs font-medium">{user.role.replace("_", " ")}</span>
                    <span>@{user.username}</span>
                  </div>

                  <button
                    onClick={handleOpenApp}
                    className="w-full bg-primary text-primary-foreground font-semibold py-3.5 rounded-xl hover:bg-primary/90 transition-all mb-3"
                  >
                    Open TEMPO
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full bg-secondary text-foreground font-medium py-3 rounded-xl hover:bg-secondary/80 transition-all"
                  >
                    Log out
                  </button>
                </>
              )}
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

            <button className="w-full bg-white border border-border text-foreground font-medium py-3 rounded-xl flex items-center justify-center gap-3 hover:bg-secondary transition-colors mb-6 shadow-sm">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Log in with Google
            </button>

            <div className="relative flex items-center py-4">
              <div className="flex-grow border-t border-border"></div>
              <span className="flex-shrink-0 mx-4 text-muted-foreground text-sm">or</span>
              <div className="flex-grow border-t border-border"></div>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="login-username" className="text-sm font-medium text-foreground">Username</label>
                <input
                  id="login-username"
                  type="text"
                  required
                  autoComplete="username"
                  placeholder="admin1234567"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label htmlFor="login-password" className="text-sm font-medium text-foreground">Password</label>
                  <span className="text-xs text-primary cursor-pointer hover:underline">Forgot password?</span>
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
