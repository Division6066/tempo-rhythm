import type { ReactNode } from "react";
import { TempoShell } from "@/components/tempo/TempoShell";
import { AuthGate } from "@/components/auth/AuthGate";

export default function TempoGroupLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <AuthGate>
      <TempoShell>{children}</TempoShell>
    </AuthGate>
  );
}
