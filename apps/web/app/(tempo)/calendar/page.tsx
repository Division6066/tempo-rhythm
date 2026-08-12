import { CalendarViews } from "@/components/calendar/CalendarViews";

export default function Page() {
  const eventSourceMode =
    process.env.NODE_ENV !== "production" && process.env.TEMPO_E2E_PUBLIC_CALENDAR === "1"
      ? "local"
      : "convex";

  return <CalendarViews eventSourceMode={eventSourceMode} />;
}
