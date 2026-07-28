import Header from "@/components/storefront/Header";
import Footer from "@/components/storefront/Footer";
import { getLocale } from "@/lib/locale";
import { getSiteSettings } from "@/lib/settings";

export default async function PolicyPage({
  titleEs,
  titleEn,
  contentEs,
  contentEn,
}: {
  titleEs: string;
  titleEn: string;
  contentEs: string;
  contentEn: string;
}) {
  const locale = getLocale();
  const content = locale === "es" ? contentEs : contentEn;
  const title = locale === "es" ? titleEs : titleEn;

  return (
    <>
      <Header locale={locale} />
      <div className="max-w-2xl mx-auto px-4 py-16">
        <h1 className="font-display text-4xl text-ivory mb-8 thread-underline inline-block">{title}</h1>
        {content ? (
          <div className="prose prose-invert prose-sm max-w-none text-ivory/70 whitespace-pre-wrap leading-relaxed">
            {content}
          </div>
        ) : (
          <p className="text-ivory/40 text-sm">
            {locale === "es"
              ? "Esta página está siendo preparada por nuestro equipo. Escríbenos si tienes preguntas mientras tanto."
              : "This page is being prepared by our team. Reach out if you have questions in the meantime."}
          </p>
        )}
      </div>
      <Footer locale={locale} />
    </>
  );
}

export async function getPolicySettings() {
  return getSiteSettings();
}
