import type { ButtonHTMLAttributes, ReactNode } from "react";

/**
 * Button — Tempo Flow button with variants + sizes.
 *
 * @source docs/design/claude-export/design-system/components.jsx (Button pattern)
 *
 * Variants:
 *   - primary  : orange gradient fill (call-to-action)
 *   - soft     : cream-raised fill, ink text (secondary)
 *   - ghost    : transparent, text-only
 *   - subtle   : surface-sunken, muted text
 *   - inverse  : ink fill, cream text
 *   - destructive : brick fill
 */
export type ButtonVariant = "primary" | "soft" | "ghost" | "subtle" | "inverse" | "destructive";
export type ButtonSize = "sm" | "md" | "lg";

const variantMap: Record<ButtonVariant, string> = {
  primary: "bg-primary text-primary-foreground hover:brightness-105 active:brightness-95",
  soft: "bg-card text-foreground border border-border hover:bg-surface-sunken",
  ghost: "bg-transparent text-foreground hover:bg-surface-sunken",
  subtle: "bg-surface-sunken text-muted-foreground hover:text-foreground",
  inverse: "bg-surface-inverse text-cream hover:brightness-110",
  destructive: "bg-destructive text-destructive-foreground hover:brightness-105",
};

const sizeMap: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-small rounded-md gap-1.5",
  md: "h-10 px-4 text-body rounded-lg gap-2",
  lg: "h-12 px-6 text-body rounded-lg gap-2",
};

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
};

export function Button({
  variant = "primary",
  size = "md",
  leadingIcon,
  trailingIcon,
  className = "",
  children,
  type = "button",
  ...rest
}: ButtonProps) {
  const classes = [
    "inline-flex items-center justify-center font-medium transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
    variantMap[variant],
    sizeMap[size],
    className,
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <button type={type} className={classes} {...rest}>
      {leadingIcon}
      {children}
      {trailingIcon}
    </button>
  );
}
