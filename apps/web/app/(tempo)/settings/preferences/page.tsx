import { PreferencesForm } from "@/components/notifications-preferences/PreferencesForm";

export default function Page() {
  return (
    <div data-testid="settings-preferences" className="flex flex-col gap-6 p-6">
      <h2 className="text-lg font-medium">Preferences</h2>
      <PreferencesForm />
    </div>
  );
}
