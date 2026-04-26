/**
 * Ring — circular progress indicator.
 * @source docs/design/claude-export/design-system/components.jsx (Ring / HabitRing pattern)
 */

type Props = {
  size?: number;
  stroke?: number;
  value: number;
  max?: number;
  color?: string;
  trackColor?: string;
  children?: React.ReactNode;
  className?: string;
};

export function Ring({
  size = 36,
  stroke = 3,
  value,
  max = 100,
  color = "var(--color-tempo-orange)",
  trackColor = "var(--color-border-soft)",
  children,
  className,
}: Props) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, value / max));
  return (
    <div
      className={className}
      style={{
        position: "relative",
        width: size,
        height: size,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <title>{`${value} of ${max}`}</title>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={trackColor}
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      {children ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: Math.max(10, size * 0.3),
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}
