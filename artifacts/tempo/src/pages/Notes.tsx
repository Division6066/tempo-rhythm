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
    return <div className="flex h-[50vh] items-center justify-center"><div className="w-16 h-16 rounded-full animate-breathe bg-primary/20" /></div>;
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
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {searchQuery ? "No notes match your search." : "You don't have any notes yet."}
              </p>
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
