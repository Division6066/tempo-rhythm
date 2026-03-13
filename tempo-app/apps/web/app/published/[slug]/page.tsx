"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import ReactMarkdown from "react-markdown";
import { format } from "date-fns";

export default function PublishedNotePage() {
  const params = useParams();
  const slug = params.slug as string;
  const note = useQuery(api.notes.getBySlug, { slug });

  if (note === undefined) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-16 h-16 rounded-full animate-pulse bg-primary/20" />
      </div>
    );
  }

  if (note === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">Not Found</h1>
          <p className="text-muted-foreground">
            This note doesn&apos;t exist or has been unpublished.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            {note.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            Last updated {format(new Date(note.updatedAt), "MMMM d, yyyy")}
          </p>
        </div>
        <div className="prose prose-invert max-w-none">
          <ReactMarkdown>{note.content}</ReactMarkdown>
        </div>
        <div className="mt-12 pt-6 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            Published with Tempo
          </p>
        </div>
      </div>
    </div>
  );
}
