import React, { useCallback } from "react";
import { Editor, rootCtx, defaultValueCtx } from "@milkdown/core";
import { commonmark } from "@milkdown/preset-commonmark";
import { gfm } from "@milkdown/preset-gfm";
import { nord } from "@milkdown/theme-nord";
import { Milkdown, MilkdownProvider, useEditor } from "@milkdown/react";
import { listener, listenerCtx } from "@milkdown/kit/plugin/listener";
import "@milkdown/theme-nord/style.css";

interface MilkdownEditorInnerProps {
  defaultValue: string;
  onChange?: (markdown: string) => void;
}

function MilkdownEditorInner({ defaultValue, onChange }: MilkdownEditorInnerProps) {
  const editorCallback = useCallback(
    (root: HTMLElement) => {
      return Editor.make()
        .config(nord)
        .config((ctx) => {
          ctx.set(rootCtx, root);
          ctx.set(defaultValueCtx, defaultValue);
        })
        .use(commonmark)
        .use(gfm)
        .use(listener)
        .config((ctx) => {
          if (onChange) {
            ctx.get(listenerCtx).markdownUpdated((_ctx, markdown) => {
              onChange(markdown);
            });
          }
        });
    },
    [defaultValue, onChange]
  );

  useEditor(editorCallback);

  return <Milkdown />;
}

interface MilkdownEditorProps {
  defaultValue?: string;
  onChange?: (markdown: string) => void;
  className?: string;
}

export default function MilkdownEditorComponent({
  defaultValue = "",
  onChange,
  className,
}: MilkdownEditorProps) {
  return (
    <div className={className}>
      <MilkdownProvider>
        <MilkdownEditorInner defaultValue={defaultValue} onChange={onChange} />
      </MilkdownProvider>
    </div>
  );
}
