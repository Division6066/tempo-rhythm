import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// פונקציית עזר למיזוג מחלקות CSS/Tailwind
// משלבת את clsx (לניהול תנאים) ו-tailwind-merge (למניעת התנגשויות)
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
