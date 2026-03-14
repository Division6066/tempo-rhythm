import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ConvexAuthProvider as ConvexAuthProviderBase } from "@convex-dev/auth/react";
import { ReactNode } from "react";
import { convex } from "@/lib/convex";

export function ConvexAuthWrapper({ children }: { children: ReactNode }) {
  if (!convex) {
    return <>{children}</>;
  }

  return (
    <ConvexAuthProviderBase client={convex}>
      {children}
    </ConvexAuthProviderBase>
  );
}
