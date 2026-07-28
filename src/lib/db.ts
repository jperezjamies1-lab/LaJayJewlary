import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

/**
 * Prisma client, wired for two environments:
 *
 * 1. Local / Node.js (npm run dev, npm run build): a plain `pg` Pool against
 *    DATABASE_URL. This is what runs in this sandbox and in any standard
 *    Node hosting.
 *
 * 2. Cloudflare Workers (via OpenNext): the Rust query engine binary Prisma
 *    normally uses cannot run on Workers, so this uses Prisma's driver
 *    adapters (previewFeatures = ["driverAdapters"] in schema.prisma) with
 *    `pg` running over a Cloudflare Hyperdrive binding — Hyperdrive is
 *    Cloudflare's connection pooler that makes a standard TCP Postgres
 *    database reachable from Workers. The binding is read from
 *    `process.env.HYPERDRIVE.connectionString` when present (see
 *    wrangler.jsonc), falling back to DATABASE_URL otherwise.
 *
 * This file is written correctly against the documented Prisma + Cloudflare
 * Hyperdrive pattern but has not been exercised against a live Workers
 * deployment or a live Hyperdrive binding in this sandbox (no network
 * egress to Cloudflare here) — verify the first deploy in your own account.
 */

function getConnectionString(): string {
  // @ts-expect-error — HYPERDRIVE is a Cloudflare Workers binding, only
  // present at runtime in the Workers environment via wrangler.jsonc.
  const hyperdrive = globalThis.HYPERDRIVE ?? (process.env as Record<string, unknown>).HYPERDRIVE;
  if (hyperdrive && typeof hyperdrive === "object" && "connectionString" in hyperdrive) {
    return (hyperdrive as { connectionString: string }).connectionString;
  }
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set.");
  return url;
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient() {
  const pool = new Pool({ connectionString: getConnectionString() });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
