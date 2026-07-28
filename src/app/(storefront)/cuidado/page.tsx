import PolicyPage from "@/components/storefront/PolicyPage";
import { getSiteSettings } from "@/lib/settings";

export default async function CuidadoPage() {
  const settings = await getSiteSettings();
  return (
    <PolicyPage
      titleEs="Cuidado de Joyas"
      titleEn="Jewelry Care"
      contentEs={settings.policyCareEs}
      contentEn={settings.policyCareEn}
    />
  );
}
