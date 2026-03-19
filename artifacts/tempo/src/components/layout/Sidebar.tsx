import { useLocation, Link } from "wouter";
import {
  Home, Sun, Inbox, FileText, Calendar, Sparkles, FolderKanban,
  FolderOpen, Tag, StickyNote, LayoutTemplate, Puzzle, Settings,
  Search, Plus
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Home", icon: Home, path: "/" },
  { label: "Today", icon: Sun, path: "/today" },
  { label: "Inbox", icon: Inbox, path: "/inbox" },
  { label: "Search", icon: Search, path: "/search" },
  { label: "Notes", icon: FileText, path: "/notes" },
  { label: "Calendar", icon: Calendar, path: "/calendar" },
  { label: "Plan My Day", icon: Sparkles, path: "/plan" },
  { label: "Projects", icon: FolderKanban, path: "/projects" },
  { label: "Folders", icon: FolderOpen, path: "/folders" },
  { label: "Tags", icon: Tag, path: "/tags" },
  { label: "Period Notes", icon: StickyNote, path: "/period-notes" },
  { label: "Templates", icon: LayoutTemplate, path: "/templates" },
  { label: "Plugins", icon: Puzzle, path: "/chat" },
  { label: "Settings", icon: Settings, path: "/settings" },
];

interface SidebarProps {
  onOpenCommandBar: () => void;
  onOpenQuickCapture: () => void;
}

export default function Sidebar({ onOpenCommandBar, onOpenQuickCapture }: SidebarProps) {
  const [location] = useLocation();

  const isActive = (path: string) => {
    if (path === "/") return location === "/";
    return location === path || location.startsWith(path + "/");
  };

  return (
    <aside className="hidden md:flex flex-col w-[220px] min-w-[220px] h-screen bg-card border-r border-border fixed left-0 top-0 z-30">
      <div className="px-5 pt-5 pb-3">
        <h1 className="text-xl font-display font-bold text-foreground tracking-tight">Tempo</h1>
      </div>

      <div className="px-3 pb-2">
        <button
          onClick={onOpenCommandBar}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 text-muted-foreground text-sm hover:bg-muted transition-colors"
        >
          <Search size={14} />
          <span className="flex-1 text-left">Search…</span>
          <kbd className="text-[10px] bg-muted px-1.5 py-0.5 rounded">⌘K</kbd>
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-1 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.path);
          return (
            <Link key={item.path} href={item.path}>
              <div
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors ${
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-4 pt-2">
        <button
          onClick={onOpenQuickCapture}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          <Plus size={16} />
          New
        </button>
      </div>
    </aside>
  );
}