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
  useAiRewrite,
  useAiExtractTasks,
  useCreateStagedSuggestion,
  useCreateNoteTemplate,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Trash2, Pin, Globe, Link2, ExternalLink, X, ChevronDown, ChevronRight, MoreVertical, Archive, Save, Paperclip, FileIcon, Loader2 } from "lucide-react";
import MarkdownEditor from "@/components/MarkdownEditor";
import MilkdownEditorComponent from "@/components/MilkdownEditor";
import type { AiAction } from "@/components/MarkdownToolbar";
import AiSuggestionBanner from "@/components/AiSuggestionBanner";
import AiPreviewPanel from "@/components/AiPreviewPanel";

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
    { query: { enabled: !isNew && !!noteId, queryKey: ["listNoteLinks", noteId] } }
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
  const aiRewrite = useAiRewrite();
  const aiExtractTasks = useAiExtractTasks();
  const createStaged = useCreateStagedSuggestion();
  const createNoteTemplate = useCreateNoteTemplate();

  const [categorizeSuggestion, setCategorizeSuggestion] = useState<{
    folder: string | null;
    project: string | null;
    tags: string[];
    confidence: number;
  } | null>(null);
  const lastCategorizedContent = useRef("");

  const [showThreeDotMenu, setShowThreeDotMenu] = useState(false);
  const threeDotRef = useRef<HTMLDivElement>(null);

  const [aiPanel, setAiPanel] = useState<{
    visible: boolean;
    action: string;
    result: string;
    isLoading: boolean;
    sourceText: string;
    deepThink: boolean;
    isSelection: boolean;
  }>({ visible: false, action: "", result: "", isLoading: false, sourceText: "", deepThink: false, isSelection: false });

  const [showTranslateDialog, setShowTranslateDialog] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState("Spanish");
  const pendingTranslateTextRef = useRef("");

  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [templateCategory, setTemplateCategory] = useState("general");
  const [editorMode, setEditorMode] = useState<"classic" | "milkdown">(() => {
    return (localStorage.getItem("tempo-editor-mode") as "classic" | "milkdown") || "classic";
  });

  const [attachments, setAttachments] = useState<Array<{ filename: string; originalName: string; mimeType: string; size: number; path: string; uploadedAt: string }>>([]);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const attachmentInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isNew && noteId) {
      const baseUrl = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");
      fetch(`${baseUrl}/api/notes/${noteId}/attachments`)
        .then(res => res.ok ? res.json() : { attachments: [] })
        .then(data => setAttachments(data.attachments || []))
        .catch(() => {});
    }
  }, [isNew, noteId]);

  const handleUploadAttachment = async (file: File) => {
    if (isNew || !noteId) return;
    setUploadingAttachment(true);
    try {
      const baseUrl = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`${baseUrl}/api/notes/${noteId}/attachments`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setAttachments(prev => [...prev, data.attachment]);
      toast({ title: "File attached" });
    } catch {
      toast({ variant: "destructive", title: "Failed to upload attachment" });
    } finally {
      setUploadingAttachment(false);
      if (attachmentInputRef.current) attachmentInputRef.current.value = "";
    }
  };

  const handleDeleteAttachment = async (filename: string) => {
    if (isNew || !noteId) return;
    try {
      const baseUrl = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");
      const res = await fetch(`${baseUrl}/api/notes/${noteId}/attachments?filename=${encodeURIComponent(filename)}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      setAttachments(prev => prev.filter(a => a.filename !== filename));
      toast({ title: "Attachment removed" });
    } catch {
      toast({ variant: "destructive", title: "Failed to remove attachment" });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

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
              setCategorizeSuggestion({
                folder: catResult.folder ?? null,
                project: catResult.project ?? null,
                tags: catResult.tags,
                confidence: catResult.confidence,
              });
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
          const baseUrl = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");
          const res = await fetch(`${baseUrl}/api/transcribe`, {
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
    const baseUrl = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");
    try {
      await fetch(`${baseUrl}/api/memories`, {
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

  useEffect(() => {
    if (!showThreeDotMenu) return;
    const handleClick = (e: MouseEvent) => {
      if (threeDotRef.current && !threeDotRef.current.contains(e.target as Node)) {
        setShowThreeDotMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showThreeDotMenu]);

  const executeAiRewrite = useCallback(async (text: string, action: string, deepThink: boolean, isSelection: boolean, lang?: string) => {
    setAiPanel(prev => ({ ...prev, visible: true, action, isLoading: true, result: "", sourceText: text, deepThink, isSelection }));
    try {
      const res = await aiRewrite.mutateAsync({
        data: { text, action: action as any, deepThink, targetLanguage: lang || undefined },
      });
      setAiPanel(prev => ({ ...prev, isLoading: false, result: res.result }));
    } catch {
      setAiPanel(prev => ({ ...prev, isLoading: false, result: "Failed to process. Please try again." }));
    }
  }, [aiRewrite]);

  const handleAiAction = useCallback(async (action: AiAction, selectedText: string) => {
    const isSelection = selectedText !== content;

    if (action === "extract-tasks") {
      try {
        const res = await aiExtractTasks.mutateAsync({ data: { text: selectedText } });
        if (res.tasks && res.tasks.length > 0) {
          await createStaged.mutateAsync({
            data: {
              type: "extractedTasks",
              data: { tasks: res.tasks, sourceNote: title },
              reasoning: `Extracted ${res.tasks.length} task(s) from note "${title}"`,
            },
          });
          toast({ title: `${res.tasks.length} task(s) extracted`, description: "Check your Inbox to review them." });
          setLocation("/inbox");
        } else {
          toast({ title: "No tasks found", description: "Try selecting text that contains actionable items." });
        }
      } catch {
        toast({ variant: "destructive", title: "Failed to extract tasks" });
      }
      return;
    }

    if (action === "translate") {
      pendingTranslateTextRef.current = selectedText;
      setShowTranslateDialog(true);
      return;
    }

    executeAiRewrite(selectedText, action, aiPanel.deepThink, isSelection);
  }, [aiExtractTasks, createStaged, executeAiRewrite, title, toast, setLocation, aiPanel.deepThink, content]);

  const handleTranslateConfirm = useCallback(() => {
    const text = pendingTranslateTextRef.current;
    const isSelection = text !== content;
    setShowTranslateDialog(false);
    executeAiRewrite(text, "translate", aiPanel.deepThink, isSelection, targetLanguage);
  }, [executeAiRewrite, aiPanel.deepThink, targetLanguage, content]);

  const handleAiInsert = useCallback(() => {
    if (aiPanel.isSelection) {
      const newContent = content.replace(aiPanel.sourceText, aiPanel.result);
      setContent(newContent);
      contentRef.current = newContent;
    } else {
      setContent(aiPanel.result);
      contentRef.current = aiPanel.result;
    }
    setAiPanel(prev => ({ ...prev, visible: false }));
    debouncedSave();
  }, [aiPanel.result, aiPanel.sourceText, aiPanel.isSelection, content, debouncedSave]);

  const handleAiRetry = useCallback(() => {
    executeAiRewrite(aiPanel.sourceText, aiPanel.action, aiPanel.deepThink, aiPanel.isSelection);
  }, [aiPanel.sourceText, aiPanel.action, aiPanel.deepThink, aiPanel.isSelection, executeAiRewrite]);

  const handleArchive = useCallback(async () => {
    if (isNew) return;
    try {
      await updateNote.mutateAsync({ id: noteId, data: { isArchived: true } });
      queryClient.invalidateQueries({ queryKey: getListNotesQueryKey() });
      setLocation("/notes");
      const undoTimer = setTimeout(() => {}, 5000);
      toast({
        title: "Note archived",
        description: "This note has been archived.",
        action: (
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              clearTimeout(undoTimer);
              await updateNote.mutateAsync({ id: noteId, data: { isArchived: false } });
              queryClient.invalidateQueries({ queryKey: getListNotesQueryKey() });
              toast({ title: "Note restored" });
            }}
          >
            Undo
          </Button>
        ),
      });
    } catch {
      toast({ variant: "destructive", title: "Failed to archive note" });
    }
    setShowThreeDotMenu(false);
  }, [isNew, noteId, updateNote, queryClient, setLocation, toast]);

  const handleSaveAsTemplate = useCallback(async () => {
    if (!templateName.trim()) return;
    try {
      await createNoteTemplate.mutateAsync({
        data: {
          name: templateName.trim(),
          content: content,
          category: templateCategory,
          isBuiltIn: false,
        },
      });
      toast({ title: "Template saved", description: `"${templateName}" is now available as a template.` });
      setShowTemplateDialog(false);
      setTemplateName("");
      setTemplateCategory("general");
    } catch {
      toast({ variant: "destructive", title: "Failed to save template" });
    }
  }, [templateName, templateCategory, content, createNoteTemplate, toast]);

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
                className={note?.isPublished ? "text-success" : "text-muted-foreground"}
                title={note?.isPublished ? "Unpublish" : "Publish"}
              >
                <Globe size={20} />
              </Button>
            </>
          )}
          <Button variant="ghost" size="icon" onClick={togglePin} className={isPinned ? "text-primary" : "text-muted-foreground"}>
            <Pin size={20} className={isPinned ? "fill-current" : ""} />
          </Button>
          <div className="relative" ref={threeDotRef}>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground"
              onClick={() => setShowThreeDotMenu(!showThreeDotMenu)}
            >
              <MoreVertical size={20} />
            </Button>
            {showThreeDotMenu && (
              <div className="absolute right-0 top-full mt-1 z-50 bg-card border border-border rounded-lg shadow-lg py-1 min-w-[180px]">
                {!isNew && (
                  <button
                    onClick={handleArchive}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                  >
                    <Archive size={14} /> Archive
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowTemplateDialog(true);
                    setShowThreeDotMenu(false);
                    setTemplateName(title || "Untitled Template");
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                >
                  <Save size={14} /> Save as Template
                </button>
                <div className="border-t border-border my-1" />
                <button
                  onClick={() => { handleDelete(); setShowThreeDotMenu(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {note?.isPublished && note.publishSlug && (
        <div className="flex items-center gap-2 bg-success/10 border border-success/30 rounded-lg px-3 py-2 text-xs">
          <Globe size={14} className="text-success" />
          <span className="text-success">Published at</span>
          <code className="text-success font-mono">/published/{note.publishSlug}</code>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 text-success ml-auto"
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
              className="text-[11px] bg-info/15 text-info px-2 py-0.5 rounded-full hover:bg-info/25 transition-colors cursor-pointer"
            >
              {mention}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 mb-1">
        <button
          onClick={() => { setEditorMode("classic"); localStorage.setItem("tempo-editor-mode", "classic"); }}
          className={`text-xs px-2 py-1 rounded ${editorMode === "classic" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"}`}
        >
          Classic
        </button>
        <button
          onClick={() => { setEditorMode("milkdown"); localStorage.setItem("tempo-editor-mode", "milkdown"); }}
          className={`text-xs px-2 py-1 rounded ${editorMode === "milkdown" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"}`}
        >
          Rich Editor
        </button>
      </div>
      <div className="flex-1 min-h-0">
        {editorMode === "milkdown" ? (
          <div className="border border-border rounded-lg overflow-hidden" style={{ height: 500 }}>
            <div className="h-full overflow-y-auto">
              <MilkdownEditorComponent
                key={isNew ? "new" : noteId}
                defaultValue={content}
                onChange={handleContentChange}
                className="min-h-full"
              />
            </div>
          </div>
        ) : (
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
            onAiAction={handleAiAction}
          />
        )}
      </div>

      {!isNew && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <Paperclip size={12} /> Attachments
              {attachments.length > 0 && (
                <span className="bg-primary/20 text-primary px-1.5 py-0.5 rounded-full text-[10px] ml-1">
                  {attachments.length}
                </span>
              )}
            </span>
            <div>
              <input
                ref={attachmentInputRef}
                type="file"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUploadAttachment(file);
                }}
              />
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs gap-1"
                onClick={() => attachmentInputRef.current?.click()}
                disabled={uploadingAttachment}
              >
                {uploadingAttachment ? <Loader2 size={12} className="animate-spin" /> : <Paperclip size={12} />}
                Attach
              </Button>
            </div>
          </div>
          {attachments.length > 0 && (
            <div className="space-y-1">
              {attachments.map((att) => (
                <div key={att.filename} className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2 group">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileIcon size={14} className="text-muted-foreground shrink-0" />
                    <span className="text-sm truncate">{att.originalName}</span>
                    <span className="text-[10px] text-muted-foreground shrink-0">{formatFileSize(att.size)}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-destructive opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                    onClick={() => handleDeleteAttachment(att.filename)}
                  >
                    <X size={12} />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

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

      {aiPanel.visible && (
        <AiPreviewPanel
          result={aiPanel.result}
          isLoading={aiPanel.isLoading}
          action={aiPanel.action}
          onInsert={handleAiInsert}
          onRetry={handleAiRetry}
          onDismiss={() => setAiPanel(prev => ({ ...prev, visible: false }))}
          deepThink={aiPanel.deepThink}
          onToggleDeepThink={(v) => setAiPanel(prev => ({ ...prev, deepThink: v }))}
        />
      )}

      {showTemplateDialog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowTemplateDialog(false)}>
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md space-y-4" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-semibold">Save as Template</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Template Name</label>
                <Input
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="My Template"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Category</label>
                <select
                  value={templateCategory}
                  onChange={(e) => setTemplateCategory(e.target.value)}
                  className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm"
                >
                  <option value="general">General</option>
                  <option value="journal">Journal</option>
                  <option value="meeting">Meeting</option>
                  <option value="project">Project</option>
                  <option value="review">Review</option>
                  <option value="planning">Planning</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setShowTemplateDialog(false)}>Cancel</Button>
              <Button onClick={handleSaveAsTemplate} disabled={!templateName.trim()}>
                Save Template
              </Button>
            </div>
          </div>
        </div>
      )}

      {showTranslateDialog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowTranslateDialog(false)}>
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-sm space-y-4" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-semibold">Translate To</h2>
            <select
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value)}
              className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm"
              autoFocus
            >
              <option value="Spanish">Spanish</option>
              <option value="French">French</option>
              <option value="German">German</option>
              <option value="Portuguese">Portuguese</option>
              <option value="Italian">Italian</option>
              <option value="Japanese">Japanese</option>
              <option value="Korean">Korean</option>
              <option value="Chinese (Simplified)">Chinese (Simplified)</option>
              <option value="Arabic">Arabic</option>
              <option value="Hindi">Hindi</option>
              <option value="Dutch">Dutch</option>
              <option value="Russian">Russian</option>
            </select>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setShowTranslateDialog(false)}>Cancel</Button>
              <Button onClick={handleTranslateConfirm}>Translate</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
