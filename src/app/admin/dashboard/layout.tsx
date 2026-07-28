import Image from "next/image";
import Sidebar from "@/components/admin/Sidebar";

export const metadata = {
  robots: { index: false, follow: false },
};

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex bg-onyx min-h-screen text-ivory">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden flex items-center gap-3 border-b border-white/10 px-4 py-3">
          <Image src="/branding/logo-mark-small.png" alt="Jay La Joyería" width={32} height={23} className="h-8 w-auto" />
          <p className="font-display text-base text-ivory">
            Jay <span className="text-gold">Admin</span>
          </p>
        </header>
        <main className="flex-1 p-6 md:p-10">{children}</main>
      </div>
    </div>
  );
}
