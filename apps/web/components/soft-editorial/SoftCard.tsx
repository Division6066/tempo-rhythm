import type React from "react";
import { cn } from "@/lib/utils";

type SoftCardProps = React.HTMLAttributes<HTMLDivElement>;

/**
 * Soft Editorial card: generous padding, subtle inner shadow (see globals `.grain-bg` on ancestors).
 */
export function SoftCard({ className, ...props }: SoftCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-black/10 bg-card p-8 text-card-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.65),inset_0_-2px_12px_rgba(0,0,0,0.06)] dark:border-white/10 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),inset_0_-2px_16px_rgba(0,0,0,0.35)]",
        className
      )}
      {...props}
    />
  );
}
