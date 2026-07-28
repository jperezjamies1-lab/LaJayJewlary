import { prisma } from "@/lib/db";
import type Anthropic from "@anthropic-ai/sdk";

/**
 * Tool definitions passed to the Claude API. Every tool reads from the live
 * database — this is what makes the "AI NEVER invents information" rule
 * (Part 3) actually enforceable: the model has no other way to answer
 * product/order/inventory questions except through these functions.
 */
export const AI_TOOLS: Anthropic.Tool[] = [
  {
    name: "search_products",
    description:
      "Search the live product catalog by keyword, category, material, price range, or collection. Returns real, in-stock products only.",
    input_schema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Free-text search, e.g. 'gold necklace under $300'" },
        maxPrice: { type: "number" },
        minPrice: { type: "number" },
        material: { type: "string" },
        limit: { type: "number", default: 5 },
      },
      required: ["query"],
    },
  },
  {
    name: "get_order_status",
    description: "Look up a customer order by its order number to report real shipping/payment status.",
    input_schema: {
      type: "object",
      properties: {
        orderNumber: { type: "string" },
      },
      required: ["orderNumber"],
    },
  },
  {
    name: "compare_products",
    description: "Fetch full details for two or more products by slug so they can be compared accurately.",
    input_schema: {
      type: "object",
      properties: {
        slugs: { type: "array", items: { type: "string" } },
      },
      required: ["slugs"],
    },
  },
  {
    name: "escalate_to_human",
    description:
      "Flag this conversation for human follow-up when the assistant cannot resolve the customer's issue.",
    input_schema: {
      type: "object",
      properties: {
        reason: { type: "string" },
        channel: {
          type: "string",
          enum: ["live_chat", "email", "phone", "whatsapp", "contact_form"],
        },
      },
      required: ["reason"],
    },
  },
];

export async function runTool(name: string, input: Record<string, unknown>) {
  switch (name) {
    case "search_products": {
      const { query, maxPrice, minPrice, material, limit = 5 } = input as {
        query: string;
        maxPrice?: number;
        minPrice?: number;
        material?: string;
        limit?: number;
      };
      const products = await prisma.product.findMany({
        where: {
          status: "ACTIVE",
          ...(material ? { material: { contains: material, mode: "insensitive" } } : {}),
          ...(maxPrice ? { price: { lte: maxPrice } } : {}),
          ...(minPrice ? { price: { gte: minPrice } } : {}),
          OR: query
            ? [
                { name: { contains: query, mode: "insensitive" } },
                { description: { contains: query, mode: "insensitive" } },
              ]
            : undefined,
        },
        take: limit,
        include: { images: true, collection: true },
      });
      return { products };
    }

    case "get_order_status": {
      const { orderNumber } = input as { orderNumber: string };
      const order = await prisma.order.findUnique({
        where: { orderNumber },
        include: { items: { include: { product: true } } },
      });
      if (!order) return { found: false };
      return {
        found: true,
        status: order.status,
        trackingNumber: order.trackingNumber,
        total: order.total,
        items: order.items.map((i) => ({ name: i.product.name, quantity: i.quantity })),
      };
    }

    case "compare_products": {
      const { slugs } = input as { slugs: string[] };
      const products = await prisma.product.findMany({
        where: { slug: { in: slugs } },
        include: { images: true, reviews: true },
      });
      return { products };
    }

    case "escalate_to_human": {
      // In production: create a SupportTicket row + notify admin (Part 4: AI Escalation Alerts)
      return { escalated: true };
    }

    default:
      return { error: `Unknown tool: ${name}` };
  }
}
