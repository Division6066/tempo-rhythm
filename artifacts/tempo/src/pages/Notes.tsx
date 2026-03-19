import { useState, useMemo } from "react";
import { useListNotes } from "@workspace/api-client-react";
import { Link, useLocation, useSearch } from "wouter";
import { Plus, Pin, FileText, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Notes() {
  const { data: notes, isLoading } = useListNotes();
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const initialSearch = params.get("search") || "";
  const [searchQuery, setSearchQuery] = useState(initialSearch);

  const filteredNotes = useMemo(() => {
    if (!notes) return [];
    if (!searchQuery) return notes;
    const q = searchQuery.toLowerCase();
    return notes.filter(
      (n) =>
        (n.title || "").toLowerCase().includes(q) ||
        (n.content || "").toLowerCase().includes(q)
    );
  }, [notes, searchQuery]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="text-primary h-8 w-8" />
            <h1 className="text-3xl font-display font-bold text-foreground">Notes</h1>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass p-4 rounded-xl h-32 space-y-3 animate-pulse">
              <div className="h-5 w-2/3 bg-primary/10 rounded" />
              <div className="h-3 w-full bg-primary/10 rounded" />
              <div className="h-3 w-3/4 bg-primary/10 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const pinned = filteredNotes.filter(n => n.isPinned);
  const other = filteredNotes.filter(n => !n.isPinned);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="text-primary h-8 w-8" />
          <h1 className="text-3xl font-display font-bold text-foreground">Notes</h1>
        </div>
        <Button onClick={() => setLocation("/notes/new")} size="sm" className="gap-2">
          <Plus size={16} /> New Note
        </Button>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search notes by title, content, #tag, or @mention..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-8 bg-card border-border"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {searchQuery && (
        <p className="text-sm text-muted-foreground">
          {filteredNotes.length} result{filteredNotes.length !== 1 ? "s" : ""} for "{searchQuery}"
        </p>
      )}

      <div className="space-y-6 mt-2">
        {pinned.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xs font-semibold text-primary uppercase tracking-wider flex items-center gap-1">
              <Pin size={12} /> Pinned
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {pinned.map(note => (
                <Link key={note.id} href={`/notes/${note.id}`}>
                  <div className="glass p-4 rounded-xl cursor-pointer hover:bg-muted/50 transition-all border border-primary/30 h-32 flex flex-col">
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
            <div className="text-center py-16 space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="text-lg font-medium text-foreground">
                  {searchQuery ? "No notes match your search" : "No notes yet"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {searchQuery ? "Try a different search term." : "Start capturing your thoughts and ideas."}
                </p>
              </div>
              {!searchQuery && (
                <Button onClick={() => setLocation("/notes/new")} className="gap-2 min-h-[44px]">
                  <Plus size={16} /> Create First Note
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {other.map(note => (
                <Link key={note.id} href={`/notes/${note.id}`}>
                  <div className="glass p-4 rounded-xl cursor-pointer hover:bg-muted/50 transition-all border border-border/50 h-32 flex flex-col">
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
  );
}
