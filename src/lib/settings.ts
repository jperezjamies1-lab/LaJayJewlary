import { prisma } from "@/lib/db";

export interface SiteSettings {
  storeName: string;
  phone: string;
  whatsapp: string;
  email: string;
  zelleNumber: string;
  hoursEn: string;
  hoursEs: string;
  instagram: string;
  tiktok: string;
  currency: string;
  taglineEn: string;
  taglineEs: string;
  heroImageUrl: string | null;
  shippingPrice: number;
  freeShippingThreshold: number;
  seoTitle: string;
  seoDescription: string;
  policyShippingEs: string;
  policyShippingEn: string;
  policyReturnsEs: string;
  policyReturnsEn: string;
  policyPrivacyEs: string;
  policyPrivacyEn: string;
  policyTermsEs: string;
  policyTermsEn: string;
  policyCareEs: string;
  policyCareEn: string;
}

export const DEFAULT_SETTINGS: SiteSettings = {
  storeName: "Jay La Joyería",
  phone: "512-789-2632",
  whatsapp: "+15127892632",
  email: "hello@jaylajoyeria.com",
  zelleNumber: "512-789-2632",
  hoursEn: "Mon–Sat, 10am–6pm CST",
  hoursEs: "Lun–Sáb, 10am–6pm CST",
  instagram: "https://instagram.com/jaylajoyeria",
  tiktok: "https://tiktok.com/@jaylajoyeria",
  currency: "USD",
  taglineEn: "Fine jewelry, personally curated.",
  taglineEs: "Joyería fina, curada personalmente.",
  heroImageUrl: null,
  shippingPrice: 15,
  freeShippingThreshold: 200,
  seoTitle: "Jay La Joyería | Joyería Fina",
  seoDescription: "Joyería fina, curada personalmente. Anillos, collares, pulseras y más.",
  policyShippingEs: "",
  policyShippingEn: "",
  policyReturnsEs: "",
  policyReturnsEn: "",
  policyPrivacyEs: "",
  policyPrivacyEn: "",
  policyTermsEs: "",
  policyTermsEn: "",
  policyCareEs: "",
  policyCareEn: "",
};

const SETTINGS_KEY = "site";

/**
 * Reads settings from the database, falling back to defaults for any key
 * not yet set. This is what Header/Footer/checkout/emails/AI/metadata all
 * read from now instead of a hardcoded constant — an admin edit here
 * propagates everywhere on the next request (revalidated via the cache tag
 * below whenever /api/admin/settings writes).
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const row = await prisma.setting.findUnique({ where: { key: SETTINGS_KEY } });
    if (!row) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...(row.value as Partial<SiteSettings>) };
  } catch (err) {
    // DB not reachable at build/prerender time — fall back to defaults
    // rather than failing the page.
    console.error("getSiteSettings fallback:", err);
    return DEFAULT_SETTINGS;
  }
}

export async function updateSiteSettings(patch: Partial<SiteSettings>): Promise<SiteSettings> {
  const current = await getSiteSettings();
  const next = { ...current, ...patch };
  await prisma.setting.upsert({
    where: { key: SETTINGS_KEY },
    update: { value: next },
    create: { key: SETTINGS_KEY, value: next },
  });
  return next;
}
