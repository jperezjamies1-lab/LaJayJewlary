"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/storefront/Header";
import Footer from "@/components/storefront/Footer";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Login failed");
        return;
      }
      router.push("/cuenta");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header />
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm">
          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 blur-3xl bg-gold/15 rounded-full scale-150" />
              <Image
                src="/branding/logo-mark-transparent.png"
                alt="Logo oficial de Jay La Joyería"
                width={160}
                height={116}
                className="relative h-20 w-auto"
              />
            </div>
          </div>
          <h1 className="font-display text-3xl text-ivory mb-8 text-center">Sign In</h1>
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
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs text-ivory/50">Password</label>
                <Link href="/cuenta/olvide-password" className="text-xs text-gold">
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-ivory outline-none focus:ring-1 focus:ring-gold"
              />
            </div>
            {error && <p className="text-xs text-garnet">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-gold text-onyx py-2.5 text-sm font-medium disabled:opacity-50"
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>
          <p className="text-center text-sm text-ivory/50 mt-6">
            New here?{" "}
            <Link href="/cuenta/registro" className="text-gold">
              Create an account
            </Link>
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
}
