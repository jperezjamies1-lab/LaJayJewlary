import type { LucideIcon } from "lucide-react";
import { Gem } from "lucide-react";

export default function EmptyState({
  locale,
  title,
  description,
  icon: Icon = Gem,
}: {
  locale: "en" | "es";
  title: { en: string; es: string };
  description: { en: string; es: string };
  icon?: LucideIcon;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-4">
      <Icon size={28} className="text-gold/50 mb-4" />
      <h3 className="font-display text-2xl text-ivory mb-2">{title[locale]}</h3>
      <p className="text-ivory/50 max-w-sm text-sm">{description[locale]}</p>
    </div>
  );
}
