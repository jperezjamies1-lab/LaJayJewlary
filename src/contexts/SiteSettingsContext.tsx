"use client";

import { createContext, useContext } from "react";
import { DEFAULT_SETTINGS, type SiteSettings } from "@/lib/settings";

const SiteSettingsContext = createContext<SiteSettings>(DEFAULT_SETTINGS);

export function SiteSettingsProvider({
  value,
  children,
}: {
  value: SiteSettings;
  children: React.ReactNode;
}) {
  return <SiteSettingsContext.Provider value={value}>{children}</SiteSettingsContext.Provider>;
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}
