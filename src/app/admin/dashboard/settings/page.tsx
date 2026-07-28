import { getSiteSettings } from "@/lib/settings";
import SettingsForm from "@/components/admin/SettingsForm";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();
  return (
    <div>
      <h1 className="font-display text-3xl mb-6">Website Settings</h1>
      <SettingsForm initial={settings} />
    </div>
  );
}
