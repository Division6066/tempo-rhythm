import MDEditor from "@uiw/react-md-editor";
import MDPreview from "@uiw/react-markdown-preview";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  height?: number;
  disabled?: boolean;
  preprocessValue?: (raw: string) => string;
}

export default function MarkdownEditor({
  value,
  onChange,
  height = 400,
  disabled = false,
  preprocessValue,
}: MarkdownEditorProps) {
  return (
    <div data-color-mode="dark" className="w-full">
      <MDEditor
        value={value}
        onChange={(val) => onChange(val ?? "")}
        preview="live"
        height={height}
        visibleDragbar={false}
        hideToolbar={disabled}
        textareaProps={{
          disabled,
          placeholder: "Start typing (Markdown supported, use #tags @mentions [[wiki links]])...",
        }}
        style={{ background: "transparent" }}
        components={{
          preview: (source) => {
            const processed = preprocessValue ? preprocessValue(source) : source;
            return <MDPreview source={processed} />;
          },
        }}
      />
    </div>
  );
}
