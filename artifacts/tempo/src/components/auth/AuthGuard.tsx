import { useConvexAuth } from "convex/react";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { convex } from "@/lib/convex";

const PUBLIC_PATHS = ["/login", "/signup", "/published", "/forgot-password", "/reset-password"];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  if (!convex) {
    return <>{children}</>;
  }

  return <ConvexAuthGuard>{children}</ConvexAuthGuard>;
}

function ConvexAuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const [location, setLocation] = useLocation();

  const isPublicPath = PUBLIC_PATHS.some((p) => location.startsWith(p));

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated && !isPublicPath) {
      setLocation("/login");
    }

    if (isAuthenticated && (location === "/login" || location === "/signup")) {
      setLocation("/");
    }
  }, [isAuthenticated, isLoading, location, isPublicPath, setLocation]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated && !isPublicPath) {
    return null;
  }

  return <>{children}</>;
}
