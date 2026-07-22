import { PageHeader } from "@/components/admin/PageHeader";
import { SettingsForm } from "@/components/admin/SettingsForm";

export default function SettingsPage() {
  return (
    <div>
      <PageHeader title="Settings" description="Notifications, working hours, and role permissions." />
      <div className="px-6 py-6 sm:px-10">
        <SettingsForm />
      </div>
    </div>
  );
}
