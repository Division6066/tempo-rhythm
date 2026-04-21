"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Pill, SoftCard } from "@tempo/ui/primitives";
import { ScreenHeader } from "@/components/tempo/ScreenHeader";
import { useDemoToast } from "@/components/tempo/DemoToast";

type Block = { id: string; type: "section" | "task" | "prompt"; content: string };

const INITIAL: Block[] = [
  { id: "b1", type: "section", content: "Morning" },
  { id: "b2", type: "task", content: "Meds + hydrate" },
  { id: "b3", type: "task", content: "Three intention lines" },
  { id: "b4", type: "section", content: "Focus block" },
  { id: "b5", type: "prompt", content: "What's the one thing?" },
];

/**
 * TemplateBuilderScreen — left canvas + right inspector. Bare (no shell).
 * @source docs/design/claude-export/design-system/screens-template-builder*.jsx
 */
export function TemplateBuilderScreen() {
  const router = useRouter();
  const toast = useDemoToast();
  const [blocks, setBlocks] = useState<Block[]>(INITIAL);
  const [selected, setSelected] = useState<string | null>("b2");
  const selectedBlock = blocks.find((b) => b.id === selected) ?? null;

  return (
    <div className="flex flex-col">
      <ScreenHeader
        eyebrow="Templates"
        title="Builder"
        lede="Drop blocks into a template. Slash commands let the AI fill in sections."
        right={
          <>
            <Button variant="ghost" size="sm" onClick={() => router.push("/templates")}>
              ← Templates
            </Button>
            {/*
             * @behavior: Persist the template and return to the gallery.
             * @convex-mutation-needed: templates.saveDraft
             */}
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                toast("Saved. (demo) templates.saveDraft.");
                router.push("/templates");
              }}
            >
              Save template
            </Button>
          </>
        }
      />

      <div className="grid gap-5 px-6 py-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <SoftCard tone="default" padding="md">
          <div className="mb-3 flex items-center justify-between">
            <div className="font-eyebrow">Canvas</div>
            <div className="flex gap-2">
              {(["section", "task", "prompt"] as const).map((t) => (
                /*
                 * @behavior: Add a new block of given type to the canvas.
                 * @convex-mutation-needed: templates.addBlock
                 */
                <Button
                  key={t}
                  variant="soft"
                  size="sm"
                  onClick={() => {
                    const block: Block = {
                      id: `b${Date.now()}`,
                      type: t,
                      content:
                        t === "section" ? "New section" : t === "task" ? "New task" : "Prompt?",
                    };
                    setBlocks((prev) => [...prev, block]);
                    setSelected(block.id);
                  }}
                >
                  + {t}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {blocks.map((block) => (
              /*
               * @behavior: Select a block to edit in the inspector.
               * @convex-query-needed: templates.blockById
               */
              <button
                key={block.id}
                type="button"
                onClick={() => setSelected(block.id)}
                className={[
                  "rounded-lg px-4 py-3 text-left transition-colors",
                  selected === block.id
                    ? "border border-primary bg-card"
                    : "border border-transparent bg-surface-sunken hover:bg-surface",
                  block.type === "section"
                    ? "font-serif text-h4"
                    : block.type === "prompt"
                      ? "italic"
                      : "",
                ].join(" ")}
              >
                <div className="flex items-center gap-2">
                  <Pill
                    tone={
                      block.type === "section"
                        ? "slate"
                        : block.type === "task"
                          ? "orange"
                          : "moss"
                    }
                  >
                    {block.type}
                  </Pill>
                  <span>{block.content}</span>
                </div>
              </button>
            ))}
          </div>
        </SoftCard>

        <div className="flex flex-col gap-5">
          <SoftCard tone="default" padding="md">
            <div className="font-eyebrow">Inspector</div>
            {selectedBlock ? (
              <>
                <div className="mt-3 flex flex-col gap-1 text-small">
                  <span className="font-eyebrow">Type</span>
                  <Pill tone="neutral">{selectedBlock.type}</Pill>
                </div>
                <label className="mt-3 flex flex-col gap-1 text-small">
                  <span className="font-eyebrow">Content</span>
                  <textarea
                    value={selectedBlock.content}
                    onChange={(e) => {
                      const v = e.target.value;
                      setBlocks((prev) =>
                        prev.map((b) =>
                          b.id === selectedBlock.id ? { ...b, content: v } : b,
                        ),
                      );
                    }}
                    rows={4}
                    className="rounded-lg border border-border-soft bg-surface-sunken p-3 text-body focus:border-primary focus:outline-none"
                    /*
                     * @behavior: Edit selected block content; debounce save.
                     * @convex-mutation-needed: templates.updateBlock
                     */
                  />
                </label>
                <div className="mt-3 flex gap-2">
                  {/*
                   * @behavior: Delete the selected block.
                   * @convex-mutation-needed: templates.deleteBlock
                   */}
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setBlocks((prev) => prev.filter((b) => b.id !== selectedBlock.id));
                      setSelected(null);
                      toast("Deleted. (demo) templates.deleteBlock.");
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </>
            ) : (
              <p className="mt-3 text-small text-muted-foreground">
                Pick a block on the canvas to edit.
              </p>
            )}
          </SoftCard>

          <SoftCard tone="sunken" padding="md">
            <div className="font-eyebrow mb-2">Slash commands</div>
            <ul className="flex flex-col gap-1 text-caption text-muted-foreground">
              <li>/section — add a heading block</li>
              <li>/task — add a task block</li>
              <li>/prompt — add a gentle prompt</li>
              <li>/ai fill — let coach draft a section</li>
            </ul>
          </SoftCard>
        </div>
      </div>
    </div>
  );
}
