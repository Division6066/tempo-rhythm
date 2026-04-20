type Props = {
  size?: number;
  color?: string;
  className?: string;
};

/**
 * Wordmark — Tempo + Flow composite.
 * @source docs/design/claude-export/design-system/components.jsx:L106-L110
 */
export function Wordmark({ size = 22, color = "var(--color-foreground)", className }: Props) {
  return (
    <span
      className={className}
      style={{
        fontFamily: "var(--font-serif)",
        fontWeight: 500,
        fontSize: size,
        letterSpacing: "-0.02em",
        color,
        display: "inline-flex",
        alignItems: "baseline",
        gap: size * 0.18,
      }}
    >
      Tempo
      <em
        style={{
          fontStyle: "normal",
          fontFamily: "var(--font-sans)",
          fontWeight: 600,
        }}
      >
        Flow
      </em>
    </span>
  );
}
