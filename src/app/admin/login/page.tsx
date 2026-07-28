"use client";

import { useState } from "react";
import Image from "next/image";

export const metadata_note = "robots handled in a server layout in production";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, remember }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Invalid email or password.");
        return;
      }
      window.location.href = "/admin/dashboard";
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-onyx flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-2">
            <div className="absolute inset-0 blur-3xl bg-gold/20 rounded-full scale-150" />
            <Image
              src="/branding/logo-mark-transparent.png"
              alt="Logo oficial de Jay La Joyería"
              width={200}
              height={145}
              priority
              className="relative h-24 w-auto"
            />
          </div>
          <p className="eyebrow mt-2">Admin</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-ivory/50 mb-1.5 block">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-ivory outline-none focus:ring-1 focus:ring-gold"
            />
          </div>
          <div>
            <label className="text-xs text-ivory/50 mb-1.5 block">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-ivory outline-none focus:ring-1 focus:ring-gold"
            />
          </div>

          <label className="flex items-center gap-2 text-xs text-ivory/50">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="accent-gold"
            />
            Remember this device
          </label>

          {error && <p className="text-xs text-garnet">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-gold text-onyx py-2.5 text-sm font-medium disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p className="text-center text-[11px] text-ivory/30 mt-6">
          Protected by rate limiting, CAPTCHA, and 2FA when enabled.
        </p>
      </div>
    </div>
  );
}
