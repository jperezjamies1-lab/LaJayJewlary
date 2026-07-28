"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/");
        router.refresh();
      }}
      className="text-xs text-ivory/50 hover:text-gold border border-white/10 rounded-full px-4 py-2"
    >
      Sign Out
    </button>
  );
}
