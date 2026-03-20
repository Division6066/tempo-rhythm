import { useState, useEffect, useRef, useCallback } from "react";
import { FilePlus2 } from "lucide-react";

interface WikiLinkAutocompleteProps {
  notes: Array<{ id: number; title: string }>;
  query: string;
  position: { top: number; left: number };
  onSelect: (title: string) => void;
  onCreate: (title: string) => void;
  onClose: () => void;
}

export default function WikiLinkAutocomplete({
  notes,
  query,
  position,
  onSelect,
  onCreate,
  onClose,
}: WikiLinkAutocompleteProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = notes.filter((n) =>
    n.title.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 8);

  const hasExactMatch = filtered.some(
    (n) => n.title.toLowerCase() === query.toLowerCase()
  );
  const showCreate = query.length > 0 && !hasExactMatch;
  const totalItems = filtered.length + (showCreate ? 1 : 0);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, totalItems - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (selectedIndex < filtered.length) {
          onSelect(filtered[selectedIndex].title);
        } else if (showCreate) {
          onCreate(query);
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    },
    [selectedIndex, filtered, totalItems, showCreate, query, onSelect, onCreate, onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, [handleKeyDown]);

  useEffect(() => {
    const el = containerRef.current?.querySelector(`[data-index="${selectedIndex}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  if (totalItems === 0) return null;

  return (
    <div
      ref={containerRef}
      className="fixed z-50 bg-card border border-border rounded-lg shadow-lg py-1 w-64 max-h-48 overflow-y-auto"
      style={{ top: position.top, left: position.left }}
    >
      {filtered.map((note, i) => (
        <button
          key={note.id}
          data-index={i}
          onClick={() => onSelect(note.title)}
          className={`w-full text-left text-sm px-3 py-1.5 truncate transition-colors ${
            i === selectedIndex
              ? "bg-primary/20 text-primary"
              : "hover:bg-muted text-foreground"
          }`}
        >
          {note.title}
        </button>
      ))}
      {showCreate && (
        <button
          data-index={filtered.length}
          onClick={() => onCreate(query)}
          className={`w-full text-left text-sm px-3 py-1.5 flex items-center gap-2 transition-colors ${
            selectedIndex === filtered.length
              ? "bg-primary/20 text-primary"
              : "hover:bg-muted text-muted-foreground"
          }`}
        >
          <FilePlus2 size={14} />
          Create "{query}"
        </button>
      )}
    </div>
  );
}
