"use client";

import { useConvexAuth } from "convex/react";

// Layout עבור דפי אימות (כניסה/הרשמה)
// מטפל בהצגת לוגיקה בזמן טעינה והסתרה אם המשתמש כבר מחובר
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useConvexAuth();

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
