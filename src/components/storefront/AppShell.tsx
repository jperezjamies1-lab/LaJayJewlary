"use client";

import { useEffect, useState } from "react";
import LoadingScreen from "@/components/storefront/LoadingScreen";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    const seen = sessionStorage.getItem("jay_loader_seen");
    if (!seen) {
      setShowLoader(true);
      sessionStorage.setItem("jay_loader_seen", "1");
    }
  }, []);

  return (
    <>
      {showLoader && <LoadingScreen onDone={() => setShowLoader(false)} />}
      {children}
    </>
  );
}
