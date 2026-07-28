import PolicyPage from "@/components/storefront/PolicyPage";
import { getSiteSettings } from "@/lib/settings";

export default async function EnviosPage() {
  const settings = await getSiteSettings();
  return (
    <PolicyPage
      titleEs="Envíos"
      titleEn="Shipping"
      contentEs={settings.policyShippingEs}
      contentEn={settings.policyShippingEn}
    />
  );
}
