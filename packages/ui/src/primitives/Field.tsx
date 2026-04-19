import type { InputHTMLAttributes, ReactNode } from "react";

/**
 * Field — labelled input with optional helper text + trailing slot.
 * @source docs/design/claude-export/design-system/components.jsx (Field pattern)
 */
export type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  helper?: string;
  error?: string;
  trailing?: ReactNode;
};

export function Field({
  label,
  helper,
  error,
  trailing,
  id,
  className = "",
  ...rest
}: FieldProps) {
  const fieldId = id ?? rest.name;
  return (
    <label className="flex w-full flex-col gap-1.5" htmlFor={fieldId}>
      {label ? (
        <span className="font-eyebrow text-muted-foreground">{label}</span>
      ) : null}
      <span
        className={[
          "flex items-center gap-2 rounded-lg border border-border bg-card px-3 h-10",
          "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1",
          error ? "border-destructive" : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <input
          id={fieldId}
          className="h-full w-full bg-transparent text-body text-foreground placeholder:text-subtle-foreground focus:outline-none"
          {...rest}
        />
        {trailing}
      </span>
      {helper && !error ? (
        <span className="text-caption text-muted-foreground">{helper}</span>
      ) : null}
      {error ? (
        <span className="text-caption text-destructive">{error}</span>
      ) : null}
    </label>
  );
}
