"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../convex/_generated/dataModel";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Eye,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  addWeeks,
  subWeeks,
  addMonths,
  subMonths,
  addYears,
  subYears,
} from "date-fns";

function getPeriodDate(type: string, date: Date): string {
  switch (type) {
    case "weekly":
      return format(startOfWeek(date, { weekStartsOn: 1 }), "yyyy-MM-dd");
    case "monthly":
      return format(startOfMonth(date), "yyyy-MM");
    case "yearly":
      return format(date, "yyyy");
    default:
      return format(date, "yyyy-MM-dd");
  }
}

function getPeriodLabel(type: string, date: Date): string {
  switch (type) {
    case "weekly": {
      const s = startOfWeek(date, { weekStartsOn: 1 });
      const e = endOfWeek(date, { weekStartsOn: 1 });
      return `Week of ${format(s, "MMM d")} - ${format(e, "MMM d, yyyy")}`;
    }
    case "monthly":
      return format(date, "MMMM yyyy");
    case "yearly":
      return format(date, "yyyy");
    default:
      return format(date, "MMMM d, yyyy");
  }
}

function getDefaultContent(type: string, date: Date): string {
  const label = getPeriodLabel(type, date);
  switch (type) {
    case "weekly":
      return `# ${label}\n\n## Goals for this week\n1. \n2. \n3. \n\n## Notes\n\n\n## Reflection\n`;
    case "monthly":
      return `# ${label}\n\n## Monthly Goals\n1. \n2. \n3. \n\n## Key Projects\n\n\n## Review\n`;
    case "yearly":
      return `# ${label}\n\n## Yearly Objectives\n1. \n2. \n3. \n\n## Themes\n\n\n## Reflection\n`;
    default:
      return "";
  }
}

export default function PeriodNotePage() {
  const params = useParams();
  const router = useRouter();
  const type = params.type as string;

  const [currentDate, setCurrentDate] = useState(new Date());
  const [content, setContent] = useState("");
  const [tab, setTab] = useState<"edit" | "preview">("edit");
  const [initialized, setInitialized] = useState(false);

  const periodDate = getPeriodDate(type, currentDate);
  const periodLabel = getPeriodLabel(type, currentDate);

  const existingNote = useQuery(api.notes.getByPeriod, {
    periodType: type,
    periodDate,
  });

  const createNote = useMutation(api.notes.create);
  const updateNote = useMutation(api.notes.update);

  useEffect(() => {
    if (existingNote !== undefined) {
      if (existingNote) {
        setContent(existingNote.content);
      } else {
        setContent(getDefaultContent(type, currentDate));
      }
      setInitialized(true);
    }
  }, [existingNote, type, currentDate]);

  const navigate = (direction: number) => {
    switch (type) {
      case "weekly":
        setCurrentDate(
          direction > 0
            ? addWeeks(currentDate, 1)
            : subWeeks(currentDate, 1)
        );
        break;
      case "monthly":
        setCurrentDate(
          direction > 0
            ? addMonths(currentDate, 1)
            : subMonths(currentDate, 1)
        );
        break;
      case "yearly":
        setCurrentDate(
          direction > 0
            ? addYears(currentDate, 1)
            : subYears(currentDate, 1)
        );
        break;
    }
    setInitialized(false);
  };

  const handleSave = async () => {
    if (existingNote) {
      await updateNote({ id: existingNote._id, content });
    } else {
      await createNote({
        title: periodLabel,
        content,
        periodType: type,
        periodDate,
      });
    }
  };

  if (!initialized) {
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
      <div className="space-y-4 pb-12">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/calendar")}
          >
            <ArrowLeft size={20} />
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
            >
              <ChevronLeft size={18} />
            </Button>
            <h2 className="text-lg font-semibold text-foreground min-w-[200px] text-center">
              {periodLabel}
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(1)}
            >
              <ChevronRight size={18} />
            </Button>
          </div>
          <div />
        </div>

        <div className="flex gap-2 border-b border-border pb-2">
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

        {tab === "edit" ? (
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onBlur={handleSave}
            placeholder="Start writing..."
            className="min-h-[500px] bg-card border-border resize-none font-mono text-sm leading-relaxed"
          />
        ) : (
          <div className="bg-card/50 p-6 rounded-xl border border-border min-h-[500px] prose prose-invert max-w-none">
            <ReactMarkdown>
              {content || "*Nothing to preview*"}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
