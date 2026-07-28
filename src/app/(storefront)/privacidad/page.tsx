import PolicyPage from "@/components/storefront/PolicyPage";
import { getSiteSettings } from "@/lib/settings";

export default async function PrivacidadPage() {
  const settings = await getSiteSettings();
  return (
    <PolicyPage
      titleEs="Privacidad"
      titleEn="Privacy"
      contentEs={settings.policyPrivacyEs}
      contentEn={settings.policyPrivacyEn}
    />
  );
}
