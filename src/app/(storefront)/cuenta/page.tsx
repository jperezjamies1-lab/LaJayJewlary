import { redirect } from "next/navigation";
import Link from "next/link";
import Header from "@/components/storefront/Header";
import Footer from "@/components/storefront/Footer";
import LogoutButton from "@/components/storefront/LogoutButton";
import { getCustomerSession } from "@/lib/auth/customer";

export default async function AccountPage() {
  const customer = await getCustomerSession();
  if (!customer) redirect("/cuenta/iniciar-sesion");

  return (
    <>
      <Header />
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-3xl text-ivory">My Account</h1>
          <LogoutButton />
        </div>

        <div className="grid sm:grid-cols-3 gap-4 mb-10">
          <Link href="/cuenta/pedidos" className="rounded-lg border border-white/10 p-5 hover:border-gold transition-colors">
            <p className="text-ivory/90 text-sm">Orders</p>
            <p className="text-ivory/40 text-xs mt-1">Track and view order history</p>
          </Link>
          <Link href="/cuenta/lista-deseos" className="rounded-lg border border-white/10 p-5 hover:border-gold transition-colors">
            <p className="text-ivory/90 text-sm">Wishlist</p>
            <p className="text-ivory/40 text-xs mt-1">Saved pieces</p>
          </Link>
          <Link href="/cuenta/direcciones" className="rounded-lg border border-white/10 p-5 hover:border-gold transition-colors">
            <p className="text-ivory/90 text-sm">Addresses</p>
            <p className="text-ivory/40 text-xs mt-1">Shipping addresses</p>
          </Link>
        </div>

        <div className="rounded-lg border border-white/10 p-6">
          <h2 className="text-sm text-ivory/50 mb-4">Profile</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-ivory/40">Name</dt>
              <dd className="text-ivory/90">{customer.name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ivory/40">Email</dt>
              <dd className="text-ivory/90">{customer.email}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ivory/40">Email verified</dt>
              <dd className={customer.emailVerified ? "text-success" : "text-garnet"}>
                {customer.emailVerified ? "Yes" : "Not yet"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ivory/40">VIP Status</dt>
              <dd className="text-gold">{customer.vipStatus ? "VIP" : "Standard"}</dd>
            </div>
          </dl>
        </div>
      </div>
      <Footer />
    </>
  );
}
