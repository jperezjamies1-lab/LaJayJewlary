import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCustomerSession } from "@/lib/auth/customer";

const AddressSchema = z.object({
  line1: z.string().min(1),
  line2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  zip: z.string().min(1),
  country: z.string().min(1),
});

export async function GET() {
  const customer = await getCustomerSession();
  if (!customer) return NextResponse.json({ error: "Please sign in." }, { status: 401 });

  const addresses = await prisma.address.findMany({ where: { customerId: customer.id } });
  return NextResponse.json({ addresses });
}

export async function POST(req: NextRequest) {
  const customer = await getCustomerSession();
  if (!customer) return NextResponse.json({ error: "Please sign in." }, { status: 401 });

  try {
    const body = AddressSchema.parse(await req.json());
    const address = await prisma.address.create({ data: { ...body, customerId: customer.id } });
    return NextResponse.json({ address }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Dirección inválida" }, { status: 400 });
  }
}
