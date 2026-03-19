"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Sun,
  Inbox,
  MoreHorizontal,
  Plus,
  Calendar,
} from "lucide-react";
import { QuickCapture } from "./QuickCapture";
import { CommandBar } from "./CommandBar";
import Sidebar from "./Sidebar";

export default function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [quickCaptureOpen, setQuickCaptureOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />

      <div className="flex flex-col flex-1 min-w-0 pb-20 md:pb-0">
        <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-6">
          {children}
        </main>
      </div>

      <button
        onClick={() => setQuickCaptureOpen(true)}
        className="fixed bottom-24 right-4 md:bottom-6 w-14 h-14 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-105 transition-transform z-50 cursor-pointer"
      >
        <Plus size={24} />
      </button>

      <nav className="fixed bottom-0 left-0 right-0 h-20 bg-card border-t border-border flex items-center justify-around px-2 pb-safe z-40 md:hidden">
        <Link href="/">
          <div
            className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] cursor-pointer ${pathname === "/" ? "text-primary" : "text-muted-foreground"}`}
          >
            <Home size={24} />
            <span className="text-[10px] mt-1 font-medium">Home</span>
          </div>
        </Link>
        <Link href="/today">
          <div
            className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] cursor-pointer ${pathname === "/today" ? "text-primary" : "text-muted-foreground"}`}
          >
            <Sun size={24} />
            <span className="text-[10px] mt-1 font-medium">Today</span>
          </div>
        </Link>
        <Link href="/calendar">
          <div
            className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] cursor-pointer ${pathname === "/calendar" ? "text-primary" : "text-muted-foreground"}`}
          >
            <Calendar size={24} />
            <span className="text-[10px] mt-1 font-medium">Calendar</span>
          </div>
        </Link>
        <Link href="/inbox">
          <div
            className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] cursor-pointer ${pathname === "/inbox" ? "text-primary" : "text-muted-foreground"}`}
          >
            <Inbox size={24} />
            <span className="text-[10px] mt-1 font-medium">Inbox</span>
          </div>
        </Link>
        <Link href="/settings">
          <div
            className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] cursor-pointer ${["/settings", "/projects", "/notes", "/chat", "/plan", "/templates", "/filters"].includes(pathname) ? "text-primary" : "text-muted-foreground"}`}
          >
            <MoreHorizontal size={24} />
            <span className="text-[10px] mt-1 font-medium">More</span>
          </div>
        </Link>
      </nav>

      <QuickCapture open={quickCaptureOpen} onOpenChange={setQuickCaptureOpen} />
      <CommandBar />
    </div>
  );
}
