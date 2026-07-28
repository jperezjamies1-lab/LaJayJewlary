"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Sparkles,
  Tag,
  Image as ImageIcon,
  BarChart3,
  Settings,
  Video,
  ScrollText,
  LogOut,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Products", href: "/admin/dashboard/productos", icon: Package },
  { label: "Orders", href: "/admin/dashboard/pedidos", icon: ShoppingCart },
  { label: "Customers", href: "/admin/dashboard/clientes", icon: Users },
  { label: "Jay AI", href: "/admin/dashboard/ai", icon: Sparkles },
  { label: "Discounts", href: "/admin/dashboard/descuentos", icon: Tag },
  { label: "Media Library", href: "/admin/dashboard/media", icon: ImageIcon },
  { label: "Live Shopping", href: "/admin/dashboard/live", icon: Video },
  { label: "Analytics", href: "/admin/dashboard/analytics", icon: BarChart3 },
  { label: "Logs", href: "/admin/dashboard/logs", icon: ScrollText },
  { label: "Settings", href: "/admin/dashboard/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-white/10 bg-onyx2 min-h-screen">
      <div className="px-6 py-6 border-b border-white/10 flex items-center gap-3">
        <Image
          src="/branding/logo-mark-small.png"
          alt="Jay La Joyería"
          width={36}
          height={26}
          className="h-9 w-auto"
        />
        <p className="font-display text-lg text-ivory leading-none">
          Jay <span className="text-gold">Admin</span>
        </p>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors",
                active
                  ? "bg-gold/10 text-gold"
                  : "text-ivory/60 hover:bg-white/5 hover:text-ivory"
              )}
            >
              <Icon size={17} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="px-3 py-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-ivory/50 hover:bg-white/5 hover:text-garnet transition-colors w-full"
        >
          <LogOut size={17} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
