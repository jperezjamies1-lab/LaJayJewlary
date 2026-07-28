"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STATUSES = ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"] as const;

export default function AdminOrderActions({
  orderNumber,
  status,
  paymentVerified,
  trackingNumber,
  notes: initialNotes,
}: {
  orderNumber: string;
  status: string;
  paymentVerified: boolean;
  trackingNumber: string | null;
  notes: string | null;
}) {
  const router = useRouter();
  const [tracking, setTracking] = useState(trackingNumber ?? "");
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function patch(data: Record<string, unknown>) {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/orders/${orderNumber}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? "Update failed");
      }
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-lg border border-white/10 p-5 space-y-5">
      <p className="eyebrow">Manage Order</p>

      {status === "PAYMENT_VERIFICATION" && !paymentVerified && (
        <div className="flex gap-2">
          <button
            onClick={() => patch({ paymentVerified: true })}
            disabled={saving}
            className="flex-1 rounded-md bg-gold text-onyx py-2.5 text-sm font-medium disabled:opacity-50"
          >
            Approve Payment → Confirm Order
          </button>
          <button
            onClick={() => {
              if (confirm("Reject this payment and cancel the order?")) {
                patch({ status: "CANCELLED", notes: notes || "Payment rejected by admin" });
              }
            }}
            disabled={saving}
            className="rounded-md border border-garnet text-garnet px-4 text-sm disabled:opacity-40"
          >
            Reject Payment
          </button>
        </div>
      )}

      <div>
        <label className="text-xs text-ivory/50 mb-1.5 block">Change Status</label>
        <select
          value={status}
          onChange={(e) => patch({ status: e.target.value })}
          disabled={saving}
          className="w-full rounded-md bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-ivory outline-none focus:ring-1 focus:ring-gold"
        >
          <option value="PENDING" disabled>Pending Payment</option>
          <option value="PAYMENT_VERIFICATION" disabled>Payment Under Review</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.replace("_", " ")}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs text-ivory/50 mb-1.5 block">Tracking Number</label>
        <div className="flex gap-2">
          <input
            value={tracking}
            onChange={(e) => setTracking(e.target.value)}
            placeholder="1Z999AA10123456784"
            className="flex-1 rounded-md bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-ivory font-mono outline-none focus:ring-1 focus:ring-gold"
          />
          <button
            onClick={() => patch({ trackingNumber: tracking, status: "SHIPPED" })}
            disabled={saving || !tracking}
            className="rounded-md border border-gold px-4 text-sm text-gold disabled:opacity-40"
          >
            Save & Mark Shipped
          </button>
        </div>
      </div>

      <div>
        <label className="text-xs text-ivory/50 mb-1.5 block">Internal Notes</label>
        <textarea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes visible only to admins…"
          className="w-full rounded-md bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-ivory outline-none focus:ring-1 focus:ring-gold"
        />
        <button
          onClick={() => patch({ notes })}
          disabled={saving}
          className="mt-2 rounded-md border border-white/15 px-4 py-1.5 text-xs text-ivory/60 hover:border-gold hover:text-gold disabled:opacity-40"
        >
          Save Notes
        </button>
      </div>

      {error && <p className="text-sm text-garnet">{error}</p>}
    </div>
  );
}
