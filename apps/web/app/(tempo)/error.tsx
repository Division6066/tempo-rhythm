"use client";

import { useEffect } from "react";
import { SoftCard, Button } from "@tempo/ui/primitives";
import { AlertTriangle } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Tempo boundary caught error:", error);
  }, [error]);

  return (
    <div className="flex h-[60vh] w-full flex-col items-center justify-center p-6">
      <SoftCard className="max-w-md w-full flex flex-col items-center text-center gap-6 p-8">
        <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
          <AlertTriangle className="h-6 w-6 text-destructive" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-xl font-semibold tracking-tight">Something went out of sync</h2>
          <p className="text-muted-foreground text-sm">
            {error.message || "An unexpected error occurred while loading this view."}
          </p>
        </div>

        <div className="flex gap-3">
          <Button variant="soft" onClick={() => reset()}>
            Try again
          </Button>
          <Button variant="ghost" onClick={() => window.location.href = "/"}>
            Go home
          </Button>
        </div>
      </SoftCard>
    </div>
  );
}
