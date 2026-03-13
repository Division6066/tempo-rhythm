import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Home, Sun, Inbox, MoreHorizontal, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { QuickCapture } from "../QuickCapture";
import { useGetPreferences } from "@workspace/api-client-react";

export default function AppLayout({ children }: { children: ReactNode }) {
  const [location, setLocation] = useLocation();
  const [quickCaptureOpen, setQuickCaptureOpen] = useState(false);
  const { data: preferences } = useGetPreferences();

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  useEffect(() => {
    if (preferences && !preferences.onboardingComplete && location !== "/onboarding") {
      setLocation("/onboarding");
    }
  }, [preferences, location, setLocation]);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground pb-20">
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={location}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* FAB */}
      <button 
        onClick={() => setQuickCaptureOpen(true)}
        className="fixed bottom-24 right-4 w-14 h-14 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-105 transition-transform z-50"
      >
        <Plus size={24} />
      </button>

      {/* Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 h-20 bg-card border-t border-border flex items-center justify-around px-2 pb-safe z-40">
        <Link href="/">
          <div className={`flex flex-col items-center justify-center w-full h-full min-h-[44px] min-w-[44px] cursor-pointer ${location === "/" ? "text-primary" : "text-muted-foreground"}`}>
            <Home size={24} />
            <span className="text-[10px] mt-1 font-medium">Home</span>
          </div>
        </Link>
        <Link href="/today">
          <div className={`flex flex-col items-center justify-center w-full h-full min-h-[44px] min-w-[44px] cursor-pointer ${location === "/today" ? "text-primary" : "text-muted-foreground"}`}>
            <Sun size={24} />
            <span className="text-[10px] mt-1 font-medium">Today</span>
          </div>
        </Link>
        <div className="w-10"></div> {/* Spacer for FAB visual balance */}
        <Link href="/inbox">
          <div className={`flex flex-col items-center justify-center w-full h-full min-h-[44px] min-w-[44px] cursor-pointer ${location === "/inbox" ? "text-primary" : "text-muted-foreground"}`}>
            <Inbox size={24} />
            <span className="text-[10px] mt-1 font-medium">Inbox</span>
          </div>
        </Link>
        <Link href="/settings">
          <div className={`flex flex-col items-center justify-center w-full h-full min-h-[44px] min-w-[44px] cursor-pointer ${["/settings", "/projects", "/notes", "/chat", "/plan"].includes(location) ? "text-primary" : "text-muted-foreground"}`}>
            <MoreHorizontal size={24} />
            <span className="text-[10px] mt-1 font-medium">More</span>
          </div>
        </Link>
      </nav>

      <QuickCapture open={quickCaptureOpen} onOpenChange={setQuickCaptureOpen} />
    </div>
  );
}