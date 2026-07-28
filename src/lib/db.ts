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
 * LAZY INITIALIZATION — this is the important part. Nothing in this module
 * touches `process.env`, constructs a `pg.Pool`, or instantiates
 * `PrismaClient` at import time. `next build`'s "Collecting page data" step
 * imports every route module to statically analyze it, without ever
 * calling into it — so any top-level throw or side effect in an imported
 * module (like validating DATABASE_URL eagerly) breaks the build for every
 * route that merely imports `{ prisma }`, even ones that never touch the
 * database during that step. The `prisma` export below is a Proxy: importing
 * it, or even holding a reference to it, does nothing. The real
 * PrismaClient — and the DATABASE_URL/Hyperdrive validation that requires —
 * is only constructed the first time a property is actually accessed, i.e.
 * inside a route handler at request time, e.g. `prisma.product.findMany(...)`.
 */

function getConnectionString(): string {
  // @ts-expect-error — HYPERDRIVE is a Cloudflare Workers binding, only
  // present at runtime in the Workers environment via wrangler.jsonc.
  const hyperdrive = globalThis.HYPERDRIVE ?? (process.env as Record<string, unknown>).HYPERDRIVE;
  if (hyperdrive && typeof hyperdrive === "object" && "connectionString" in hyperdrive) {
    return (hyperdrive as { connectionString: string }).connectionString;
  }
  const url = process.env.DATABASE_URL;
  if (!url) {
    // Only ever thrown from inside getClient(), which only ever runs the
    // first time a route handler actually calls prisma.<model>.<method>() —
    // never at module import time, never during build-time page collection.
    throw new Error(
      "DATABASE_URL is not set. Set it (or a Cloudflare Hyperdrive binding) in your environment before making a database call."
    );
  }
  return url;
}

const globalForPrisma = globalThis as unknown as { __prismaClient?: PrismaClient };

function getClient(): PrismaClient {
  if (!globalForPrisma.__prismaClient) {
    const pool = new Pool({ connectionString: getConnectionString() });
    const adapter = new PrismaPg(pool);
    globalForPrisma.__prismaClient = new PrismaClient({ adapter });
  }
  return globalForPrisma.__prismaClient;
}

export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const real = getClient();
    const value = Reflect.get(real as object, prop, receiver);
    return typeof value === "function" ? value.bind(real) : value;
  },
});
