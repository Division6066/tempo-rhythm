import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import type { Metadata } from "next";
import "./globals.css";
import { ConvexProvider } from "@/components/providers/ConvexProvider";

export const metadata: Metadata = {
  title: "TEMPO - ADHD-Friendly AI Planner",
  description: "The calm, minimalist AI planner designed for how your brain actually works.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ConvexAuthNextjsServerProvider>
      <html lang="en" className="dark">
        <body className="antialiased">
          <ConvexProvider>
            {children}
          </ConvexProvider>
        </body>
      </html>
    </ConvexAuthNextjsServerProvider>
  );
}
