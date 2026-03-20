import { LayoutGrid, Columns3, Table2, List } from "lucide-react";

export type ViewMode = "list" | "kanban" | "table";

interface ViewToggleProps {
  current: ViewMode;
  onChange: (mode: ViewMode) => void;
  modes?: ViewMode[];
}

const icons: Record<ViewMode, React.ReactNode> = {
  list: <List size={16} />,
  kanban: <Columns3 size={16} />,
  table: <Table2 size={16} />,
};

const labels: Record<ViewMode, string> = {
  list: "List",
  kanban: "Kanban",
  table: "Table",
};

export function ViewToggle({ current, onChange, modes = ["list", "kanban", "table"] }: ViewToggleProps) {
  return (
    <div className="flex items-center bg-card border border-border rounded-lg p-0.5 gap-0.5">
      {modes.map((mode) => (
        <button
          key={mode}
          onClick={() => onChange(mode)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            current === mode
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
        >
          {icons[mode]}
          {labels[mode]}
        </button>
      ))}
    </div>
  );
}
