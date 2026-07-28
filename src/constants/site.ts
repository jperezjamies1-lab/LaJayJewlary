// Central site configuration. In production this is loaded from the
// `Setting` table so admin edits propagate everywhere automatically
// (Part 4: "Admin changes Phone Number -> Homepage/Checkout/Footer/AI update").
export const SITE = {
  name: "Jay La Joyería",
  tagline: {
    en: "Fine jewelry, personally curated.",
    es: "Joyería fina, curada personalmente.",
  },
  phone: "512-789-2632",
  whatsapp: "+15127892632",
  email: "hello@jaylajoyeria.com",
  hours: {
    en: "Mon–Sat, 10am–6pm CST",
    es: "Lun–Sáb, 10am–6pm CST",
  },
  social: {
    instagram: "https://instagram.com/jaylajoyeria",
    tiktok: "https://tiktok.com/@jaylajoyeria",
  },
  payment: {
    zelle: "512-789-2632",
  },
} as const;

export const SUPPORTED_LOCALES = ["en", "es"] as const;
