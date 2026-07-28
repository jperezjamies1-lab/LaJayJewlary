import { cookies } from "next/headers";

export const LOCALE_COOKIE = "jay_locale";
export type Locale = "es" | "en";

/** Spanish (Mexico) is the default and primary language across the site. */
export function getLocale(): Locale {
  const value = cookies().get(LOCALE_COOKIE)?.value;
  return value === "en" ? "en" : "es";
}
