"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/storefront/Header";
import Footer from "@/components/storefront/Footer";

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Reset failed");
        return;
      }
      router.push("/cuenta/iniciar-sesion");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <>
        <Header />
        <div className="min-h-[70vh] flex items-center justify-center px-4">
          <p className="text-ivory/60 text-sm">This reset link is missing a token.</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm">
          <h1 className="font-display text-3xl text-ivory mb-8 text-center">New Password</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New password"
              className="w-full rounded-md bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-ivory outline-none focus:ring-1 focus:ring-gold"
            />
            {error && <p className="text-xs text-garnet">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-gold text-onyx py-2.5 text-sm font-medium disabled:opacity-50"
            >
              {loading ? "Saving…" : "Save New Password"}
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
}
