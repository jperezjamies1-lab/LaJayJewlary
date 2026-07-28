"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Search, Heart, ShoppingBag, Menu, X } from "lucide-react";
import SearchOverlay from "@/components/storefront/SearchOverlay";

const NAV = [
  { label: { en: "New Arrivals", es: "Nuevo" }, href: "/coleccion/nuevo" },
  { label: { en: "Rings", es: "Anillos" }, href: "/coleccion/anillos" },
  { label: { en: "Necklaces", es: "Collares" }, href: "/coleccion/collares" },
  { label: { en: "Bracelets", es: "Pulseras" }, href: "/coleccion/pulseras" },
  { label: { en: "Live Shopping", es: "Live Shopping" }, href: "/live" },
];

export default function Header({ locale = "es" as "en" | "es" }) {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-onyx/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-8">
        <button
          className="md:hidden text-ivory"
          onClick={() => setOpen(!open)}
          aria-label={open ? (locale === "es" ? "Cerrar menú" : "Close menu") : (locale === "es" ? "Abrir menú" : "Open menu")}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>

        <Link
          href="/"
          aria-label="Jay La Joyería — home"
          className={`luxury-glow shrink-0 transition-all duration-700 ease-out ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
          }`}
        >
          <Image
            src="/branding/logo-header.png"
            alt="Logo oficial de Jay La Joyería"
            width={480}
            height={505}
            priority
            className="h-16 w-auto md:h-20"
          />
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="eyebrow text-ivory/80 hover:text-gold transition-colors"
            >
              {item.label[locale]}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4 text-ivory">
          <button aria-label={locale === "es" ? "Buscar" : "Search"} onClick={() => setSearchOpen(true)} className="hover:text-gold transition-colors">
            <Search size={20} />
          </button>
          <Link href="/cuenta/lista-deseos" aria-label={locale === "es" ? "Lista de deseos" : "Wishlist"} className="hover:text-gold transition-colors">
            <Heart size={20} />
          </Link>
          <Link href="/carrito" aria-label={locale === "es" ? "Carrito" : "Cart"} className="hover:text-gold transition-colors relative">
            <ShoppingBag size={20} />
          </Link>
          <button
            className="eyebrow hidden sm:inline text-ivory/60 hover:text-gold"
            onClick={async () => {
              const next = locale === "es" ? "en" : "es";
              await fetch("/api/locale", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ locale: next }),
              });
              window.location.reload();
            }}
          >
            {locale === "es" ? "EN" : "ES"}
          </button>
        </div>
      </div>

      {open && (
        <nav className="md:hidden flex flex-col gap-1 border-t border-white/10 px-4 py-4 bg-onyx">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="py-3 text-ivory/90 border-b border-white/5"
              onClick={() => setOpen(false)}
            >
              {item.label[locale]}
            </Link>
          ))}
        </nav>
      )}

      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
    </header>
  );
}
