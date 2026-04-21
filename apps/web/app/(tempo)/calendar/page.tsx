import { CalendarScreen } from "@/components/tempo/screens/CalendarScreen";

/**
 * @screen: calendar
 * @category: Library
 * @owner: cursor-cloud-1
 * @prd: PRD §4 Screen 8, §4 Screen 9, §4 Screen 10
 * @source: docs/design/claude-export/design-system/screens-3.jsx (ScreenCalendar)
 * @summary: Day / week / month calendar with scheduled + unscheduled intake lanes.
 * @queries:
 *   - calendar.listRange
 *   - calendar.listForDate
 * @mutations:
 *   - calendar.createEvent
 *   - calendar.updateEvent
 *   - calendar.scheduleFromIntake
 * @providers:
 *   - google-calendar / apple-calendar (Integrations page)
 * @auth: required
 */
export default function CalendarPage() {
  return <CalendarScreen />;
}
