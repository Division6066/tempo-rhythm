import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Helper for merging CSS / Tailwind class names.
// Combines clsx (conditional classes) with tailwind-merge (conflict resolution).
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
