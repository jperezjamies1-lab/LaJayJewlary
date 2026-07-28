import PolicyPage from "@/components/storefront/PolicyPage";
import { getSiteSettings } from "@/lib/settings";

export default async function TerminosPage() {
  const settings = await getSiteSettings();
  return (
    <PolicyPage
      titleEs="Términos"
      titleEn="Terms"
      contentEs={settings.policyTermsEs}
      contentEn={settings.policyTermsEn}
    />
  );
}
