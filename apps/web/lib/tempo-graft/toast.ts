function notify(message: string) {
  if (typeof window !== "undefined") {
    window.console.info("[tempo]", message);
  }
}

export const toast = Object.assign(
  (message: string) => {
    notify(message);
  },
  {
    success: (message: string) => notify(message),
    error: (message: string) => notify(message),
    message: (payload: string | { title?: string; description?: string }) => {
      if (typeof payload === "string") notify(payload);
      else notify([payload.title, payload.description].filter(Boolean).join(" — "));
    },
  },
);

export function Toaster(_props: { position?: string; richColors?: boolean }) {
  return null;
}
