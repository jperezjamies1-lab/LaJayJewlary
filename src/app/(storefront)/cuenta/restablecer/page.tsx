import { Suspense } from "react";
import Header from "@/components/storefront/Header";
import Footer from "@/components/storefront/Footer";
import ResetPasswordForm from "./ResetPasswordForm";

// useSearchParams() requires a Suspense boundary in the App Router — without
// it, prerendering this route fails at build time. Header/Footer render
// immediately since they don't depend on the URL; only the form itself
// (which reads the ?token= param) is deferred.
export default function ResetPasswordPage() {
  return (
    <>
      <Header />
      <Suspense
        fallback={
          <div className="min-h-[70vh] flex items-center justify-center px-4">
            <p className="text-ivory/40 text-sm">Loading…</p>
          </div>
        }
      >
        <ResetPasswordForm />
      </Suspense>
      <Footer />
    </>
  );
}
