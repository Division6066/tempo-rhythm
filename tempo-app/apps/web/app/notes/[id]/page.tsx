"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Trash2,
  Pin,
  Eye,
  Edit3,
  Globe,
  Link as LinkIcon,
  Hash,
  Mic,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import { VoiceNote } from "@/components/VoiceNote";

export default function NoteEditorPage() {
  const params = useParams();
  const router = useRouter();
  const isNew = params.id === "new";
  const noteId = !isNew ? (params.id as Id<"notes">) : undefined;

  const note = useQuery(api.notes.get, noteId ? { id: noteId } : "skip");
  const allNotes = useQuery(api.notes.list);
  const backlinks = useQuery(
    api.noteLinks.listBacklinks,
    noteId ? { targetNoteId: noteId } : "skip"
  );
  const createNote = useMutation(api.notes.create);
  const updateNote = useMutation(api.notes.update);
  const deleteNote = useMutation(api.notes.remove);
  const syncLinks = useMutation(api.noteLinks.syncLinks);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [tab, setTab] = useState<"edit" | "preview">("edit");

  useEffect(() => {
    if (note && !isNew) {
      setTitle(note.title);
      setContent(note.content);
      setIsPinned(note.isPinned);
    }
  }, [note, isNew]);

  const parseWikiLinks = useCallback(
    (text: string): Id<"notes">[] => {
      const regex = /\[\[([^\]]+)\]\]/g;
      const links: Id<"notes">[] = [];
      let match;
      while ((match = regex.exec(text)) !== null) {
        const linkTitle = match[1];
        const linkedNote = (allNotes || []).find(
          (n) => n.title.toLowerCase() === linkTitle.toLowerCase()
        );
        if (linkedNote) {
          links.push(linkedNote._id);
        }
      }
      return links;
    },
    [allNotes]
  );

  const handleSave = async () => {
    if (!title && !content) return;
    if (isNew) {
      const id = await createNote({
        title: title || "Untitled",
        content,
        isPinned,
      });
      const linkedIds = parseWikiLinks(content);
      if (linkedIds.length > 0) {
        await syncLinks({
          sourceNoteId: id,
          targetNoteIds: linkedIds,
        });
      }
      router.push(`/notes/${id}`);
    } else if (noteId) {
      await updateNote({ id: noteId, title, content, isPinned });
      const linkedIds = parseWikiLinks(content);
      await syncLinks({
        sourceNoteId: noteId,
        targetNoteIds: linkedIds,
      });
    }
  };

  const handleDelete = async () => {
    if (isNew) {
      router.push("/notes");
      return;
    }
    if (noteId) {
      await deleteNote({ id: noteId });
      router.push("/notes");
    }
  };

  const togglePin = async () => {
    setIsPinned(!isPinned);
    if (!isNew && noteId) {
      await updateNote({ id: noteId, isPinned: !isPinned });
    }
  };

  const togglePublish = async () => {
    if (!noteId || !note) return;
    const isCurrentlyPublished = note.isPublished;
    if (isCurrentlyPublished) {
      await updateNote({
        id: noteId,
        isPublished: false,
        publishSlug: null,
      });
    } else {
      const slug =
        title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "") +
        "-" +
        Date.now().toString(36);
      await updateNote({
        id: noteId,
        isPublished: true,
        publishSlug: slug,
      });
    }
  };

  const extractTags = (text: string): string[] => {
    const regex = /#([a-zA-Z0-9_-]+)/g;
    const tags: string[] = [];
    let match;
    while ((match = regex.exec(text)) !== null) {
      tags.push(match[1]);
    }
    return [...new Set(tags)];
  };

  const extractMentions = (text: string): string[] => {
    const regex = /@([a-zA-Z0-9_-]+)/g;
    const mentions: string[] = [];
    let match;
    while ((match = regex.exec(text)) !== null) {
      mentions.push(match[1]);
    }
    return [...new Set(mentions)];
  };

  const contentTags = useMemo(() => extractTags(content), [content]);
  const contentMentions = useMemo(() => extractMentions(content), [content]);

  const renderContentWithLinks = (text: string) => {
    let processed = text.replace(
      /\[\[([^\]]+)\]\]/g,
      (_, linkTitle) => {
        const linkedNote = (allNotes || []).find(
          (n) => n.title.toLowerCase() === linkTitle.toLowerCase()
        );
        if (linkedNote) {
          return `[${linkTitle}](/notes/${linkedNote._id})`;
        }
        return `**[[${linkTitle}]]**`;
      }
    );
    processed = processed.replace(
      /#([a-zA-Z0-9_-]+)/g,
      "**#$1**"
    );
    processed = processed.replace(
      /@([a-zA-Z0-9_-]+)/g,
      "**@$1**"
    );
    return processed;
  };

  if (!isNew && !note) {
    return (
      <AppLayout>
        <div className="flex h-[50vh] items-center justify-center">
          <div className="w-16 h-16 rounded-full animate-breathe bg-primary/20" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-4 pb-12 flex flex-col h-full">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/notes")}
          >
            <ArrowLeft size={20} />
          </Button>
          <div className="flex gap-2">
            {!isNew && note && (
              <Button
                variant="ghost"
                size="icon"
                onClick={togglePublish}
                className={
                  note.isPublished
                    ? "text-teal-400"
                    : "text-muted-foreground"
                }
                title={note.isPublished ? "Unpublish" : "Publish"}
              >
                <Globe
                  size={20}
                  className={note.isPublished ? "fill-current" : ""}
                />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={togglePin}
              className={
                isPinned ? "text-primary" : "text-muted-foreground"
              }
            >
              <Pin
                size={20}
                className={isPinned ? "fill-current" : ""}
              />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:bg-destructive/20"
              onClick={handleDelete}
            >
              <Trash2 size={20} />
            </Button>
          </div>
        </div>

        {!isNew && note?.isPublished && note?.publishSlug && (
          <div className="bg-teal-500/10 border border-teal-500/30 p-3 rounded-xl">
            <p className="text-sm text-teal-400 flex items-center gap-2">
              <Globe size={14} />
              Published at{" "}
              <Link
                href={`/published/${note.publishSlug}`}
                className="underline"
              >
                /published/{note.publishSlug}
              </Link>
            </p>
          </div>
        )}

        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleSave}
          placeholder="Note Title"
          className="text-2xl font-bold border-none bg-transparent px-0 focus-visible:ring-0"
        />

        {(contentTags.length > 0 || contentMentions.length > 0) && (
          <div className="flex flex-wrap gap-2">
            {contentTags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary flex items-center gap-1"
              >
                <Hash size={10} />
                {tag}
              </span>
            ))}
            {contentMentions.map((mention) => (
              <span
                key={mention}
                className="text-xs px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400"
              >
                @{mention}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between border-b border-border pb-2">
          <div className="flex gap-2">
            <button
              onClick={() => setTab("edit")}
              className={`px-4 py-2 text-sm font-medium cursor-pointer ${tab === "edit" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}
            >
              <Edit3 size={14} className="inline mr-1" /> Edit
            </button>
            <button
              onClick={() => setTab("preview")}
              className={`px-4 py-2 text-sm font-medium cursor-pointer ${tab === "preview" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}
            >
              <Eye size={14} className="inline mr-1" /> Preview
            </button>
          </div>
          <VoiceNote
            onTranscription={(text) => {
              setContent((prev) => prev + "\n\n" + text);
              setTimeout(handleSave, 100);
            }}
          />
        </div>

        {tab === "edit" ? (
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onBlur={handleSave}
            placeholder="Start typing (Markdown supported)... Use [[Note Title]] to link notes, #tag for tags, @mention for mentions"
            className="min-h-[400px] h-full bg-card border-border resize-none font-mono text-sm leading-relaxed"
          />
        ) : (
          <div className="bg-card/50 p-6 rounded-xl border border-border min-h-[400px] prose prose-invert max-w-none">
            <ReactMarkdown>
              {renderContentWithLinks(content) || "*Nothing to preview*"}
            </ReactMarkdown>
          </div>
        )}

        {backlinks && backlinks.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-border/50">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <LinkIcon size={12} /> Backlinks ({backlinks.length})
            </h3>
            <div className="space-y-2">
              {backlinks.map((bl) => (
                <Link key={bl.linkId} href={`/notes/${bl.note._id}`}>
                  <div className="glass p-3 rounded-lg cursor-pointer hover:bg-white/5 transition-all">
                    <p className="text-sm font-medium text-foreground">
                      {bl.note.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                      {bl.note.content}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
