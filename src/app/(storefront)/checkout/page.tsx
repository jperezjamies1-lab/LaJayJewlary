"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/storefront/Header";
import Footer from "@/components/storefront/Footer";

export default function CheckoutPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    guestEmail: "",
    guestName: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    zip: "",
    country: "United States",
    couponCode: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestEmail: form.guestEmail || undefined,
          guestName: form.guestName || undefined,
          shippingAddress: {
            line1: form.line1,
            line2: form.line2 || undefined,
            city: form.city,
            state: form.state,
            zip: form.zip,
            country: form.country,
          },
          couponCode: form.couponCode || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Checkout failed");
        return;
      }
      router.push(`/pedido-confirmado/${data.order.orderNumber}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header />
      <div className="max-w-lg mx-auto px-4 py-16">
        <h1 className="font-display text-3xl text-ivory mb-8">Checkout</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <p className="eyebrow mb-3">Contact</p>
            <div className="grid grid-cols-2 gap-3">
              <input
                required
                placeholder="Full name"
                value={form.guestName}
                onChange={(e) => update("guestName", e.target.value)}
                className="rounded-md bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-ivory outline-none focus:ring-1 focus:ring-gold"
              />
              <input
                required
                type="email"
                placeholder="Email"
                value={form.guestEmail}
                onChange={(e) => update("guestEmail", e.target.value)}
                className="rounded-md bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-ivory outline-none focus:ring-1 focus:ring-gold"
              />
            </div>
          </div>

          <div>
            <p className="eyebrow mb-3">Shipping Address</p>
            <div className="space-y-3">
              <input
                required
                placeholder="Address line 1"
                value={form.line1}
                onChange={(e) => update("line1", e.target.value)}
                className="w-full rounded-md bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-ivory outline-none focus:ring-1 focus:ring-gold"
              />
              <input
                placeholder="Address line 2 (optional)"
                value={form.line2}
                onChange={(e) => update("line2", e.target.value)}
                className="w-full rounded-md bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-ivory outline-none focus:ring-1 focus:ring-gold"
              />
              <div className="grid grid-cols-3 gap-3">
                <input
                  required
                  placeholder="City"
                  value={form.city}
                  onChange={(e) => update("city", e.target.value)}
                  className="rounded-md bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-ivory outline-none focus:ring-1 focus:ring-gold"
                />
                <input
                  required
                  placeholder="State"
                  value={form.state}
                  onChange={(e) => update("state", e.target.value)}
                  className="rounded-md bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-ivory outline-none focus:ring-1 focus:ring-gold"
                />
                <input
                  required
                  placeholder="ZIP"
                  value={form.zip}
                  onChange={(e) => update("zip", e.target.value)}
                  className="rounded-md bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-ivory outline-none focus:ring-1 focus:ring-gold"
                />
              </div>
            </div>
          </div>

          <div>
            <p className="eyebrow mb-3">Coupon (optional)</p>
            <input
              placeholder="Coupon code"
              value={form.couponCode}
              onChange={(e) => update("couponCode", e.target.value)}
              className="w-full rounded-md bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-ivory font-mono outline-none focus:ring-1 focus:ring-gold"
            />
          </div>

          <div className="rounded-md border border-gold/30 bg-gold/5 p-4 text-xs text-ivory/60">
            Payment is completed via Zelle after you place your order. You'll receive instructions
            and can upload your payment confirmation from your account.
          </div>

          {error && <p className="text-sm text-garnet">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-gold text-onyx py-3 text-sm font-medium disabled:opacity-50"
          >
            {loading ? "Placing order…" : "Place Order"}
          </button>
        </form>
      </div>
      <Footer />
    </>
  );
}
