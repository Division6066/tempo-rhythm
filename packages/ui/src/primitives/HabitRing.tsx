import { Ring } from "./Ring";

/**
 * HabitRing — weekly progress ring with day dots.
 * @source docs/design/claude-export/design-system/components.jsx (HabitRing pattern)
 */

type Props = {
  completed: number;
  total?: number;
  label?: string;
  size?: number;
};

export function HabitRing({ completed, total = 7, label, size = 44 }: Props) {
  return (
    <div className="flex flex-col items-center gap-1">
      <Ring size={size} value={completed} max={total}>
        <span className="font-tabular text-small text-foreground">
          {completed}
          <span className="text-muted-foreground">/{total}</span>
        </span>
      </Ring>
      {label ? <span className="text-caption text-muted-foreground">{label}</span> : null}
    </div>
  );
}
