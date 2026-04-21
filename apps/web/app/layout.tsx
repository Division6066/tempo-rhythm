import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import { IBM_Plex_Mono, Inter, Newsreader } from "next/font/google";
import type { Metadata, Viewport } from "next";
import Script from "next/script";
import type { ReactNode } from "react";
import "./globals.css";
import { Providers } from "@/components/providers/providers";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { IS_DEMO_MODE } from "@/lib/demo-mode";
import { themeInitScript } from "@/lib/theme-script";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-newsreader",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-ibm-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Tempo Flow — your brain's operating system",
  description:
    "An overwhelm-first AI daily planner for ADHD, autistic, and neurodivergent brains.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f3ebe2" },
    { media: "(prefers-color-scheme: dark)", color: "#131312" },
  ],
};

function ShellMarkup({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      dir="ltr"
      className={`${inter.variable} ${newsreader.variable} ${ibmPlexMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: pre-hydration theme script, locally generated, no user input */}
        <Script id="tempo-theme-init" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: themeInitScript() }} />
      </head>
      <body className="antialiased">
        <ThemeProvider>
          <Providers>{children}</Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}

/**
 * @behavior: In demo mode, skip the Convex Auth server provider to avoid any
 * server-side Convex calls when no backend is configured. Otherwise wrap
 * normally so Convex Auth cookies work for real users.
 * @source: apps/web/lib/demo-mode.ts
 */
export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  if (IS_DEMO_MODE) {
    return <ShellMarkup>{children}</ShellMarkup>;
  }
  return (
    <ConvexAuthNextjsServerProvider>
      <ShellMarkup>{children}</ShellMarkup>
    </ConvexAuthNextjsServerProvider>
  );
}
