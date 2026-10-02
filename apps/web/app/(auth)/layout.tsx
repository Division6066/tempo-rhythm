"use client";

import { useConvexAuth } from "convex/react";

// Layout for auth pages (sign in/sign up)
// Handles loading-state display logic and hides content if the user is already logged in
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useConvexAuth();

  // Show a loading spinner while checking authentication status
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  // If the user is already logged in, there's no need to show the auth pages (the redirect happens in Middleware or in the component)
  if (isAuthenticated) {
    return null;
  }

  // Background styling for the auth pages
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-black">
      {children}
    </div>
  );
}
