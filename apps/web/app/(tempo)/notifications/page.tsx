import { NotificationsList } from "@/components/notifications-preferences/NotificationsList";

export default function Page() {
  return (
    <div data-testid="notifications-page" className="flex flex-col gap-6 p-6">
      <h2 className="text-lg font-medium">Notifications</h2>
      <NotificationsList />
    </div>
  );
}
