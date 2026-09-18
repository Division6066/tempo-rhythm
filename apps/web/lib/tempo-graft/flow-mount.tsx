"use client";

import { Chrome } from "@tempo-v0/components/tempo/chrome";
import type { ReactNode } from "react";

export function FlowMount({ children }: { children: ReactNode }) {
  return (
    <div className="tf-v0">
      <Chrome>{children}</Chrome>
    </div>
  );
}
