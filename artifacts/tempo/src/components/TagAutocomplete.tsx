import { useState, useEffect, useRef, useCallback } from "react";

interface TagAutocompleteProps {
  tags: string[];
  query: string;
  position: { top: number; left: number };
  onSelect: (tag: string) => void;
  onClose: () => void;
}

export default function TagAutocomplete({
  tags,
  query,
  position,
  onSelect,
  onClose,
}: TagAutocompleteProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = tags.filter((t) =>
    t.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 8);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, filtered.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filtered.length > 0) {
          onSelect(filtered[selectedIndex]);
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    },
    [selectedIndex, filtered, onSelect, onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, [handleKeyDown]);

  useEffect(() => {
    const el = containerRef.current?.querySelector(`[data-index="${selectedIndex}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  if (filtered.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className="fixed z-50 bg-card border border-border rounded-lg shadow-lg py-1 w-48 max-h-48 overflow-y-auto"
      style={{ top: position.top, left: position.left }}
    >
      {filtered.map((tag, i) => (
        <button
          key={tag}
          data-index={i}
          onClick={() => onSelect(tag)}
          className={`w-full text-left text-sm px-3 py-1.5 truncate transition-colors ${
            i === selectedIndex
              ? "bg-primary/20 text-primary"
              : "hover:bg-muted text-foreground"
          }`}
        >
          #{tag}
        </button>
      ))}
    </div>
  );
}
