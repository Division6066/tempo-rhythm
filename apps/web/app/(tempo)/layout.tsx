import type { ReactNode } from "react";
import { TempoShell } from "@/components/tempo/TempoShell";

export default function TempoGroupLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <TempoShell>{children}</TempoShell>;
}
