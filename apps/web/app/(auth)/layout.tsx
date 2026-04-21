"use client";

import { useConvexAuth } from "convex/react";
import { useEffect, useState } from "react";

// Layout עבור דפי אימות (כניסה/הרשמה)
// מטפל בהצגת לוגיקה בזמן טעינה והסתרה אם המשתמש כבר מחובר
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const isAuthUnavailable = !process.env.NEXT_PUBLIC_CONVEX_URL;
  const [isAuthCheckDelayed, setIsAuthCheckDelayed] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setIsAuthCheckDelayed(true);
    }, 2500);
    return () => window.clearTimeout(timeout);
  }, []);

  // Frontend-only demo mode: allow auth pages to render when backend auth URL is missing.
  // Also fail-open if auth remains loading for too long in preview/demo sessions.
  if (isAuthUnavailable || (isLoading && isAuthCheckDelayed)) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-black">
        {children}
      </div>
    );
  }

  // הצגת ספינר טעינה בזמן בדיקת סטטוס האימות
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  // אם המשתמש כבר מחובר, אין צורך להציג את דפי האימות (ההפניה תתבצע ב-Middleware או בקומפוננטה)
  if (isAuthenticated) {
    return null;
  }

  // עיצוב הרקע לדפי האימות
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-black">
      {children}
    </div>
  );
}
