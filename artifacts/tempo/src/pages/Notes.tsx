import { useState, useMemo } from "react";
import { useListNotes, useListFolders, useUpdateNote, getListNotesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useLocation, useSearch } from "wouter";
import { Plus, Pin, FileText, Search, X, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ViewToggle } from "@/components/ViewToggle";
import { DataTable, type DataTableColumn } from "@/components/DataTable";
import { KanbanBoard, type KanbanColumn } from "@/components/KanbanBoard";
import { useViewPreference } from "@/hooks/useViewPreference";
import type { Note, Folder } from "@workspace/api-client-react";

export default function Notes() {
  const { data: notes, isLoading } = useListNotes();
  const { data: folders } = useListFolders();
  const updateNote = useUpdateNote();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const initialSearch = params.get("search") || "";
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [viewMode, setViewMode] = useViewPreference("notes");
  const [showArchived, setShowArchived] = useState(false);

  const filteredNotes = useMemo(() => {
    if (!notes) return [];
    let result = notes.filter((n) => showArchived ? n.isArchived : !n.isArchived);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (n) =>
          (n.title || "").toLowerCase().includes(q) ||
          (n.content || "").toLowerCase().includes(q)
      );
    }
    return result;
  }, [notes, searchQuery, showArchived]);

  const folderMap = useMemo(() => {
    const map: Record<number, Folder> = {};
    folders?.forEach((f) => { map[f.id] = f; });
    return map;
  }, [folders]);

  const getFolderName = (folderId: number | null | undefined) => {
    if (!folderId) return "Unfiled";
    return folderMap[folderId]?.name || "Unknown";
  };

  const kanbanColumns: KanbanColumn<Note>[] = useMemo(() => {
    const cols: KanbanColumn<Note>[] = [];

    cols.push({
      id: "unfiled",
      title: "Unfiled",
      items: filteredNotes.filter((n) => !n.folderId),
    });

    folders?.forEach((f) => {
      cols.push({
        id: String(f.id),
        title: f.name,
        items: filteredNotes.filter((n) => n.folderId === f.id),
      });
    });

    return cols;
  }, [filteredNotes, folders]);

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

  const handleKanbanDragEnd = async (itemId: string, _from: string, to: string) => {
    const noteId = parseInt(itemId, 10);
    const newFolderId = to === "unfiled" ? null : parseInt(to, 10);
    try {
      await updateNote.mutateAsync({ id: noteId, data: { folderId: newFolderId } });
      queryClient.invalidateQueries({ queryKey: getListNotesQueryKey() });
    } catch {}
  };

  const tableColumns: DataTableColumn<Note>[] = [
    {
      key: "title",
      label: "Title",
      sortable: true,
      render: (n) => (
        <span className="font-medium text-foreground">{n.title || "Untitled"}</span>
      ),
      sortValue: (n) => n.title || "",
    },
    {
      key: "folder",
      label: "Folder",
      sortable: true,
      render: (n) => (
        <span className="text-muted-foreground">{getFolderName(n.folderId)}</span>
      ),
      sortValue: (n) => getFolderName(n.folderId),
    },
    {
      key: "tags",
      label: "Tags",
      render: (n) => (
        <div className="flex gap-1">
          {n.tags?.slice(0, 3).map((t) => (
            <span key={t} className="text-[10px] bg-primary/10 text-primary rounded px-1.5 py-0.5">{t}</span>
          ))}
          {(n.tags?.length || 0) > 3 && (
            <span className="text-[10px] text-muted-foreground">+{n.tags.length - 3}</span>
          )}
        </div>
      ),
    },
    {
      key: "periodType",
      label: "Period",
      sortable: true,
      render: (n) => (
        <span className="text-muted-foreground capitalize">{n.periodType || "—"}</span>
      ),
      sortValue: (n) => n.periodType || "",
    },
    {
      key: "createdAt",
      label: "Created",
      sortable: true,
      render: (n) => (
        <span className="text-muted-foreground text-xs">{new Date(n.createdAt).toLocaleDateString()}</span>
      ),
      sortValue: (n) => new Date(n.createdAt).getTime(),
    },
    {
      key: "updatedAt",
      label: "Updated",
      sortable: true,
      render: (n) => (
        <span className="text-muted-foreground text-xs">{new Date(n.updatedAt).toLocaleDateString()}</span>
      ),
      sortValue: (n) => new Date(n.updatedAt).getTime(),
    },
    {
      key: "wordCount",
      label: "Words",
      sortable: true,
      render: (n) => {
        const words = n.content ? n.content.trim().split(/\s+/).filter(Boolean).length : 0;
        return <span className="text-muted-foreground text-xs">{words}</span>;
      },
      sortValue: (n) => n.content ? n.content.trim().split(/\s+/).filter(Boolean).length : 0,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="text-primary h-8 w-8" />
          <h1 className="text-3xl font-display font-bold text-foreground">Notes</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowArchived(!showArchived)}
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md transition-colors ${showArchived ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
          >
            <Archive size={14} />
            {showArchived ? "Showing Archived" : "Show Archived"}
          </button>
          <ViewToggle current={viewMode} onChange={setViewMode} />
          <Button onClick={() => setLocation("/notes/new")} size="sm" className="gap-2">
            <Plus size={16} /> New Note
          </Button>
        </div>
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

      {viewMode === "list" && (
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
      )}

      {viewMode === "kanban" && (
        <KanbanBoard
          columns={kanbanColumns}
          renderCard={(note: Note) => (
            <div
              onClick={() => setLocation(`/notes/${note.id}`)}
              className="glass p-3 rounded-lg cursor-pointer hover:bg-muted/50 transition-all border border-border/50"
            >
              <div className="flex items-start gap-2">
                {note.isPinned && <Pin size={10} className="text-primary mt-0.5 shrink-0" />}
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-medium text-foreground truncate">{note.title || "Untitled"}</h4>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{note.content || "Empty note"}</p>
                  {note.tags?.length > 0 && (
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {note.tags.slice(0, 2).map((t) => (
                        <span key={t} className="text-[9px] bg-primary/10 text-primary rounded px-1 py-0.5">{t}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          getItemId={(n) => String(n.id)}
          onDragEnd={handleKanbanDragEnd}
        />
      )}

      {viewMode === "table" && (
        <DataTable
          columns={tableColumns}
          data={filteredNotes}
          getRowId={(n) => n.id}
          onRowClick={(n) => setLocation(`/notes/${n.id}`)}
          emptyMessage={searchQuery ? "No notes match your search." : "No notes yet."}
        />
      )}
    </div>
  );
}
