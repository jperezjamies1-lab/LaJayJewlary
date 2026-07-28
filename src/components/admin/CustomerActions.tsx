"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CustomerActions({
  customerId,
  vipStatus,
  blocked,
}: {
  customerId: string;
  vipStatus: boolean;
  blocked: boolean;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  async function patch(data: Record<string, unknown>) {
    setSaving(true);
    await fetch(`/api/admin/customers/${customerId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    router.refresh();
    setSaving(false);
  }

  return (
    <div className="rounded-lg border border-white/10 p-5 flex gap-3">
      <button
        onClick={() => patch({ vipStatus: !vipStatus })}
        disabled={saving}
        className={`rounded-md px-4 py-2 text-sm border ${
          vipStatus ? "border-gold text-gold" : "border-white/10 text-ivory/60"
        }`}
      >
        {vipStatus ? "★ VIP Customer" : "Mark as VIP"}
      </button>
      <button
        onClick={() => patch({ blocked: !blocked })}
        disabled={saving}
        className={`rounded-md px-4 py-2 text-sm border ${
          blocked ? "border-garnet text-garnet" : "border-white/10 text-ivory/60"
        }`}
      >
        {blocked ? "Unblock Customer" : "Block Customer"}
      </button>
    </div>
  );
}
