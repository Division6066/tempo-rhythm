import { useId } from "react";
import { cn } from "@tempo-v0/lib/utils";

export function BrandMark({
  size = 28,
  className,
  tone = "accent",
}: {
  size?: number;
  className?: string;
  tone?: "accent" | "inverse";
}) {
  const gid = useId();
  const height = Math.round(size * (56 / 64));
  const stroke = tone === "inverse" ? "currentColor" : `url(#${gid})`;
  const fill = tone === "inverse" ? "currentColor" : `url(#${gid})`;
  return (
    <svg
      width={size}
      height={height}
      viewBox="0 0 64 56"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      {tone === "accent" ? (
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--tf-orange)" />
            <stop offset="100%" stopColor="var(--tf-soft-orange)" />
          </linearGradient>
        </defs>
      ) : null}
      <path d="M14 16 H50" stroke={stroke} strokeWidth="5" strokeLinecap="round" />
      <path d="M32 16 V46" stroke={stroke} strokeWidth="5" strokeLinecap="round" />
      <circle cx="42" cy="44" r="6" fill={fill} />
    </svg>
  );
}

export function Wordmark({ className, size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) {
  const type = size === "lg" ? "text-2xl" : size === "sm" ? "text-lg" : "text-xl";
  return (
    <span className={cn("font-display font-medium tracking-tight text-ink", type, className)}>
      Tempo
      <em className="font-sans not-italic font-semibold">Flow</em>
    </span>
  );
}
