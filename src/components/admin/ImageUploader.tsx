"use client";

import { useState, useRef } from "react";
import { Upload, X, Loader2 } from "lucide-react";

export interface UploadedImage {
  url: string;
  altText?: string;
}

export default function ImageUploader({
  images,
  onChange,
  folder = "products",
  productId,
}: {
  images: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
  folder?: string;
  productId?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);

    const uploaded: UploadedImage[] = [];
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);
      if (productId) formData.append("productId", productId);

      try {
        const res = await fetch("/api/media/upload", { method: "POST", body: formData });
        if (!res.ok) {
          const d = await res.json().catch(() => ({}));
          throw new Error(d.error ?? `Upload failed for ${file.name}`);
        }
        const data = await res.json();
        uploaded.push({ url: data.asset.url, altText: file.name });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Upload failed");
      }
    }

    onChange([...images, ...uploaded]);
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  function remove(url: string) {
    onChange(images.filter((img) => img.url !== url));
  }

  return (
    <div>
      <div className="grid grid-cols-4 gap-3 mb-3">
        {images.map((img) => (
          <div key={img.url} className="relative aspect-square rounded-md overflow-hidden border border-white/10 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.url} alt={img.altText ?? ""} className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => remove(img.url)}
              className="absolute top-1 right-1 bg-onyx/80 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={12} className="text-ivory" />
            </button>
          </div>
        ))}

        <label className="aspect-square rounded-md border border-dashed border-white/20 flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:border-gold transition-colors">
          {uploading ? (
            <Loader2 size={18} className="text-gold animate-spin" />
          ) : (
            <>
              <Upload size={18} className="text-ivory/40" />
              <span className="text-[10px] text-ivory/40">Upload</span>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*,video/mp4,video/quicktime"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
            disabled={uploading}
          />
        </label>
      </div>
      {error && <p className="text-xs text-garnet">{error}</p>}
    </div>
  );
}
