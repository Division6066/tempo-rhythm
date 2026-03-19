import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Home, Sun, Inbox, MoreHorizontal, Plus, Calendar, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { QuickCapture } from "../QuickCapture";
import CommandBar from "../CommandBar";
import Sidebar from "./Sidebar";
import { useGetPreferences } from "@workspace/api-client-react";

const MORE_PATHS = ["/settings", "/projects", "/notes", "/chat", "/plan", "/period-notes", "/filters", "/templates", "/folders", "/tags", "/memories", "/focus", "/extract", "/preferences"];

export default function AppLayout({ children }: { children: ReactNode }) {
  const [location, setLocation] = useLocation();
  const [quickCaptureOpen, setQuickCaptureOpen] = useState(false);
  const [commandBarOpen, setCommandBarOpen] = useState(false);
  const { data: preferences } = useGetPreferences();

  useEffect(() => {
    if (preferences && !preferences.onboardingComplete && location !== "/onboarding") {
      setLocation("/onboarding");
    }
  }, [preferences, location, setLocation]);

  const isMoreActive = MORE_PATHS.some(p => location === p || location.startsWith(p + "/"));

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar
        onOpenCommandBar={() => setCommandBarOpen(true)}
        onOpenQuickCapture={() => setQuickCaptureOpen(true)}
      />

      <div className="flex-1 md:ml-[220px] pb-20 md:pb-0">
        <main className="w-full max-w-[900px] mx-auto px-4 md:px-8 py-6">
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
      </div>

      <button
        onClick={() => setQuickCaptureOpen(true)}
        className="fixed bottom-24 right-4 w-14 h-14 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-105 transition-transform z-50 md:hidden"
      >
        <Plus size={24} />
      </button>

      <nav className="fixed bottom-0 left-0 right-0 h-20 bg-card border-t border-border flex items-center justify-around px-2 pb-safe z-40 md:hidden">
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
        <Link href="/calendar">
          <div className={`flex flex-col items-center justify-center w-full h-full min-h-[44px] min-w-[44px] cursor-pointer ${location === "/calendar" ? "text-primary" : "text-muted-foreground"}`}>
            <Calendar size={24} />
            <span className="text-[10px] mt-1 font-medium">Calendar</span>
          </div>
        </Link>
        <Link href="/inbox">
          <div className={`flex flex-col items-center justify-center w-full h-full min-h-[44px] min-w-[44px] cursor-pointer ${location === "/inbox" ? "text-primary" : "text-muted-foreground"}`}>
            <Inbox size={24} />
            <span className="text-[10px] mt-1 font-medium">Inbox</span>
          </div>
        </Link>
        <button
          onClick={() => setCommandBarOpen(true)}
          className="flex flex-col items-center justify-center w-full h-full min-h-[44px] min-w-[44px] cursor-pointer text-muted-foreground"
        >
          <Search size={24} />
          <span className="text-[10px] mt-1 font-medium">Search</span>
        </button>
        <Link href="/settings">
          <div className={`flex flex-col items-center justify-center w-full h-full min-h-[44px] min-w-[44px] cursor-pointer ${isMoreActive ? "text-primary" : "text-muted-foreground"}`}>
            <MoreHorizontal size={24} />
            <span className="text-[10px] mt-1 font-medium">More</span>
          </div>
        </Link>
      </nav>

      <CommandBar open={commandBarOpen} onOpenChange={setCommandBarOpen} />
      <QuickCapture open={quickCaptureOpen} onOpenChange={setQuickCaptureOpen} />
    </div>
  );
}