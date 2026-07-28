import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, AdminAuthError } from "@/lib/auth/admin";

// requireAdmin() reads the admin session cookie via cookies() — this route
// must never be statically rendered/cached.
export const dynamic = "force-dynamic";

function csvEscape(value: unknown) {
  const s = String(value ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET() {
  try {
    await requireAdmin("orders.read");

    const orders = await prisma.order.findMany({
      include: { customer: true, items: true },
      orderBy: { createdAt: "desc" },
    });

    const header = ["Order Number", "Date", "Customer", "Email", "Status", "Payment Verified", "Total", "Items"];
    const rows = orders.map((o) => [
      o.orderNumber,
      o.createdAt.toISOString(),
      o.customer.name ?? "",
      o.customer.email,
      o.status,
      o.paymentVerified ? "Yes" : "No",
      Number(o.total).toFixed(2),
      o.items.length,
    ]);

    const csv = [header, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="orders-${Date.now()}.csv"`,
      },
    });
  } catch (err) {
    if (err instanceof AdminAuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error(err);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
