import { useRoute } from "wouter";
import { useGetPublishedNote } from "@workspace/api-client-react";
import ReactMarkdown from "react-markdown";
import { FileText } from "lucide-react";

export default function PublishedNote() {
  const [, params] = useRoute("/published/:slug");
  const slug = params?.slug || "";

  const { data: note, isLoading, isError } = useGetPublishedNote(slug, {
    query: { enabled: !!slug, queryKey: ["publishedNote", slug] },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 rounded-full animate-breathe bg-primary/20" />
      </div>
    );
  }

  if (isError || !note) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <FileText size={48} className="mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">Note not found</p>
          <p className="text-sm mt-1">This note may have been unpublished or doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-display font-bold mb-8">{note.title}</h1>
        <div className="prose prose-invert max-w-none">
          <ReactMarkdown>{note.content}</ReactMarkdown>
        </div>
        <div className="mt-12 pt-6 border-t border-border text-xs text-muted-foreground">
          Published with Tempo
        </div>
      </div>
    </div>
  );
}
