import type { Metadata } from "next";
import { Cormorant, Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/storefront/AppShell";
import { SiteSettingsProvider } from "@/contexts/SiteSettingsContext";
import { getSiteSettings } from "@/lib/settings";

const cormorant = Cormorant({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: settings.seoTitle,
    description: settings.seoDescription,
    metadataBase: new URL("https://jaylajoyeria.com"),
    icons: {
      icon: [
        { url: "/favicon.ico" },
        { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
        { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      ],
      apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    },
    manifest: "/site.webmanifest",
    openGraph: {
      title: settings.storeName,
      description: settings.taglineEs,
      type: "website",
      locale: "es_MX",
      images: [{ url: "/branding/logo-header.png" }],
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: settings.storeName,
    url: "https://jaylajoyeria.com",
    logo: "https://jaylajoyeria.com/branding/logo-header.png",
    email: settings.email,
    telephone: settings.phone,
    brand: {
      "@type": "Brand",
      name: settings.storeName,
    },
  };

  return (
    <html lang="es-MX" className={`${cormorant.variable} ${inter.variable} ${plexMono.variable}`}>
      <head>
        <link rel="preload" as="image" href="/branding/logo-header.png" />
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
      <body className="font-body antialiased">
        <SiteSettingsProvider value={settings}>
          <AppShell>{children}</AppShell>
        </SiteSettingsProvider>
      </body>
    </html>
  );
}
