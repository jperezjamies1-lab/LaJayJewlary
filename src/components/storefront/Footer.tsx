"use client";

import Link from "next/link";
import Image from "next/image";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";

export default function Footer({ locale = "es" as "en" | "es" }) {
  const SITE = useSiteSettings();
  const t = {
    shop: locale === "en" ? "Shop" : "Tienda",
    help: locale === "en" ? "Help" : "Ayuda",
    about: locale === "en" ? "About" : "Nosotros",
    newsletter: locale === "en" ? "Join our newsletter" : "Únete a nuestro boletín",
    newsletterSub:
      locale === "en"
        ? "New arrivals, live shopping alerts, and VIP offers."
        : "Nuevos lanzamientos, alertas de live shopping y ofertas VIP.",
    rights: locale === "en" ? "All rights reserved." : "Todos los derechos reservados.",
  };

  return (
    <footer className="border-t border-white/10 bg-onyx2 text-ivory">
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-5">
          <div className="col-span-2">
            <Image
              src="/branding/logo-mark-small.png"
              alt="Logo oficial de Jay La Joyería"
              width={56}
              height={40}
              className="h-12 w-auto mb-3"
            />
            <p className="font-display text-2xl mb-3">
              Jay <span className="text-gold">La Joyería</span>
            </p>
            <p className="text-sm text-ivory/60 max-w-xs">{locale === "en" ? SITE.taglineEn : SITE.taglineEs}</p>
          </div>

          <div>
            <p className="eyebrow mb-4">{t.shop}</p>
            <ul className="space-y-2 text-sm text-ivory/70">
              <li><Link href="/coleccion/anillos">{locale === "en" ? "Rings" : "Anillos"}</Link></li>
              <li><Link href="/coleccion/collares">{locale === "en" ? "Necklaces" : "Collares"}</Link></li>
              <li><Link href="/coleccion/nuevo">{locale === "en" ? "New Arrivals" : "Nuevo"}</Link></li>
            </ul>
          </div>

          <div>
            <p className="eyebrow mb-4">{t.help}</p>
            <ul className="space-y-2 text-sm text-ivory/70">
              <li><Link href="/envios">{locale === "en" ? "Shipping" : "Envíos"}</Link></li>
              <li><Link href="/devoluciones">{locale === "en" ? "Returns" : "Devoluciones"}</Link></li>
              <li><Link href="/cuidado">{locale === "en" ? "Jewelry Care" : "Cuidado de Joyas"}</Link></li>
              <li><a href={`https://wa.me/${SITE.whatsapp.replace(/[^0-9]/g, "")}`}>WhatsApp</a></li>
            </ul>
          </div>

          <div>
            <p className="eyebrow mb-4">{t.about}</p>
            <ul className="space-y-2 text-sm text-ivory/70">
              <li>{SITE.phone}</li>
              <li>{SITE.email}</li>
              <li>{locale === "en" ? SITE.hoursEn : SITE.hoursEs}</li>
            </ul>
          </div>
        </div>

        <div className="mt-14 border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-ivory/40">
            © {new Date().getFullYear()} {SITE.storeName}. {t.rights}
          </p>
          <div className="flex gap-6 text-xs text-ivory/40">
            <Link href="/privacidad">{locale === "en" ? "Privacy" : "Privacidad"}</Link>
            <Link href="/terminos">{locale === "en" ? "Terms" : "Términos"}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
