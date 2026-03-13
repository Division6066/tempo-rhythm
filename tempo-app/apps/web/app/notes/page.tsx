"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import Link from "next/link";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Plus, Pin, FileText } from "lucide-react";

export default function NotesPage() {
  const notes = useQuery(api.notes.list);

  if (!notes) {
    return (
      <AppLayout>
        <div className="flex h-[50vh] items-center justify-center">
          <div className="w-16 h-16 rounded-full animate-breathe bg-primary/20" />
        </div>
      </AppLayout>
    );
  }

  const pinned = notes.filter((n) => n.isPinned);
  const other = notes.filter((n) => !n.isPinned);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="text-primary h-8 w-8" />
            <h1 className="text-3xl font-bold text-foreground">Notes</h1>
          </div>
          <Button asChild size="sm" className="gap-2">
            <Link href="/notes/new"><Plus size={16} /> New Note</Link>
          </Button>
        </div>

        <div className="space-y-6 mt-6">
          {pinned.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-semibold text-primary uppercase tracking-wider flex items-center gap-1">
                <Pin size={12} /> Pinned
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {pinned.map((note) => (
                  <Link key={note._id} href={`/notes/${note._id}`}>
                    <div className="glass p-4 rounded-xl cursor-pointer hover:bg-white/5 transition-all border border-primary/30 h-32 flex flex-col">
                      <h3 className="font-semibold text-foreground truncate">{note.title || "Untitled"}</h3>
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-3 flex-1">{note.content || "Empty note"}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">All Notes</h2>
            {other.length === 0 && pinned.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">You don&apos;t have any notes yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {other.map((note) => (
                  <Link key={note._id} href={`/notes/${note._id}`}>
                    <div className="glass p-4 rounded-xl cursor-pointer hover:bg-white/5 transition-all border border-border/50 h-32 flex flex-col">
                      <h3 className="font-medium text-foreground truncate">{note.title || "Untitled"}</h3>
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-3 flex-1">{note.content || "Empty note"}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
