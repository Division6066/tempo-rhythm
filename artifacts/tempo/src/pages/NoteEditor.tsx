import { useState, useEffect, useMemo, useCallback, useRef } from "react";
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
  useRenameNote,
  useListTags,
  getListNotesQueryKey,
  getGetNoteQueryKey,
  getListNoteLinksQueryKey,
  NoteLink,
  useAiAutoCategorize,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Trash2, Pin, Globe, Link2, ExternalLink, X, ChevronDown, ChevronRight } from "lucide-react";
import MarkdownEditor from "@/components/MarkdownEditor";
import AiSuggestionBanner from "@/components/AiSuggestionBanner";

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
  const renameNote = useRenameNote();

  const { data: noteLinks } = useListNoteLinks(
    { noteId },
    { query: { enabled: !isNew && !!noteId } }
  );
  const createNoteLink = useCreateNoteLink();
  const deleteNoteLink = useDeleteNoteLink();

  const { data: allNotes } = useListNotes();
  const { data: tagsData } = useListTags();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [showLinkPicker, setShowLinkPicker] = useState(false);
  const [linkSearch, setLinkSearch] = useState("");
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");
  const [backlinksExpanded, setBacklinksExpanded] = useState(true);
  const isSavingNew = useRef(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasInitialized = useRef(false);
  const originalTitle = useRef("");
  const titleRef = useRef(title);
  const contentRef = useRef(content);
  const isPinnedRef = useRef(isPinned);
  const debouncedSaveRef = useRef<() => void>(() => {});
  titleRef.current = title;
  contentRef.current = content;
  isPinnedRef.current = isPinned;

  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const autoCategorize = useAiAutoCategorize();
  const [categorizeSuggestion, setCategorizeSuggestion] = useState<{
    folder: string | null;
    project: string | null;
    tags: string[];
    confidence: number;
  } | null>(null);
  const lastCategorizedContent = useRef("");

  useEffect(() => {
    if (note && !isNew) {
      setTitle(note.title);
      setContent(note.content);
      setIsPinned(note.isPinned);
      hasInitialized.current = true;
      originalTitle.current = note.title;
    }
  }, [note, isNew]);

  const allTagNames = useMemo(() => {
    if (!tagsData) return [];
    return tagsData.map((t: { name: string }) => t.name);
  }, [tagsData]);

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
          }
        }
      }
    }

    for (const link of (noteLinks || []) as NoteLink[]) {
      if (link.sourceNoteId === currentNoteId && !referencedNoteIds.has(link.targetNoteId)) {
        try {
          await deleteNoteLink.mutateAsync({ id: link.id });
        } catch {
        }
      }
    }

    queryClient.invalidateQueries({ queryKey: getListNoteLinksQueryKey() });
  }, [allNotes, noteLinks, createNoteLink, deleteNoteLink, queryClient]);

  const handleSave = useCallback(async () => {
    const currentTitle = titleRef.current;
    const currentContent = contentRef.current;
    const currentIsPinned = isPinnedRef.current;
    if (!currentTitle && !currentContent) return;
    if (isNew && isSavingNew.current) return;
    setSaveStatus("saving");
    try {
      if (isNew) {
        isSavingNew.current = true;
        try {
          const res = await createNote.mutateAsync({
            data: { title: currentTitle || "Untitled", content: currentContent, isPinned: currentIsPinned }
          });
          queryClient.invalidateQueries({ queryKey: getListNotesQueryKey() });
          await syncWikiLinks(res.id, currentContent);
          setSaveStatus("saved");
          setLocation(`/notes/${res.id}`);
        } finally {
          isSavingNew.current = false;
        }
      } else {
        await updateNote.mutateAsync({
          id: noteId,
          data: { title: currentTitle, content: currentContent, isPinned: currentIsPinned }
        });
        queryClient.invalidateQueries({ queryKey: getGetNoteQueryKey(noteId) });
        queryClient.invalidateQueries({ queryKey: getListNotesQueryKey() });
        await syncWikiLinks(noteId, currentContent);
        setSaveStatus("saved");

        const contentKey = `${currentTitle}::${currentContent}`;
        if (currentContent.length > 10 && contentKey !== lastCategorizedContent.current) {
          lastCategorizedContent.current = contentKey;
          try {
            const catResult = await autoCategorize.mutateAsync({
              data: { title: currentTitle, content: currentContent, type: "note" },
            });
            if (catResult.confidence > 60) {
              setCategorizeSuggestion(catResult);
            }
          } catch {}
        }
      }
    } catch (e) {
      setSaveStatus("unsaved");
      toast({ variant: "destructive", title: "Failed to save note" });
    }
  }, [isNew, noteId, createNote, updateNote, queryClient, syncWikiLinks, setLocation, toast, autoCategorize]);

  const debouncedSave = useCallback(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    setSaveStatus("unsaved");
    debounceTimer.current = setTimeout(() => {
      handleSave();
    }, 1500);
  }, [handleSave]);
  debouncedSaveRef.current = debouncedSave;

  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
        const t = titleRef.current;
        const c = contentRef.current;
        if (t || c) {
          handleSave();
        }
      }
    };
  }, [handleSave]);

  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent);
    if (hasInitialized.current || isNew) {
      debouncedSave();
    }
  }, [debouncedSave, isNew]);

  const handleTitleChange = useCallback((newTitle: string) => {
    setTitle(newTitle);
    if (hasInitialized.current || isNew) {
      debouncedSave();
    }
  }, [debouncedSave, isNew]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        stream.getTracks().forEach((track) => track.stop());
        setIsTranscribing(true);
        try {
          const formData = new FormData();
          formData.append("file", audioBlob, "recording.webm");
          const baseUrl = import.meta.env.BASE_URL || "/";
          const res = await fetch(`${baseUrl}api/transcribe`, {
            method: "POST",
            body: formData,
          });
          if (res.ok) {
            const data = await res.json();
            const text = data.text || "";
            setContent((prev) => {
              const newContent = prev ? prev + "\n" + text : text;
              contentRef.current = newContent;
              return newContent;
            });
            debouncedSaveRef.current();
          }
        } catch {
        } finally {
          setIsTranscribing(false);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch {
      console.error("Microphone access denied");
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  const handleTitleBlur = async () => {
    const oldTitle = originalTitle.current;
    const newTitle = title.trim();

    if (!isNew && oldTitle && newTitle && oldTitle !== newTitle) {
      try {
        const result = await renameNote.mutateAsync({
          id: noteId,
          data: { oldTitle, newTitle },
        });
        originalTitle.current = newTitle;
        queryClient.invalidateQueries({ queryKey: getListNotesQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetNoteQueryKey(noteId) });
        if (result.updatedCount > 0) {
          toast({
            title: `Updated [[references]] in ${result.updatedCount} note${result.updatedCount !== 1 ? "s" : ""}`,
          });
        }
        await handleSave();
      } catch {
        toast({ variant: "destructive", title: "Failed to rename note" });
      }
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

  const handleCreateNoteFromWikiLink = useCallback(async (noteTitle: string) => {
    try {
      await createNote.mutateAsync({
        data: { title: noteTitle, content: "", isPinned: false }
      });
      queryClient.invalidateQueries({ queryKey: getListNotesQueryKey() });
      toast({ title: `Created note "${noteTitle}"` });
    } catch {
      toast({ variant: "destructive", title: "Failed to create note" });
    }
  }, [createNote, queryClient, toast]);

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
    if (!noteLinks || !allNotes) return [];
    return (noteLinks as NoteLink[]).map((link: NoteLink) => {
      const isOutgoing = link.sourceNoteId === noteId;
      const linkedNoteId = isOutgoing ? link.targetNoteId : link.sourceNoteId;
      const linkedNoteTitle = isOutgoing ? link.targetNoteTitle : link.sourceNoteTitle;
      const linkedNote = allNotes.find((n) => n.id === linkedNoteId);
      let contextSnippet = "";
      if (linkedNote && title) {
        const lines = linkedNote.content.split("\n");
        const mentionLine = lines.find((line) =>
          line.toLowerCase().includes(`[[${title.toLowerCase()}]]`)
        );
        if (mentionLine) {
          contextSnippet = mentionLine.trim();
          if (contextSnippet.length > 120) {
            contextSnippet = contextSnippet.substring(0, 117) + "...";
          }
        }
      }
      return {
        id: link.id,
        noteId: linkedNoteId,
        noteTitle: linkedNoteTitle,
        direction: isOutgoing ? "outgoing" as const : "incoming" as const,
        contextSnippet,
      };
    });
  }, [noteLinks, noteId, allNotes, title]);

  const tags = useMemo(() => {
    const matches = content.match(/#[\w-]+/g) || [];
    return [...new Set(matches)];
  }, [content]);

  const mentions = useMemo(() => {
    const matches = content.match(/@[\w-]+/g) || [];
    return [...new Set(matches)];
  }, [content]);

  const handleApplyCategorization = useCallback(async () => {
    if (!categorizeSuggestion) return;
    const baseUrl = import.meta.env.BASE_URL || "/";
    try {
      await fetch(`${baseUrl}api/memories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier: "warm",
          content: `Auto-categorized note "${titleRef.current}" → folder: ${categorizeSuggestion.folder || "none"}, tags: ${categorizeSuggestion.tags.join(", ") || "none"} (${Math.round(categorizeSuggestion.confidence)}% confidence)`,
        }),
      });
    } catch {}
    setCategorizeSuggestion(null);
    toast({ title: "Categorization applied" });
  }, [categorizeSuggestion, toast]);

  const editorNotes = useMemo(() => {
    if (!allNotes) return [];
    return allNotes
      .filter((n) => n.id !== noteId)
      .map((n) => ({ id: n.id, title: n.title }));
  }, [allNotes, noteId]);

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

      {categorizeSuggestion && (
        <AiSuggestionBanner
          folder={categorizeSuggestion.folder}
          project={categorizeSuggestion.project}
          tags={categorizeSuggestion.tags}
          confidence={categorizeSuggestion.confidence}
          onApply={handleApplyCategorization}
          onDismiss={() => setCategorizeSuggestion(null)}
        />
      )}

      <Input 
        value={title}
        onChange={e => handleTitleChange(e.target.value)}
        onBlur={handleTitleBlur}
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

      <div className="flex-1 min-h-0">
        <MarkdownEditor
          value={content}
          onChange={handleContentChange}
          height={500}
          preprocessValue={renderWikiLinks}
          saveStatus={saveStatus}
          voiceProps={{
            isRecording,
            isTranscribing,
            onStartRecording: startRecording,
            onStopRecording: stopRecording,
          }}
          allNotes={editorNotes}
          allTags={allTagNames}
          onCreateNote={handleCreateNoteFromWikiLink}
        />
      </div>

      {backlinks.length > 0 && (
        <div className="space-y-2">
          <button
            onClick={() => setBacklinksExpanded(!backlinksExpanded)}
            className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1 hover:text-foreground transition-colors"
          >
            {backlinksExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            <Link2 size={12} /> Linked Notes
            <span className="bg-primary/20 text-primary px-1.5 py-0.5 rounded-full text-[10px] ml-1">
              {backlinks.length}
            </span>
          </button>
          {backlinksExpanded && (
            <div className="space-y-1">
              {backlinks.map((link) => (
                <div key={link.id} className="bg-muted/50 rounded-lg px-3 py-2">
                  <div className="flex items-center justify-between">
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
                  {link.contextSnippet && (
                    <p className="text-xs text-muted-foreground mt-1 truncate italic">
                      {link.contextSnippet}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
