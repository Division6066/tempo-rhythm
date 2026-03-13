"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TaskCard from "@/components/TaskCard";
import { Filter, Plus, Trash2, X, Save } from "lucide-react";

type FilterCondition = {
  field: string;
  operator: string;
  value: string;
};

type SavedFilter = {
  _id: Id<"savedFilters">;
  name: string;
  conditions: FilterCondition[];
};

export default function FiltersPage() {
  const savedFilters = useQuery(api.savedFilters.list);
  const allTasks = useQuery(api.tasks.list, {});
  const createFilter = useMutation(api.savedFilters.create);
  const removeFilter = useMutation(api.savedFilters.remove);

  const [activeFilter, setActiveFilter] = useState<FilterCondition[]>([]);
  const [filterName, setFilterName] = useState("");
  const [showBuilder, setShowBuilder] = useState(false);

  const addCondition = () => {
    setActiveFilter([
      ...activeFilter,
      { field: "status", operator: "equals", value: "" },
    ]);
  };

  const updateCondition = (
    index: number,
    update: Partial<FilterCondition>
  ) => {
    const updated = [...activeFilter];
    updated[index] = { ...updated[index], ...update };
    setActiveFilter(updated);
  };

  const removeCondition = (index: number) => {
    setActiveFilter(activeFilter.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!filterName.trim() || activeFilter.length === 0) return;
    await createFilter({
      name: filterName,
      conditions: activeFilter,
    });
    setFilterName("");
    setShowBuilder(false);
  };

  const applyFilter = (conditions: FilterCondition[]) => {
    setActiveFilter(conditions);
    setShowBuilder(true);
  };

  const filteredTasks = (allTasks || []).filter((task) => {
    if (activeFilter.length === 0) return true;
    return activeFilter.every((condition) => {
      const taskValue = (task as Record<string, unknown>)[condition.field];
      const val = String(taskValue ?? "").toLowerCase();
      const condVal = condition.value.toLowerCase();
      switch (condition.operator) {
        case "equals":
          return val === condVal;
        case "not_equals":
          return val !== condVal;
        case "contains":
          return val.includes(condVal);
        case "not_contains":
          return !val.includes(condVal);
        default:
          return true;
      }
    });
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Filter className="text-primary h-8 w-8" />
            <h1 className="text-3xl font-bold text-foreground">Filters</h1>
          </div>
          <Button
            size="sm"
            className="gap-2"
            onClick={() => {
              setShowBuilder(true);
              setActiveFilter([]);
            }}
          >
            <Plus size={16} /> New Filter
          </Button>
        </div>

        {savedFilters && savedFilters.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Saved Filters
            </h2>
            <div className="flex flex-wrap gap-2">
              {(savedFilters as SavedFilter[]).map((filter) => (
                <div
                  key={filter._id}
                  className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2 group"
                >
                  <button
                    className="text-sm text-foreground hover:text-primary cursor-pointer transition-colors"
                    onClick={() => applyFilter(filter.conditions)}
                  >
                    {filter.name}
                  </button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 opacity-0 group-hover:opacity-100 text-destructive"
                    onClick={() => removeFilter({ id: filter._id })}
                  >
                    <Trash2 size={12} />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {showBuilder && (
          <Card className="glass border-primary/30">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">Filter Builder</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowBuilder(false)}
                >
                  <X size={18} />
                </Button>
              </div>

              {activeFilter.map((condition, i) => (
                <div key={i} className="flex items-center gap-2">
                  <select
                    value={condition.field}
                    onChange={(e) =>
                      updateCondition(i, { field: e.target.value })
                    }
                    className="h-9 rounded-lg border border-border bg-card px-2 text-sm"
                  >
                    <option value="status">Status</option>
                    <option value="priority">Priority</option>
                    <option value="title">Title</option>
                    <option value="tags">Tags</option>
                  </select>
                  <select
                    value={condition.operator}
                    onChange={(e) =>
                      updateCondition(i, { operator: e.target.value })
                    }
                    className="h-9 rounded-lg border border-border bg-card px-2 text-sm"
                  >
                    <option value="equals">equals</option>
                    <option value="not_equals">not equals</option>
                    <option value="contains">contains</option>
                    <option value="not_contains">not contains</option>
                  </select>
                  <Input
                    value={condition.value}
                    onChange={(e) =>
                      updateCondition(i, { value: e.target.value })
                    }
                    placeholder="Value"
                    className="bg-background border-border h-9 flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-destructive"
                    onClick={() => removeCondition(i)}
                  >
                    <X size={14} />
                  </Button>
                </div>
              ))}

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addCondition}
                  className="gap-1"
                >
                  <Plus size={14} /> Add Condition
                </Button>
              </div>

              {activeFilter.length > 0 && (
                <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                  <Input
                    value={filterName}
                    onChange={(e) => setFilterName(e.target.value)}
                    placeholder="Filter name"
                    className="bg-background border-border h-9 flex-1"
                  />
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={!filterName.trim()}
                    className="gap-1"
                  >
                    <Save size={14} /> Save
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="space-y-3">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {activeFilter.length > 0
              ? `Filtered Tasks (${filteredTasks.length})`
              : `All Tasks (${filteredTasks.length})`}
          </h2>
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No tasks match this filter.</p>
            </div>
          ) : (
            filteredTasks.map((task) => <TaskCard key={task._id} task={task} />)
          )}
        </div>
      </div>
    </AppLayout>
  );
}
