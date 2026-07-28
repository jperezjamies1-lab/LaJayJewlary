import Link from "next/link";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  const customers = await prisma.customer.findMany({
    include: { orders: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <h1 className="font-display text-3xl mb-6">Customers</h1>

      {customers.length === 0 ? (
        <div className="rounded-xl border border-white/10 py-16 text-center text-ivory/40 text-sm">
          No customers yet.
        </div>
      ) : (
        <div className="rounded-xl border border-white/10 overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-white/[0.03] text-ivory/40 text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-4 py-3 font-normal">Name</th>
                <th className="text-left px-4 py-3 font-normal">Email</th>
                <th className="text-left px-4 py-3 font-normal">Orders</th>
                <th className="text-left px-4 py-3 font-normal">VIP</th>
                <th className="text-left px-4 py-3 font-normal">Status</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} className="border-t border-white/5 hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <Link href={`/admin/dashboard/clientes/${c.id}`} className="text-ivory/90 hover:text-gold">
                      {c.name ?? "—"}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-ivory/50">{c.email}</td>
                  <td className="px-4 py-3 text-ivory/70">{c.orders.length}</td>
                  <td className="px-4 py-3">{c.vipStatus && <span className="text-gold text-xs">VIP</span>}</td>
                  <td className="px-4 py-3">
                    {c.blocked ? (
                      <span className="text-garnet text-xs">Blocked</span>
                    ) : (
                      <span className="text-success text-xs">Active</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
