"use client";

import { useState } from "react";

export default function PaymentProofViewer({ orderNumber }: { orderNumber: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function view() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/orders/${orderNumber}/payment-proof-url`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not load the payment proof.");
      window.open(data.url, "_blank", "noopener,noreferrer");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load the payment proof.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button onClick={view} disabled={loading} className="text-gold text-sm underline disabled:opacity-50">
        {loading ? "Generating link…" : "View payment screenshot →"}
      </button>
      {error && <p className="text-xs text-garnet mt-1">{error}</p>}
      <p className="text-[11px] text-ivory/30 mt-1">Link expires in 5 minutes.</p>
    </div>
  );
}
