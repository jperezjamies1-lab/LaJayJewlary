import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getOrCreateCart } from "@/lib/cart";
import { getCustomerSession, signCustomerToken, CUSTOMER_COOKIE } from "@/lib/auth/customer";
import { sendEmail, orderConfirmationEmail } from "@/lib/email";
import { logActivity } from "@/lib/log";
import { getSiteSettings } from "@/lib/settings";

const AddressSchema = z.object({
  line1: z.string().min(1),
  line2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  zip: z.string().min(1),
  country: z.string().min(1),
});

const CheckoutSchema = z.object({
  guestEmail: z.string().email().optional(),
  guestName: z.string().optional(),
  shippingAddress: AddressSchema,
  couponCode: z.string().optional(),
});

function generateOrderNumber() {
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `JLJ-${Date.now().toString(36).toUpperCase()}${rand}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = CheckoutSchema.parse(await req.json());
    const cart = await getOrCreateCart();

    const items = await prisma.cartItem.findMany({
      where: { cartId: cart.id },
      include: { product: { include: { inventory: true } } },
    });

    if (items.length === 0) {
      return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
    }

    // Verify stock for every line before committing the order.
    for (const item of items) {
      if (item.product.inventory && item.product.inventory.stock < item.quantity) {
        return NextResponse.json(
          { error: `"${item.product.name}" only has ${item.product.inventory.stock} left in stock.` },
          { status: 409 }
        );
      }
    }

    let customer = await getCustomerSession();
    if (!customer) {
      if (!body.guestEmail) {
        return NextResponse.json({ error: "Email is required for guest checkout." }, { status: 400 });
      }
      customer = await prisma.customer.upsert({
        where: { email: body.guestEmail },
        update: {},
        create: { email: body.guestEmail, name: body.guestName },
      });
    }

    const subtotal = items.reduce((sum, i) => sum + Number(i.product.price) * i.quantity, 0);

    let discount = 0;
    if (body.couponCode) {
      const coupon = await prisma.coupon.findUnique({ where: { code: body.couponCode } });
      const valid =
        coupon &&
        coupon.active &&
        (!coupon.expiresAt || coupon.expiresAt > new Date()) &&
        (!coupon.usageLimit || coupon.usedCount < coupon.usageLimit) &&
        (!coupon.minPurchase || subtotal >= Number(coupon.minPurchase));

      if (!valid) {
        return NextResponse.json({ error: "This coupon code is invalid or expired." }, { status: 400 });
      }
      discount =
        coupon.type === "PERCENTAGE"
          ? subtotal * (Number(coupon.value) / 100)
          : coupon.type === "FIXED_AMOUNT"
          ? Number(coupon.value)
          : 0;
      await prisma.coupon.update({ where: { id: coupon.id }, data: { usedCount: { increment: 1 } } });
    }

    const settings = await getSiteSettings();
    const shipping = subtotal >= settings.freeShippingThreshold ? 0 : settings.shippingPrice;
    const total = Math.max(subtotal - discount, 0) + shipping;

    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        customerId: customer.id,
        status: "PENDING",
        subtotal,
        shipping,
        discount,
        total,
        paymentMethod: "Zelle",
        shippingAddressJson: body.shippingAddress,
        items: {
          create: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            price: i.product.price,
          })),
        },
      },
    });

    // Reserve stock immediately so two customers can't oversell the same piece.
    await Promise.all(
      items.map((i) =>
        prisma.inventoryRecord.updateMany({
          where: { productId: i.productId },
          data: { reserved: { increment: i.quantity } },
        })
      )
    );

    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

    try {
      const { subject, html } = orderConfirmationEmail(customer.language as "en" | "es", {
        orderNumber: order.orderNumber,
        total,
        zellePhone: settings.zelleNumber,
      });
      await sendEmail({ to: customer.email, subject, html });
    } catch (e) {
      console.error("Order confirmation email not sent:", e);
    }

    await logActivity({ category: "ORDER", action: "CREATED", entity: "Order", entityId: order.id });

    const res = NextResponse.json(
      {
        order: {
          orderNumber: order.orderNumber,
          total,
          zelle: { phone: settings.zelleNumber, recipient: settings.zelleNumber },
        },
      },
      { status: 201 }
    );

    // Guests get a session cookie too, scoped to this customer record, so they
    // can view the confirmation page and upload a Zelle screenshot without
    // creating a password. If they register later with the same email, the
    // existing order history carries over since it's keyed by customerId.
    const token = await signCustomerToken(customer.id);
    res.cookies.set(CUSTOMER_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });

    return res;
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid checkout details", details: err.flatten() }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}
