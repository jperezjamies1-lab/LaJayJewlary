"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function LoadingScreen({ onDone }: { onDone?: () => void }) {
  const [visible, setVisible] = useState(true);
  const [phase, setPhase] = useState<"in" | "hold" | "out">("in");

  useEffect(() => {
    const toHold = setTimeout(() => setPhase("hold"), 500);
    const toOut = setTimeout(() => setPhase("out"), 1400);
    const toGone = setTimeout(() => {
      setVisible(false);
      onDone?.();
    }, 1900);
    return () => {
      clearTimeout(toHold);
      clearTimeout(toOut);
      clearTimeout(toGone);
    };
  }, [onDone]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-onyx transition-opacity duration-500 ease-out"
      style={{ opacity: phase === "out" ? 0 : 1 }}
      aria-hidden="true"
    >
      <div className="relative">
        {/* Gold glow */}
        <div
          className="absolute inset-0 rounded-full blur-3xl bg-gold/25 scale-150 transition-opacity duration-700"
          style={{ opacity: phase === "in" ? 0 : 1 }}
        />
        {/* Pink shimmer sweep */}
        <div
          className="absolute inset-0 rounded-full blur-3xl bg-pink/15 scale-125 animate-sparkle"
          style={{ opacity: phase === "in" ? 0 : 0.8 }}
        />
        <Image
          src="/branding/logo-mark-transparent.png"
          alt="Jay La Joyería"
          width={220}
          height={159}
          priority
          className="relative h-28 w-auto transition-all duration-700 ease-out"
          style={{
            opacity: phase === "in" ? 0 : 1,
            transform: phase === "in" ? "translateY(8px) scale(0.96)" : "translateY(0) scale(1)",
          }}
        />
      </div>
    </div>
  );
}
