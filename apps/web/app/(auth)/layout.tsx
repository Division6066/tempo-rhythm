"use client";

import { useConvexAuth } from "convex/react";

// Layout for the auth pages (sign-in / sign-up).
// Handles the loading state and hides itself when the user is already signed in.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  // When the user is already signed in, leave the redirect to middleware / the page.
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-black">
      {children}
    </div>
  );
}
