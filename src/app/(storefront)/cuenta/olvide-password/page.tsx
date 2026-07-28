"use client";

import { useState } from "react";
import Header from "@/components/storefront/Header";
import Footer from "@/components/storefront/Footer";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, language: "en" }),
      });
      setSent(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header />
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm">
          <h1 className="font-display text-3xl text-ivory mb-4 text-center">Reset Password</h1>
          {sent ? (
            <p className="text-sm text-ivory/60 text-center">
              If an account exists for that email, we've sent a reset link.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-sm text-ivory/50 text-center mb-2">
                Enter your email and we'll send you a reset link.
              </p>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-md bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-ivory outline-none focus:ring-1 focus:ring-gold"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-md bg-gold text-onyx py-2.5 text-sm font-medium disabled:opacity-50"
              >
                {loading ? "Sending…" : "Send Reset Link"}
              </button>
            </form>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
