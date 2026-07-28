"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";

interface LogEntry {
  id: string;
  action: string;
  entity: string | null;
  entityId: string | null;
  ipAddress: string | null;
  createdAt: string;
}

const CATEGORIES = [
  "LOGIN",
  "LOGOUT",
  "ADMIN",
  "PRODUCT",
  "ORDER",
  "INVENTORY",
  "CUSTOMER",
  "REVIEW",
  "AI",
  "SECURITY",
  "MEDIA_UPLOAD",
  "HOMEPAGE",
  "COUPON",
  "SETTINGS",
];

export default function LogsViewer({ initial }: { initial: LogEntry[] }) {
  const [logs, setLogs] = useState(initial);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = setTimeout(async () => {
      setLoading(true);
      const params = new URLSearchParams();
      if (query) params.set("q", query);
      if (category) params.set("category", category);
      const res = await fetch(`/api/admin/logs?${params}`);
      const data = await res.json();
      setLogs(data.logs ?? []);
      setLoading(false);
    }, 250);
    return () => clearTimeout(t);
  }, [query, category]);

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ivory/30" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search action, entity, IP…"
            className="w-full rounded-md bg-white/5 border border-white/10 pl-9 pr-3 py-2 text-sm text-ivory outline-none focus:ring-1 focus:ring-gold"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-md bg-white/5 border border-white/10 px-3 py-2 text-sm text-ivory outline-none focus:ring-1 focus:ring-gold"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-ivory/40 text-sm">Loading…</p>
      ) : logs.length === 0 ? (
        <div className="rounded-xl border border-white/10 py-16 text-center text-ivory/40 text-sm">
          No log entries match.
        </div>
      ) : (
        <div className="rounded-xl border border-white/10 overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-white/[0.03] text-ivory/40 text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-4 py-3 font-normal">Action</th>
                <th className="text-left px-4 py-3 font-normal">Entity</th>
                <th className="text-left px-4 py-3 font-normal">IP</th>
                <th className="text-left px-4 py-3 font-normal">Time</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id} className="border-t border-white/5">
                  <td className="px-4 py-3 font-mono text-xs text-gold">{l.action}</td>
                  <td className="px-4 py-3 text-ivory/60 text-xs">{l.entity ? `${l.entity}:${l.entityId?.slice(0, 8) ?? ""}` : "—"}</td>
                  <td className="px-4 py-3 text-ivory/40 text-xs">{l.ipAddress ?? "—"}</td>
                  <td className="px-4 py-3 text-ivory/40 text-xs">{new Date(l.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
