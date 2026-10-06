import { DeleteAccountCard } from "@/components/account/DeleteAccountCard";
import { ProfileForm } from "@/components/account/ProfileForm";

export default function Page() {
  return (
    <div data-testid="settings-profile" className="flex flex-col gap-6 p-6">
      <h2 className="text-lg font-medium">Profile</h2>
      <ProfileForm />
      <DeleteAccountCard />
    </div>
  );
}
