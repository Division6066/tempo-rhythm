import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";

export interface KanbanColumn<T> {
  id: string;
  title: string;
  items: T[];
  onAdd?: () => void;
}

interface KanbanBoardProps<T> {
  columns: KanbanColumn<T>[];
  renderCard: (item: T) => React.ReactNode;
  getItemId: (item: T) => string;
  onDragEnd: (itemId: string, fromColumnId: string, toColumnId: string) => void;
}

function DraggableCard({
  id,
  columnId,
  children,
}: {
  id: string;
  columnId: string;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    data: { columnId },
  });

  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      className={`transition-opacity ${isDragging ? "opacity-30" : ""}`}
    >
      {children}
    </div>
  );
}

function DroppableColumn<T>({
  column,
  renderCard,
  getItemId,
  dragOverColumnId,
}: {
  column: KanbanColumn<T>;
  renderCard: (item: T) => React.ReactNode;
  getItemId: (item: T) => string;
  dragOverColumnId: string | null;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <div className="flex-shrink-0 w-72">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-foreground">{column.title}</h3>
          <span className="text-xs bg-muted text-muted-foreground rounded-full px-2 py-0.5">
            {column.items.length}
          </span>
        </div>
        {column.onAdd && (
          <button
            onClick={column.onAdd}
            className="text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            + Add
          </button>
        )}
      </div>
      <div
        ref={setNodeRef}
        className={`space-y-2 min-h-[200px] p-2 rounded-xl border transition-colors ${
          isOver || dragOverColumnId === column.id
            ? "border-primary/50 bg-primary/5"
            : "border-border/30 bg-card/30"
        }`}
      >
        {column.items.map((item) => (
          <DraggableCard key={getItemId(item)} id={getItemId(item)} columnId={column.id}>
            {renderCard(item)}
          </DraggableCard>
        ))}
        {column.items.length === 0 && (
          <div className="text-center py-8 text-xs text-muted-foreground/50">
            Drop items here
          </div>
        )}
      </div>
    </div>
  );
}

export function KanbanBoard<T>({
  columns,
  renderCard,
  getItemId,
  onDragEnd,
}: KanbanBoardProps<T>) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const allItems = columns.flatMap((col) => col.items);
  const activeItem = activeId ? allItems.find((item) => getItemId(item) === activeId) : null;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragOver = (event: DragOverEvent) => {
    if (event.over) {
      const overColumnId = columns.find((c) => c.id === String(event.over!.id))?.id;
      setDragOverColumnId(overColumnId || null);
    } else {
      setDragOverColumnId(null);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    setDragOverColumnId(null);

    const { active, over } = event;
    if (!over) return;

    const fromColumnId = (active.data?.current as { columnId?: string })?.columnId;
    const toColumnId = String(over.id);
    const isValidColumn = columns.some((c) => c.id === toColumnId);

    if (fromColumnId && toColumnId && isValidColumn && fromColumnId !== toColumnId) {
      onDragEnd(String(active.id), fromColumnId, toColumnId);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2">
        {columns.map((column) => (
          <DroppableColumn
            key={column.id}
            column={column}
            renderCard={renderCard}
            getItemId={getItemId}
            dragOverColumnId={dragOverColumnId}
          />
        ))}
      </div>
      <DragOverlay>
        {activeItem ? (
          <div className="opacity-90 rotate-2 scale-105">
            {renderCard(activeItem)}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
