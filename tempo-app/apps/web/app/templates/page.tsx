"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookTemplate, Plus, Trash2, Edit3, Copy, X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function TemplatesPage() {
  const templates = useQuery(api.templates.list);
  const seedBuiltIn = useMutation(api.templates.seedBuiltIn);
  const createTemplate = useMutation(api.templates.create);
  const removeTemplate = useMutation(api.templates.remove);
  const createNote = useMutation(api.notes.create);
  const router = useRouter();

  const [showForm, setShowForm] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editCategory, setEditCategory] = useState("");

  useEffect(() => {
    if (templates && templates.length === 0) {
      seedBuiltIn();
    }
  }, [templates, seedBuiltIn]);

  const handleCreate = async () => {
    if (!editName.trim()) return;
    await createTemplate({
      name: editName,
      description: editDescription,
      content: editContent,
      category: editCategory || undefined,
    });
    setShowForm(false);
    setEditName("");
    setEditDescription("");
    setEditContent("");
    setEditCategory("");
  };

  const handleApplyTemplate = async (template: { name: string; content: string }) => {
    const now = new Date();
    const dateStr = now.toISOString().split("T")[0];
    const content = template.content
      .replace(/\{\{date\}\}/g, dateStr)
      .replace(/\{\{title\}\}/g, template.name);
    const id = await createNote({
      title: `${template.name} - ${dateStr}`,
      content,
    });
    router.push(`/notes/${id}`);
  };

  if (!templates) {
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookTemplate className="text-primary h-8 w-8" />
            <h1 className="text-3xl font-bold text-foreground">Templates</h1>
          </div>
          <Button size="sm" className="gap-2" onClick={() => setShowForm(true)}>
            <Plus size={16} /> New Template
          </Button>
        </div>

        {showForm && (
          <Card className="glass border-primary/30">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Create Template</h3>
                <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}>
                  <X size={18} />
                </Button>
              </div>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Template name"
                className="bg-background border-border"
              />
              <Input
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Description (optional)"
                className="bg-background border-border"
              />
              <Input
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
                placeholder="Category (optional)"
                className="bg-background border-border"
              />
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="Template content (Markdown). Use {{date}} and {{title}} as placeholders."
                className="min-h-[200px] bg-background border-border font-mono text-sm"
              />
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={!editName.trim()}>
                  Create
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((tmpl) => (
            <Card key={tmpl._id} className="glass border-border/50 group">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{tmpl.name}</CardTitle>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-primary hover:bg-primary/20"
                      onClick={() => handleApplyTemplate(tmpl)}
                      title="Use template"
                    >
                      <Copy size={14} />
                    </Button>
                    {!tmpl.isBuiltIn && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:bg-destructive/20"
                        onClick={() => removeTemplate({ id: tmpl._id })}
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {tmpl.description && (
                  <p className="text-sm text-muted-foreground mb-2">
                    {tmpl.description}
                  </p>
                )}
                {tmpl.category && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                    {tmpl.category}
                  </span>
                )}
                {tmpl.isBuiltIn && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground ml-1">
                    Built-in
                  </span>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {templates.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No templates yet. Built-in templates are being loaded...
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
