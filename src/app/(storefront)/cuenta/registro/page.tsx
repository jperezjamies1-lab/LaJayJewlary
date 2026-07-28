"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/storefront/Header";
import Footer from "@/components/storefront/Footer";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, language: "en" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Registration failed");
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
          <h1 className="font-display text-3xl text-ivory mb-8 text-center">Create Account</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-ivory/50 mb-1.5 block">Full Name</label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-md bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-ivory outline-none focus:ring-1 focus:ring-gold"
              />
            </div>
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
                minLength={8}
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
              {loading ? "Creating account…" : "Create Account"}
            </button>
          </form>
          <p className="text-center text-sm text-ivory/50 mt-6">
            Already have an account?{" "}
            <Link href="/cuenta/iniciar-sesion" className="text-gold">
              Sign in
            </Link>
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
}
