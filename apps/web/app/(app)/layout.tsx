import type { ReactNode } from "react";

export default function AppShellLayout({ children }: { children: ReactNode }) {
  return <div className="grain-bg min-h-[calc(100vh-8rem)]">{children}</div>;
}
