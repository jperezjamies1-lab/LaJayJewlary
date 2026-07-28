import PolicyPage from "@/components/storefront/PolicyPage";
import { getSiteSettings } from "@/lib/settings";

export default async function DevolucionesPage() {
  const settings = await getSiteSettings();
  return (
    <PolicyPage
      titleEs="Devoluciones"
      titleEn="Returns"
      contentEs={settings.policyReturnsEs}
      contentEn={settings.policyReturnsEn}
    />
  );
}
