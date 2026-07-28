import Image from "next/image";
import Header from "@/components/storefront/Header";
import Footer from "@/components/storefront/Footer";
import ProductCard from "@/components/storefront/ProductCard";
import AiConciergeWidget from "@/components/ai/AiConciergeWidget";
import EmptyState from "@/components/storefront/EmptyState";
import { prisma } from "@/lib/db";
import { serializeProduct } from "@/lib/serializers";
import { getUpcomingLiveEvent } from "@/lib/queries/live";
import { getSiteSettings } from "@/lib/settings";
import { getLocale } from "@/lib/locale";

export const revalidate = 60; // homepage re-reads the DB at most once a minute

export default async function HomePage() {
  const locale = getLocale();

  const [featuredRaw, nextLive, settings] = await Promise.all([
    prisma.product.findMany({
      where: { status: "ACTIVE", featured: true },
      include: { images: true, collection: true },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    getUpcomingLiveEvent(),
    getSiteSettings(),
  ]);

  const featured = featuredRaw.map(serializeProduct);

  return (
    <>
      <Header locale={locale} />

      {/* HERO — real content only. No stock photography, no unconfigured claims.
          If the owner has set a hero image in admin settings, it renders here;
          otherwise this is a clean brand moment built from the real logo. */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden bg-onyx">
        {settings.heroImageUrl ? (
          <>
            <div
              className="absolute inset-0 bg-cover bg-center opacity-60"
              style={{ backgroundImage: `url('${settings.heroImageUrl}')` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-onyx via-onyx/50 to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-onyx2 to-onyx" />
        )}

        <div className="relative z-10 mx-auto w-full max-w-2xl px-4 py-24 text-center md:px-8">
          <Image
            src="/branding/logo-mark-transparent.png"
            alt="Logo oficial de Jay La Joyería"
            width={280}
            height={202}
            priority
            className="h-32 w-auto mx-auto mb-8"
          />
          <p className="eyebrow mb-4">
            {locale === "es" ? settings.taglineEs : settings.taglineEn}
          </p>
          <a
            href="/coleccion/nuevo"
            className="mt-4 inline-block border border-gold px-8 py-3 eyebrow text-gold hover:bg-gold hover:text-onyx transition-colors"
          >
            {locale === "es" ? "Ver Colección" : "Shop Collection"}
          </a>
        </div>
      </section>

      {/* TRUST BAR — only real, admin-configured facts (hours, contact) */}
      <section className="border-y border-white/10 bg-onyx2">
        <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 flex flex-wrap justify-center gap-x-12 gap-y-3 text-xs text-ivory/50 eyebrow">
          <span>{locale === "es" ? "Pago Seguro" : "Secure Checkout"}</span>
          <span>{locale === "es" ? settings.hoursEs : settings.hoursEn}</span>
          <span>{settings.phone}</span>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="mx-auto max-w-7xl px-4 py-20 md:px-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="eyebrow mb-2">{locale === "es" ? "Destacados" : "Featured"}</p>
            <h2 className="font-display text-3xl md:text-4xl text-ivory thread-underline">
              {locale === "es" ? "Piezas Seleccionadas" : "Selected Pieces"}
            </h2>
          </div>
          <a href="/coleccion/nuevo" className="eyebrow text-gold hidden md:inline hover:opacity-70">
            {locale === "es" ? "Ver Todo →" : "View All →"}
          </a>
        </div>

        {featured.length === 0 ? (
          <EmptyState
            locale={locale}
            title={{ en: "New arrivals are on the way", es: "Nuevas piezas están en camino" }}
            description={{
              en: "We're adding pieces to the collection right now — check back shortly.",
              es: "Estamos agregando piezas a la colección ahora mismo — vuelve pronto.",
            }}
          />
        ) : (
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} locale={locale} />
            ))}
          </div>
        )}
      </section>

      {/* LIVE SHOPPING TEASER — only renders when an event is actually scheduled */}
      {nextLive && (
        <section className="mx-auto max-w-7xl px-4 pb-20 md:px-8">
          <div className="rounded-lg border border-gold/30 bg-gradient-to-r from-onyx2 to-onyx px-8 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <p className="eyebrow mb-2 text-pink">Live Shopping</p>
              <h3 className="font-display text-3xl text-ivory">{nextLive.title}</h3>
              <p className="text-ivory/60 mt-2 max-w-md">
                {locale === "es"
                  ? `En vivo el ${new Date(nextLive.scheduledAt).toLocaleString("es-MX")}. Depósito: $${nextLive.depositAmount}.`
                  : `Live on ${new Date(nextLive.scheduledAt).toLocaleString("en-US")}. Deposit: $${nextLive.depositAmount}.`}
              </p>
            </div>
            <a
              href="/live"
              className="shrink-0 border border-gold px-8 py-3 eyebrow text-gold hover:bg-gold hover:text-onyx transition-colors"
            >
              {locale === "es" ? "Ver Horario" : "See Schedule"}
            </a>
          </div>
        </section>
      )}

      <Footer locale={locale} />
      <AiConciergeWidget locale={locale} />
    </>
  );
}
