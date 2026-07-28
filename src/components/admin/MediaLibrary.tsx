"use client";

import { useEffect, useState, useRef } from "react";
import { Search, Upload, Trash2, Pencil, Check, X } from "lucide-react";

interface Asset {
  id: string;
  url: string;
  type: "IMAGE" | "VIDEO" | "PDF";
  altText: string | null;
  folder: string | null;
  createdAt: string;
}

const FOLDERS = ["Products", "Collections", "Homepage", "Reviews", "Videos", "Banners", "Live Shopping"];

export default function MediaLibrary() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [query, setQuery] = useState("");
  const [folder, setFolder] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function load() {
    setLoading(true);
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (folder) params.set("folder", folder);
    const res = await fetch(`/api/media?${params}`);
    const data = await res.json();
    setAssets(data.assets ?? []);
    setLoading(false);
  }

  useEffect(() => {
    const t = setTimeout(load, 200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, folder]);

  async function handleUpload(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder || "Uploads");
      await fetch("/api/media/upload", { method: "POST", body: formData });
    }
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
    load();
  }

  async function rename(id: string) {
    await fetch(`/api/media/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ altText: editValue }),
    });
    setEditingId(null);
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this file? This cannot be undone.")) return;
    await fetch(`/api/media/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ivory/30" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search files…"
            className="w-full rounded-md bg-white/5 border border-white/10 pl-9 pr-3 py-2 text-sm text-ivory outline-none focus:ring-1 focus:ring-gold"
          />
        </div>
        <select
          value={folder}
          onChange={(e) => setFolder(e.target.value)}
          className="rounded-md bg-white/5 border border-white/10 px-3 py-2 text-sm text-ivory outline-none focus:ring-1 focus:ring-gold"
        >
          <option value="">All Folders</option>
          {FOLDERS.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
        <label className="flex items-center gap-2 rounded-md bg-gold text-onyx px-4 py-2 text-sm font-medium cursor-pointer">
          <Upload size={15} /> {uploading ? "Uploading…" : "Upload"}
          <input ref={inputRef} type="file" multiple accept="image/*,video/mp4,application/pdf" className="hidden" onChange={(e) => handleUpload(e.target.files)} disabled={uploading} />
        </label>
      </div>

      {loading ? (
        <p className="text-ivory/40 text-sm">Loading…</p>
      ) : assets.length === 0 ? (
        <div className="rounded-xl border border-white/10 py-16 text-center text-ivory/40 text-sm">
          No media files yet.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {assets.map((a) => (
            <div key={a.id} className="rounded-md border border-white/10 overflow-hidden group relative">
              <div className="aspect-square bg-onyx2">
                {a.type === "IMAGE" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={a.url} alt={a.altText ?? ""} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-ivory/30 text-xs">{a.type}</div>
                )}
              </div>
              <div className="p-2 bg-onyx">
                {editingId === a.id ? (
                  <div className="flex items-center gap-1">
                    <input
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="flex-1 min-w-0 bg-white/5 border border-white/10 rounded px-1.5 py-1 text-[11px] text-ivory outline-none"
                    />
                    <button onClick={() => rename(a.id)} className="text-success"><Check size={13} /></button>
                    <button onClick={() => setEditingId(null)} className="text-ivory/40"><X size={13} /></button>
                  </div>
                ) : (
                  <p className="text-[11px] text-ivory/50 truncate">{a.altText || "Untitled"}</p>
                )}
              </div>
              <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => {
                    setEditingId(a.id);
                    setEditValue(a.altText ?? "");
                  }}
                  className="bg-onyx/80 rounded p-1 text-ivory/70 hover:text-gold"
                >
                  <Pencil size={12} />
                </button>
                <button onClick={() => remove(a.id)} className="bg-onyx/80 rounded p-1 text-ivory/70 hover:text-garnet">
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
