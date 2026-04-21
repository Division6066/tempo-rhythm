"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

/**
 * DemoToast — lightweight ephemeral message surface for placeholder actions.
 *
 * @behavior: Surface a "this is a demo" acknowledgement when a button that
 * *would* call a Convex mutation/action is pressed in demo mode. The real
 * backend-wire run replaces these toasts with actual mutation calls.
 */
type Toast = { id: number; message: string };

type ToastContextValue = {
  push: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function DemoToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((message: string) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2600);
  }, []);

  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex flex-col items-center gap-2 px-4"
        aria-live="polite"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto max-w-md rounded-full border border-border-soft bg-surface-inverse px-4 py-2 text-small text-cream shadow-whisper"
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

const NOOP = (_message: string): void => {
  // no-op outside provider
};

export function useDemoToast(): (message: string) => void {
  const ctx = useContext(ToastContext);
  return ctx ? ctx.push : NOOP;
}

/**
 * useDemoHandler — return a click handler that shows a canned "demo" toast
 * describing what would happen in real production. Use this to wire buttons
 * that will later call a Convex mutation/action.
 *
 * Example:
 *   const onComplete = useDemoHandler("This would mark the task complete (tasks.complete).");
 */
export function useDemoHandler(message: string): () => void {
  const push = useDemoToast();
  return useCallback(() => {
    push(message);
  }, [push, message]);
}

