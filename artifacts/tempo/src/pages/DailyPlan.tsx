import { useState, useCallback, useEffect, type ReactNode } from "react";
import { markPlanAccepted } from "@/components/PushPermissionBanner";
import { useAiGeneratePlan, useListTasks, useListDailyPlans, useCreateDailyPlan, useUpdateDailyPlan, getListDailyPlansQueryKey, useListStagedSuggestions, useCreateStagedSuggestion, useAcceptStagedSuggestion, useRejectStagedSuggestion, useUpdateStagedSuggestionData, getListStagedSuggestionsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Sparkles, Check, X, Pencil, GripVertical, Trash2, Battery, BatteryLow, BatteryMedium, BatteryFull } from "lucide-react";
import { format } from "date-fns";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type PlanBlock = { type: string; title?: string; items?: string[]; tasks?: string[]; task?: string; startTime?: string; duration?: number; prompt?: string; rationale?: string; _id?: string };

type EnergyLevel = "low" | "medium" | "high";

let blockIdCounter = 0;
function assignBlockIds(blocks: PlanBlock[]): PlanBlock[] {
  return blocks.map(b => b._id ? b : { ...b, _id: `blk-${++blockIdCounter}` });
}

function stripBlockIds(blocks: PlanBlock[]): Record<string, unknown>[] {
  return blocks.map(({ _id, ...rest }) => rest as Record<string, unknown>);
}

const ENERGY_OPTIONS: { value: EnergyLevel; label: string; description: string; icon: ReactNode; color: string }[] = [
  { value: "low", label: "Low", description: "Tired, foggy, need gentle tasks", icon: <BatteryLow size={20} />, color: "text-warning border-warning/40 bg-warning/10" },
  { value: "medium", label: "Medium", description: "Decent energy, can focus some", icon: <BatteryMedium size={20} />, color: "text-info border-info/40 bg-info/10" },
  { value: "high", label: "High", description: "Energized, ready for deep work", icon: <BatteryFull size={20} />, color: "text-success border-success/40 bg-success/10" },
];

const MOOD_EMOJIS = [
  { emoji: "😊", label: "Happy" },
  { emoji: "😌", label: "Calm" },
  { emoji: "😤", label: "Determined" },
  { emoji: "😴", label: "Tired" },
  { emoji: "😟", label: "Anxious" },
];

type TaskOption = { id: number; title: string };

function TaskSearchDropdown({ value, onChange, tasks }: { value: string; onChange: (val: string) => void; tasks: TaskOption[] }) {
  const [search, setSearch] = useState(value);
  const [isOpen, setIsOpen] = useState(false);

  const filtered = tasks.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 8);

  return (
    <div className="relative">
      <Input
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setIsOpen(true);
          onChange(e.target.value);
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        className="bg-background border-border text-sm"
        placeholder="Search tasks to swap..."
      />
      {isOpen && filtered.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 max-h-40 overflow-y-auto">
          {filtered.map((t) => (
            <button
              key={t.id}
              className="w-full text-left px-3 py-2 text-sm hover:bg-primary/10 transition-colors"
              onMouseDown={(e) => {
                e.preventDefault();
                setSearch(t.title);
                onChange(t.title);
                setIsOpen(false);
              }}
            >
              {t.title}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SortableBlock({ block, index, id, isEditing, onUpdate, onRemove, renderBlock, allTasks }: {
  block: PlanBlock;
  index: number;
  id: string;
  isEditing: boolean;
  onUpdate: (index: number, field: keyof PlanBlock, value: unknown) => void;
  onRemove: (index: number) => void;
  renderBlock: (block: PlanBlock, i: number) => ReactNode;
  allTasks?: TaskOption[];
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  if (isEditing) {
    return (
      <div ref={setNodeRef} style={style} {...attributes}>
        <Card className="glass">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <button {...listeners} className="cursor-grab active:cursor-grabbing p-1 text-muted-foreground hover:text-foreground touch-none">
                <GripVertical size={16} />
              </button>
              <Input
                value={block.title || block.type || ""}
                onChange={(e) => onUpdate(index, "title", e.target.value)}
                className="bg-background border-border text-lg font-semibold h-9"
                placeholder="Block title"
              />
              <Input
                value={block.startTime || ""}
                onChange={(e) => onUpdate(index, "startTime", e.target.value)}
                className="bg-background border-border text-xs h-9 w-24"
                placeholder="Time"
                type="time"
              />
              <Input
                type="number"
                value={block.duration || ""}
                onChange={(e) => onUpdate(index, "duration", e.target.value ? parseInt(e.target.value) : undefined)}
                className="bg-background border-border text-xs h-9 w-20"
                placeholder="min"
              />
              <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive shrink-0" onClick={() => onRemove(index)}>
                <Trash2 size={14} />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {block.task !== undefined && allTasks && allTasks.length > 0 ? (
              <TaskSearchDropdown
                value={block.task || ""}
                onChange={(val) => onUpdate(index, "task", val)}
                tasks={allTasks}
              />
            ) : block.task !== undefined ? (
              <Input
                value={block.task || ""}
                onChange={(e) => onUpdate(index, "task", e.target.value)}
                className="bg-background border-border text-sm"
                placeholder="Task description"
              />
            ) : null}
            {block.prompt !== undefined && (
              <Input
                value={block.prompt || ""}
                onChange={(e) => onUpdate(index, "prompt", e.target.value)}
                className="bg-background border-border text-sm italic"
                placeholder="Prompt"
              />
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <div className="flex items-start gap-2">
        <button {...listeners} className="cursor-grab active:cursor-grabbing p-2 mt-4 text-muted-foreground hover:text-foreground touch-none">
          <GripVertical size={16} />
        </button>
        <div className="flex-1">
          {renderBlock(block, index)}
        </div>
      </div>
    </div>
  );
}

export default function DailyPlan() {
  const todayDate = new Date().toISOString().split("T")[0];
  const { data: plans } = useListDailyPlans({ date: todayDate });
  const { data: todayTasks } = useListTasks({ status: "today" });
  const { data: allTasksData } = useListTasks({});
  const { data: stagedPlans } = useListStagedSuggestions({ type: "dailyPlan", status: "pending" });
  const generatePlan = useAiGeneratePlan();
  const createPlan = useCreateDailyPlan();
  const updatePlan = useUpdateDailyPlan();
  const createStaged = useCreateStagedSuggestion();
  const acceptStaged = useAcceptStagedSuggestion();
  const rejectStaged = useRejectStagedSuggestion();
  const updateStagedData = useUpdateStagedSuggestionData();
  const queryClient = useQueryClient();

  const [isEditingPlan, setIsEditingPlan] = useState(false);
  const [editingBlocks, setEditingBlocks] = useState<PlanBlock[]>([]);
  const [reorderedBlocks, setReorderedBlocks] = useState<PlanBlock[] | null>(null);
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel>("medium");
  const [contextText, setContextText] = useState("");
  const [showEnergyForm, setShowEnergyForm] = useState(false);
  const [showMoodModal, setShowMoodModal] = useState(false);
  const [acceptedPlanId, setAcceptedPlanId] = useState<number | null>(null);

  const taskOptions: TaskOption[] = (allTasksData || [])
    .filter((t) => t.status !== "done")
    .map((t) => ({ id: t.id, title: t.title }));

  const existingPlan = plans && plans.length > 0 ? plans[0] : null;
  const pendingStagedPlan = stagedPlans && stagedPlans.length > 0 ? stagedPlans[0] : null;
  const hasPlan = !!existingPlan;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: getListDailyPlansQueryKey() });
    queryClient.invalidateQueries({ queryKey: getListStagedSuggestionsQueryKey() });
  };

  const handleStartGeneration = () => {
    setShowEnergyForm(true);
  };

  const handleGenerate = async () => {
    setShowEnergyForm(false);
    const res = await generatePlan.mutateAsync({
      data: {
        date: todayDate,
        taskIds: todayTasks?.map((t) => t.id) || [],
        energyLevel,
        context: contextText || undefined,
      },
    });
    await createStaged.mutateAsync({
      data: {
        type: "dailyPlan",
        data: { blocks: res.blocks, date: todayDate, energyLevel },
        reasoning: res.reasoning,
      },
    });
    setReorderedBlocks(null);
    invalidateAll();
  };

  const handleAcceptPlan = async (suggestionId: number, blocks: PlanBlock[]) => {
    const suggestion = stagedPlans?.find(s => s.id === suggestionId);
    const stagedData = suggestion?.data as Record<string, unknown> | undefined;
    const storedEnergy = (stagedData?.energyLevel as EnergyLevel) || energyLevel;
    const energyMap: Record<EnergyLevel, number> = { low: 1, medium: 2, high: 3 };
    const result = await createPlan.mutateAsync({
      data: {
        date: todayDate,
        blocks: stripBlockIds(blocks),
        aiGenerated: true,
        energyLevel: energyMap[storedEnergy],
      },
    });
    await acceptStaged.mutateAsync({ id: suggestionId });
    invalidateAll();
    setAcceptedPlanId(result.id);
    setShowMoodModal(true);
    markPlanAccepted();
  };

  const handleMoodSelect = async (emoji: string) => {
    if (acceptedPlanId) {
      await updatePlan.mutateAsync({
        id: acceptedPlanId,
        data: { mood: emoji },
      });
      invalidateAll();
    }
    setShowMoodModal(false);
    setAcceptedPlanId(null);
  };

  useEffect(() => {
    if (showMoodModal) {
      const timer = setTimeout(() => {
        setShowMoodModal(false);
        setAcceptedPlanId(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [showMoodModal]);

  const handleRejectPlan = async (suggestionId: number) => {
    await rejectStaged.mutateAsync({ id: suggestionId });
    setReorderedBlocks(null);
    invalidateAll();
  };

  const startEditingPlan = (blocks: PlanBlock[]) => {
    setIsEditingPlan(true);
    setEditingBlocks(assignBlockIds(blocks.map(b => ({ ...b, items: b.items ? [...b.items] : undefined, tasks: b.tasks ? [...b.tasks] : undefined }))));
  };

  const cancelEditingPlan = () => {
    setIsEditingPlan(false);
    setEditingBlocks([]);
  };

  const updateBlock = (index: number, field: keyof PlanBlock, value: unknown) => {
    setEditingBlocks(prev => prev.map((b, i) => i === index ? { ...b, [field]: value } : b));
  };

  const removeBlock = (index: number) => {
    setEditingBlocks(prev => prev.filter((_, i) => i !== index));
  };

  const recalculateTimesAfterReorder = useCallback((blocks: PlanBlock[]): PlanBlock[] => {
    let currentMinutes: number | null = null;

    for (const block of blocks) {
      if (block.startTime && currentMinutes === null) {
        const [h, m] = block.startTime.split(":").map(Number);
        currentMinutes = h * 60 + m;
      }
    }

    if (currentMinutes === null) return blocks;

    return blocks.map((block) => {
      if (!block.startTime && !block.duration) return block;
      const h = Math.floor(currentMinutes! / 60);
      const m = currentMinutes! % 60;
      const newBlock = { ...block, startTime: `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}` };
      currentMinutes! += block.duration || 30;
      return newBlock;
    });
  }, []);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setEditingBlocks((prev) => {
      const oldIndex = prev.findIndex((b) => b._id === active.id);
      const newIndex = prev.findIndex((b) => b._id === over.id);
      if (oldIndex === -1 || newIndex === -1) return prev;
      const reordered = arrayMove(prev, oldIndex, newIndex);
      return recalculateTimesAfterReorder(reordered);
    });
  };

  const handleStagedDragEnd = async (event: DragEndEvent, currentBlocks: PlanBlock[], suggestionId: number) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = currentBlocks.findIndex((b) => b._id === active.id);
    const newIndex = currentBlocks.findIndex((b) => b._id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = recalculateTimesAfterReorder(arrayMove(currentBlocks, oldIndex, newIndex));

    setReorderedBlocks(reordered);

    const suggestion = stagedPlans?.find(s => s.id === suggestionId);
    if (!suggestion) return;
    const existingData = suggestion.data as Record<string, unknown>;
    await updateStagedData.mutateAsync({
      id: suggestionId,
      data: { data: { ...existingData, blocks: stripBlockIds(reordered) } },
    });
    invalidateAll();
  };

  const saveEditedPlan = async (suggestionId: number) => {
    const suggestion = stagedPlans?.find(s => s.id === suggestionId);
    if (!suggestion) return;
    const existingData = suggestion.data as Record<string, unknown>;
    await updateStagedData.mutateAsync({
      id: suggestionId,
      data: { data: { ...existingData, blocks: stripBlockIds(editingBlocks) } },
    });
    setIsEditingPlan(false);
    setEditingBlocks([]);
    setReorderedBlocks(null);
    invalidateAll();
  };

  const renderBlock = (block: PlanBlock, i: number) => (
    <Card key={i} className="glass">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{block.title || block.type}</CardTitle>
      </CardHeader>
      <CardContent>
        {block.items && (
          <ul className="space-y-1">
            {block.items.map((item, idx) => (
              <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        )}
        {block.tasks && (
          <ul className="space-y-1">
            {block.tasks.map((task, idx) => (
              <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[hsl(168,100%,39%)] shrink-0" />
                {task}
              </li>
            ))}
          </ul>
        )}
        {block.task && <p className="text-sm text-muted-foreground">{block.task}</p>}
        {block.startTime && <p className="text-xs text-primary mt-2">{block.startTime} — {block.duration}min</p>}
        {block.prompt && <p className="text-sm text-muted-foreground italic">{block.prompt}</p>}
        {block.rationale && (
          <p className="text-xs text-muted-foreground/70 italic mt-2">{block.rationale}</p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar className="text-primary h-8 w-8" />
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Daily Plan</h1>
            <p className="text-sm text-primary font-medium">{format(new Date(), "EEEE, MMMM do")}</p>
          </div>
        </div>
      </div>

      {showMoodModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] animate-in fade-in">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-2xl space-y-4 max-w-sm mx-4 animate-in zoom-in-95">
            <h3 className="text-lg font-semibold text-center">How are you feeling?</h3>
            <p className="text-sm text-muted-foreground text-center">Quick mood check before you start</p>
            <div className="flex justify-center gap-4">
              {MOOD_EMOJIS.map((m) => (
                <button
                  key={m.emoji}
                  onClick={() => handleMoodSelect(m.emoji)}
                  className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-primary/10 transition-all hover:scale-110"
                  title={m.label}
                >
                  <span className="text-3xl">{m.emoji}</span>
                  <span className="text-xs text-muted-foreground">{m.label}</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground/60 text-center">Auto-closes in 3s</p>
          </div>
        </div>
      )}

      {!hasPlan && !pendingStagedPlan && !showEnergyForm && (
        <Card className="glass border-dashed border-primary/50 text-center py-12">
          <CardContent className="space-y-6">
            <div className="w-20 h-20 bg-primary/10 rounded-full mx-auto flex items-center justify-center">
              <Sparkles className="text-primary w-10 h-10" />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-2">Let&apos;s plan your day</h2>
              <p className="text-muted-foreground max-w-xs mx-auto">
                AI will look at your tasks, energy peaks, and routines to build a realistic plan.
              </p>
            </div>
            <Button
              onClick={handleStartGeneration}
              disabled={generatePlan.isPending}
              size="lg"
              className="gap-2 bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
            >
              <Sparkles size={20} />
              Generate AI Plan
            </Button>
          </CardContent>
        </Card>
      )}

      {showEnergyForm && !pendingStagedPlan && !hasPlan && (
        <Card className="glass animate-in fade-in slide-in-from-bottom-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Battery className="text-primary" size={20} />
              How's your energy?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-3 gap-3">
              {ENERGY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setEnergyLevel(opt.value)}
                  className={`p-3 rounded-xl border-2 transition-all text-center space-y-1 ${
                    energyLevel === opt.value
                      ? opt.color + " scale-105 shadow-md"
                      : "border-border bg-card hover:border-muted-foreground/30"
                  }`}
                >
                  <div className="flex justify-center">{opt.icon}</div>
                  <div className="font-semibold text-sm">{opt.label}</div>
                  <div className="text-xs text-muted-foreground leading-tight">{opt.description}</div>
                </button>
              ))}
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Anything else AI should know? (optional)</label>
              <Textarea
                value={contextText}
                onChange={(e) => setContextText(e.target.value.slice(0, 200))}
                placeholder="e.g. I have a meeting at 2pm, feeling stressed about the deadline..."
                className="bg-background border-border resize-none h-20"
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground/60 text-right">{contextText.length}/200</p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={() => setShowEnergyForm(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={generatePlan.isPending}
                className="flex-1 gap-2 bg-primary text-primary-foreground shadow-lg shadow-primary/20"
              >
                <Sparkles size={18} />
                {generatePlan.isPending ? "Analyzing..." : "Generate Plan"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {pendingStagedPlan && !hasPlan && (() => {
        const rawBlocks = (pendingStagedPlan.data as Record<string, unknown>)?.blocks as PlanBlock[] || [];
        const planBlocks = assignBlockIds(rawBlocks);
        const currentBlocks = reorderedBlocks || planBlocks;
        const displayBlocks = isEditingPlan ? editingBlocks : currentBlocks;
        const blockIds = displayBlocks.map((b) => b._id!);
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-primary/10 border border-primary/30 p-4 rounded-xl flex items-start gap-3">
              <Sparkles className="text-primary mt-0.5 shrink-0" size={16} />
              <div>
                <h3 className="font-semibold text-primary mb-1">
                  AI Suggestion {isEditingPlan && <span className="text-xs text-warning font-normal ml-1">Editing</span>}
                </h3>
                <p className="text-sm text-foreground/80">{pendingStagedPlan.reasoning}</p>
              </div>
            </div>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={isEditingPlan ? handleDragEnd : (e) => handleStagedDragEnd(e, currentBlocks, pendingStagedPlan.id)}
            >
              <SortableContext items={blockIds} strategy={verticalListSortingStrategy}>
                <div className="space-y-4">
                  {displayBlocks.map((block, i) => (
                    <SortableBlock
                      key={block._id!}
                      id={block._id!}
                      block={block}
                      index={i}
                      isEditing={isEditingPlan}
                      onUpdate={updateBlock}
                      onRemove={removeBlock}
                      renderBlock={renderBlock}
                      allTasks={taskOptions}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            <div className="fixed bottom-24 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-card border border-border p-2 rounded-full shadow-xl z-50">
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:bg-destructive/20 hover:text-destructive rounded-full"
                onClick={() => handleRejectPlan(pendingStagedPlan.id)}
                title="Reject plan"
              >
                <X size={20} />
              </Button>
              {isEditingPlan ? (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:bg-muted/20 rounded-full"
                    onClick={cancelEditingPlan}
                    title="Cancel edit"
                  >
                    <X size={18} />
                  </Button>
                  <Button
                    size="icon"
                    className="bg-warning hover:bg-warning/90 text-white rounded-full shadow-lg"
                    onClick={() => saveEditedPlan(pendingStagedPlan.id)}
                    title="Save edits"
                    disabled={updateStagedData.isPending}
                  >
                    <Check size={20} />
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-warning hover:bg-warning/20 rounded-full"
                    onClick={() => startEditingPlan(currentBlocks)}
                    title="Edit plan"
                  >
                    <Pencil size={18} />
                  </Button>
                  <Button
                    size="icon"
                    className="bg-[hsl(168,100%,39%)] hover:bg-[hsl(168,100%,45%)] text-white rounded-full shadow-lg shadow-[hsl(168,100%,39%)]/20"
                    onClick={() => handleAcceptPlan(pendingStagedPlan.id, currentBlocks)}
                    title="Accept plan"
                  >
                    <Check size={20} />
                  </Button>
                </>
              )}
            </div>
          </div>
        );
      })()}

      {existingPlan && (
        <div className="space-y-4">
          <div className="bg-[hsl(168,100%,39%)]/10 border border-[hsl(168,100%,39%)]/30 p-3 rounded-xl text-center">
            <p className="text-sm text-[hsl(168,100%,39%)] font-medium flex items-center justify-center gap-2">
              <Check size={16} /> Plan accepted
              {existingPlan.mood && <span className="ml-2 text-lg">{existingPlan.mood}</span>}
            </p>
          </div>
          {(existingPlan.blocks as PlanBlock[]).map((block, i) => (
            <Card key={i} className="glass">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-primary">{block.title || block.type || "Block"}</CardTitle>
              </CardHeader>
              <CardContent>
                {block.items && block.items.map((item, idx) => <p key={idx} className="text-sm text-foreground">{item}</p>)}
                {block.tasks && block.tasks.map((task, idx) => <p key={idx} className="text-sm text-foreground">{task}</p>)}
                {block.task && <p className="text-sm text-foreground">{block.task}</p>}
                {block.startTime && <p className="text-xs text-primary mt-2">{block.startTime} — {block.duration}min</p>}
                {block.prompt && <p className="text-sm text-foreground italic">{block.prompt}</p>}
                {block.rationale && (
                  <p className="text-xs text-muted-foreground/70 italic mt-2">{block.rationale}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
