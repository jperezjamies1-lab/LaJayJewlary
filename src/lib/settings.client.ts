/**
 * Client-safe settings shape. This file must NEVER import anything
 * server-only (Prisma, pg, fs, etc.) — it's imported directly by Client
 * Components (SiteSettingsContext, SettingsForm) and needs to be bundlable
 * for the browser with zero database coupling.
 *
 * Server-side reads/writes (getSiteSettings/updateSiteSettings, which do
 * touch the database) live in src/lib/settings.ts instead — that file is
 * only ever imported from Server Components and Route Handlers.
 */
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
