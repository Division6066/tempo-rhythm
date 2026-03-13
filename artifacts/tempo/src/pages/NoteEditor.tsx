import { useState, useEffect, useMemo, useCallback } from "react";
import { useRoute, useLocation } from "wouter";
import { 
  useGetNote, 
  useCreateNote, 
  useUpdateNote, 
  useDeleteNote,
  useListNoteLinks,
  useCreateNoteLink,
  useDeleteNoteLink,
  usePublishNote,
  useListNotes,
  getListNotesQueryKey,
  getGetNoteQueryKey,
  getListNoteLinksQueryKey,
  NoteLink,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VoiceNote } from "@/components/VoiceNote";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Trash2, Pin, Globe, Link2, ExternalLink, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function NoteEditor() {
  const [, params] = useRoute("/notes/:id");
  const isNew = params?.id === "new";
  const noteId = !isNew ? parseInt(params?.id || "0", 10) : 0;
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: note, isLoading } = useGetNote(noteId, {
    query: {
      enabled: !isNew && !!noteId,
      queryKey: getGetNoteQueryKey(noteId)
    }
  });

  const createNote = useCreateNote();
  const updateNote = useUpdateNote();
  const deleteNote = useDeleteNote();
  const publishNote = usePublishNote();

  const { data: noteLinks } = useListNoteLinks(
    { noteId },
    { query: { enabled: !isNew && !!noteId } }
  );
  const createNoteLink = useCreateNoteLink();
  const deleteNoteLink = useDeleteNoteLink();

  const { data: allNotes } = useListNotes();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [tab, setTab] = useState("edit");
  const [showLinkPicker, setShowLinkPicker] = useState(false);
  const [linkSearch, setLinkSearch] = useState("");

  useEffect(() => {
    if (note && !isNew) {
      setTitle(note.title);
      setContent(note.content);
      setIsPinned(note.isPinned);
    }
  }, [note, isNew]);

  const syncWikiLinks = useCallback(async (currentNoteId: number, currentContent: string) => {
    if (!allNotes) return;
    const wikiLinkPattern = /\[\[([^\]]+)\]\]/g;
    let match;
    const mentionedTitles: string[] = [];
    while ((match = wikiLinkPattern.exec(currentContent)) !== null) {
      mentionedTitles.push(match[1]);
    }

    const referencedNoteIds = new Set<number>();
    for (const mentionedTitle of mentionedTitles) {
      const targetNote = allNotes.find(
        (n) => n.title.toLowerCase() === mentionedTitle.toLowerCase() && n.id !== currentNoteId
      );
      if (targetNote) {
        referencedNoteIds.add(targetNote.id);
        const alreadyLinked = (noteLinks || []).some(
          (l: NoteLink) =>
            (l.sourceNoteId === currentNoteId && l.targetNoteId === targetNote.id) ||
            (l.sourceNoteId === targetNote.id && l.targetNoteId === currentNoteId)
        );
        if (!alreadyLinked) {
          try {
            await createNoteLink.mutateAsync({
              data: { sourceNoteId: currentNoteId, targetNoteId: targetNote.id },
            });
          } catch {
            // link may already exist
          }
        }
      }
    }

    for (const link of (noteLinks || []) as NoteLink[]) {
      if (link.sourceNoteId === currentNoteId && !referencedNoteIds.has(link.targetNoteId)) {
        try {
          await deleteNoteLink.mutateAsync({ id: link.id });
        } catch {
          // ignore
        }
      }
    }

    queryClient.invalidateQueries({ queryKey: getListNoteLinksQueryKey() });
  }, [allNotes, noteLinks, createNoteLink, deleteNoteLink, queryClient]);

  const handleSave = async () => {
    if (!title && !content) return;
    try {
      if (isNew) {
        const res = await createNote.mutateAsync({
          data: { title: title || "Untitled", content, isPinned }
        });
        queryClient.invalidateQueries({ queryKey: getListNotesQueryKey() });
        await syncWikiLinks(res.id, content);
        setLocation(`/notes/${res.id}`);
      } else {
        await updateNote.mutateAsync({
          id: noteId,
          data: { title, content, isPinned }
        });
        queryClient.invalidateQueries({ queryKey: getGetNoteQueryKey(noteId) });
        queryClient.invalidateQueries({ queryKey: getListNotesQueryKey() });
        await syncWikiLinks(noteId, content);
      }
    } catch (e) {
      toast({ variant: "destructive", title: "Failed to save note" });
    }
  };

  const handleDelete = async () => {
    if (isNew) {
      setLocation("/notes");
      return;
    }
    try {
      await deleteNote.mutateAsync({ id: noteId });
      queryClient.invalidateQueries({ queryKey: getListNotesQueryKey() });
      toast({ title: "Note deleted" });
      setLocation("/notes");
    } catch (e) {
      toast({ variant: "destructive", title: "Failed to delete note" });
    }
  };

  const togglePin = async () => {
    setIsPinned(!isPinned);
    if (!isNew) {
      await updateNote.mutateAsync({ id: noteId, data: { isPinned: !isPinned } });
      queryClient.invalidateQueries({ queryKey: getListNotesQueryKey() });
    }
  };

  const handlePublishToggle = async () => {
    if (isNew || !note) return;
    try {
      await publishNote.mutateAsync({
        id: noteId,
        data: { isPublished: !note.isPublished },
      });
      queryClient.invalidateQueries({ queryKey: getGetNoteQueryKey(noteId) });
      toast({ title: note.isPublished ? "Note unpublished" : "Note published" });
    } catch {
      toast({ variant: "destructive", title: "Failed to update publish status" });
    }
  };

  const handleAddLink = async (targetNoteId: number) => {
    if (isNew) return;
    try {
      await createNoteLink.mutateAsync({
        data: { sourceNoteId: noteId, targetNoteId },
      });
      queryClient.invalidateQueries({ queryKey: getListNoteLinksQueryKey() });
      setShowLinkPicker(false);
      setLinkSearch("");
      toast({ title: "Link added" });
    } catch {
      toast({ variant: "destructive", title: "Link already exists or failed" });
    }
  };

  const handleRemoveLink = async (linkId: number) => {
    try {
      await deleteNoteLink.mutateAsync({ id: linkId });
      queryClient.invalidateQueries({ queryKey: getListNoteLinksQueryKey() });
    } catch {
      toast({ variant: "destructive", title: "Failed to remove link" });
    }
  };

  const insertWikiLink = useCallback((noteTitle: string) => {
    setContent((prev) => prev + `[[${noteTitle}]]`);
  }, []);

  const linkableNotes = useMemo(() => {
    if (!allNotes) return [];
    const linkedIds = new Set(
      (noteLinks || []).flatMap((l: NoteLink) => [l.sourceNoteId, l.targetNoteId])
    );
    return allNotes
      .filter((n) => n.id !== noteId && !linkedIds.has(n.id))
      .filter((n) => !linkSearch || n.title.toLowerCase().includes(linkSearch.toLowerCase()));
  }, [allNotes, noteId, noteLinks, linkSearch]);

  const backlinks = useMemo(() => {
    if (!noteLinks) return [];
    return (noteLinks as NoteLink[]).map((link: NoteLink) => ({
      id: link.id,
      noteId: link.sourceNoteId === noteId ? link.targetNoteId : link.sourceNoteId,
      noteTitle: link.sourceNoteId === noteId ? link.targetNoteTitle : link.sourceNoteTitle,
      direction: link.sourceNoteId === noteId ? "outgoing" as const : "incoming" as const,
    }));
  }, [noteLinks, noteId]);

  const renderWikiLinks = useCallback((text: string): string => {
    return text.replace(/\[\[([^\]]+)\]\]/g, (_, linkTitle: string) => {
      const linkedNote = allNotes?.find(
        (n) => n.title.toLowerCase() === linkTitle.toLowerCase()
      );
      if (linkedNote) {
        return `[${linkTitle}](#/notes/${linkedNote.id})`;
      }
      return `**${linkTitle}**`;
    });
  }, [allNotes]);

  const tags = useMemo(() => {
    const matches = content.match(/#[\w-]+/g) || [];
    return [...new Set(matches)];
  }, [content]);

  const mentions = useMemo(() => {
    const matches = content.match(/@[\w-]+/g) || [];
    return [...new Set(matches)];
  }, [content]);

  if (isLoading && !isNew) {
    return <div className="flex h-[50vh] items-center justify-center"><div className="w-16 h-16 rounded-full animate-breathe bg-primary/20" /></div>;
  }

  return (
    <div className="space-y-4 pb-12 flex flex-col h-full">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/notes")}>
          <ArrowLeft size={20} />
        </Button>
        <div className="flex gap-1">
          {!isNew && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowLinkPicker(!showLinkPicker)}
                className="text-muted-foreground hover:text-primary"
                title="Link notes"
              >
                <Link2 size={20} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePublishToggle}
                className={note?.isPublished ? "text-green-400" : "text-muted-foreground"}
                title={note?.isPublished ? "Unpublish" : "Publish"}
              >
                <Globe size={20} />
              </Button>
            </>
          )}
          <VoiceNote onTranscription={(text) => setContent((prev) => prev ? prev + "\n" + text : text)} />
          <Button variant="ghost" size="icon" onClick={togglePin} className={isPinned ? "text-primary" : "text-muted-foreground"}>
            <Pin size={20} className={isPinned ? "fill-current" : ""} />
          </Button>
          <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/20" onClick={handleDelete}>
            <Trash2 size={20} />
          </Button>
        </div>
      </div>

      {note?.isPublished && note.publishSlug && (
        <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-lg px-3 py-2 text-xs">
          <Globe size={14} className="text-green-400" />
          <span className="text-green-300">Published at</span>
          <code className="text-green-400 font-mono">/published/{note.publishSlug}</code>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 text-green-400 ml-auto"
            onClick={() => setLocation(`/published/${note.publishSlug}`)}
          >
            <ExternalLink size={12} />
          </Button>
        </div>
      )}

      {showLinkPicker && (
        <div className="bg-card border border-border rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Link to another note</span>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowLinkPicker(false)}><X size={14} /></Button>
          </div>
          <Input
            placeholder="Search notes..."
            value={linkSearch}
            onChange={(e) => setLinkSearch(e.target.value)}
            className="h-8 text-sm"
          />
          <div className="max-h-32 overflow-y-auto space-y-1">
            {linkableNotes.slice(0, 10).map((n) => (
              <button
                key={n.id}
                onClick={() => handleAddLink(n.id)}
                className="w-full text-left text-sm px-2 py-1.5 rounded hover:bg-muted truncate"
              >
                {n.title}
              </button>
            ))}
          </div>
        </div>
      )}

      <Input 
        value={title}
        onChange={e => setTitle(e.target.value)}
        onBlur={handleSave}
        placeholder="Note Title"
        className="text-2xl font-display font-bold border-none bg-transparent px-0 focus-visible:ring-0"
      />

      {(tags.length > 0 || mentions.length > 0) && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => setLocation(`/notes?search=${encodeURIComponent(tag)}`)}
              className="text-[11px] bg-primary/15 text-primary px-2 py-0.5 rounded-full hover:bg-primary/25 transition-colors cursor-pointer"
            >
              {tag}
            </button>
          ))}
          {mentions.map((mention) => (
            <button
              key={mention}
              onClick={() => setLocation(`/notes?search=${encodeURIComponent(mention)}`)}
              className="text-[11px] bg-blue-500/15 text-blue-400 px-2 py-0.5 rounded-full hover:bg-blue-500/25 transition-colors cursor-pointer"
            >
              {mention}
            </button>
          ))}
        </div>
      )}

      <Tabs value={tab} onValueChange={setTab} className="flex-1 flex flex-col">
        <TabsList className="bg-card w-full justify-start border-b border-border rounded-none h-auto p-0">
          <TabsTrigger value="edit" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary px-4 py-2">Edit</TabsTrigger>
          <TabsTrigger value="preview" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary px-4 py-2">Preview</TabsTrigger>
        </TabsList>
        <TabsContent value="edit" className="flex-1 mt-4">
          <Textarea 
            value={content}
            onChange={e => setContent(e.target.value)}
            onBlur={handleSave}
            placeholder="Start typing (Markdown supported, use #tags @mentions [[wiki links]])..."
            className="min-h-[300px] h-full bg-card border-border resize-none font-mono text-sm leading-relaxed"
          />
        </TabsContent>
        <TabsContent value="preview" className="flex-1 mt-4 bg-card/50 p-6 rounded-xl border border-border min-h-[300px]">
          <div className="prose prose-invert max-w-none">
            <ReactMarkdown>{renderWikiLinks(content) || "*Nothing to preview*"}</ReactMarkdown>
          </div>
        </TabsContent>
      </Tabs>

      {backlinks.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
            <Link2 size={12} /> Linked Notes ({backlinks.length})
          </h3>
          <div className="space-y-1">
            {backlinks.map((link) => (
              <div key={link.id} className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2">
                <button
                  onClick={() => setLocation(`/notes/${link.noteId}`)}
                  className="text-sm text-primary hover:underline truncate"
                >
                  {link.noteTitle}
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground">{link.direction}</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => handleRemoveLink(link.id)}>
                    <X size={12} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
