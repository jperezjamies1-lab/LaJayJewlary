import Header from "@/components/storefront/Header";
import Footer from "@/components/storefront/Footer";
import EmptyState from "@/components/storefront/EmptyState";
import { prisma } from "@/lib/db";
import { getLocale } from "@/lib/locale";

export default async function LivePage() {
  const locale = getLocale();

  const events = await prisma.liveShoppingEvent.findMany({
    where: { scheduledAt: { gte: new Date() } },
    orderBy: { scheduledAt: "asc" },
  });

  return (
    <>
      <Header locale={locale} />
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="font-display text-4xl text-ivory mb-3 thread-underline inline-block">Live Shopping</h1>
        <p className="text-ivory/50 text-sm mb-10">
          {locale === "es"
            ? "Reserva piezas en vivo, deja tu depósito y accede a lanzamientos exclusivos."
            : "Claim pieces live, place your deposit, and access exclusive drops."}
        </p>

        {events.length === 0 ? (
          <EmptyState
            locale={locale}
            title={{ en: "No live events scheduled", es: "No hay eventos en vivo programados" }}
            description={{
              en: "Check back soon, or follow our social channels for announcements.",
              es: "Vuelve pronto, o síguenos en redes sociales para conocer los anuncios.",
            }}
          />
        ) : (
          <div className="space-y-4">
            {events.map((event) => (
              <div key={event.id} className="rounded-lg border border-gold/30 p-6">
                <p className="eyebrow mb-2 text-pink">
                  {new Date(event.scheduledAt).toLocaleString(locale === "es" ? "es-MX" : "en-US", {
                    dateStyle: "full",
                    timeStyle: "short",
                  })}
                </p>
                <h2 className="font-display text-2xl text-ivory mb-2">{event.title}</h2>
                <p className="text-sm text-ivory/60 mb-3">
                  {locale === "es" ? "Depósito" : "Deposit"}: ${Number(event.depositAmount)}
                </p>
                {event.rules && <p className="text-sm text-ivory/50 whitespace-pre-wrap">{event.rules}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer locale={locale} />
    </>
  );
}
