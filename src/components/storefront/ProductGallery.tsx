"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export default function ProductGallery({
  images,
  name,
}: {
  images: { url: string; altText?: string | null }[];
  name: string;
}) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);

  if (images.length === 0) {
    return <div className="aspect-square bg-onyx2 rounded-md flex items-center justify-center text-ivory/20">No image</div>;
  }

  return (
    <div>
      <div
        className="relative aspect-square overflow-hidden rounded-md bg-onyx2 cursor-zoom-in"
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          setZoom({
            x: ((e.clientX - rect.left) / rect.width) * 100,
            y: ((e.clientY - rect.top) / rect.height) * 100,
          });
        }}
        onMouseLeave={() => setZoom(null)}
      >
        <Image
          src={images[active].url}
          alt={images[active].altText ?? name}
          fill
          priority
          className="object-cover transition-transform duration-300"
          style={
            zoom
              ? { transform: "scale(1.6)", transformOrigin: `${zoom.x}% ${zoom.y}%` }
              : undefined
          }
        />
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-2 mt-3">
          {images.map((img, i) => (
            <button
              key={img.url}
              onClick={() => setActive(i)}
              className={cn(
                "relative aspect-square rounded-sm overflow-hidden border",
                i === active ? "border-gold" : "border-white/10"
              )}
            >
              <Image src={img.url} alt="" fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
