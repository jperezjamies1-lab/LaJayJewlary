import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import CustomerActions from "@/components/admin/CustomerActions";

export default async function AdminCustomerDetailPage({ params }: { params: { id: string } }) {
  const customer = await prisma.customer.findUnique({
    where: { id: params.id },
    include: { orders: { orderBy: { createdAt: "desc" } }, addresses: true },
  });

  if (!customer) notFound();

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-3xl mb-1">{customer.name ?? customer.email}</h1>
      <p className="text-ivory/40 text-sm mb-8">
        Joined {new Date(customer.createdAt).toLocaleDateString()}
      </p>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="rounded-lg border border-white/10 p-5">
          <p className="eyebrow mb-3">Contact</p>
          <p className="text-sm text-ivory/80">{customer.email}</p>
          <p className="text-sm text-ivory/50">{customer.phone ?? "No phone on file"}</p>
          <p className="text-sm text-ivory/50">Language: {customer.language.toUpperCase()}</p>
        </div>
        <div className="rounded-lg border border-white/10 p-5">
          <p className="eyebrow mb-3">Addresses</p>
          {customer.addresses.length === 0 ? (
            <p className="text-sm text-ivory/40">None on file</p>
          ) : (
            customer.addresses.map((a) => (
              <p key={a.id} className="text-sm text-ivory/70">
                {a.line1}, {a.city}, {a.state} {a.zip}
              </p>
            ))
          )}
        </div>
      </div>

      <CustomerActions customerId={customer.id} vipStatus={customer.vipStatus} blocked={customer.blocked} />

      <div className="rounded-lg border border-white/10 p-5 mt-6">
        <p className="eyebrow mb-3">Order History</p>
        {customer.orders.length === 0 ? (
          <p className="text-sm text-ivory/40">No orders yet.</p>
        ) : (
          <div className="space-y-2">
            {customer.orders.map((o) => (
              <div key={o.id} className="flex justify-between text-sm">
                <span className="font-mono text-ivory/70">{o.orderNumber}</span>
                <span className="text-ivory/50">{o.status}</span>
                <span className="font-mono text-gold">{formatPrice(Number(o.total))}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
