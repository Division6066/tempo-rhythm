import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import type { Metadata } from "next";
import "./globals.css";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Providers } from "@/components/providers/providers";

export const metadata: Metadata = {
  title: "Tempo Rhythm",
  description: "Tempo Rhythm - Find Your Rhythm",
};

// רכיב ה-Layout הראשי של האפליקציה
// עוטף את כל העמודים ומספק את ההגדרות הגלובליות (RTL, פונטים, ספקים)
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // ספק האימות של Convex בצד השרת
    <ConvexAuthNextjsServerProvider>
      {/* הגדרת כיוון האתר לימין-לשמאל (RTL) ושפה לעברית */}
      <html dir="rtl" lang="he">
        <body className="antialiased">
          {/* ספקי הקונטקסט של האפליקציה (Convex Client, וכו') */}
          <Providers>
            {/* סרגל הניווט העליון */}
            <Navbar />
            {/* תוכן העמוד הספציפי */}
            {children}
            {/* כותרת תחתונה */}
            <Footer />
          </Providers>
        </body>
      </html>
    </ConvexAuthNextjsServerProvider>
  );
}
