import { defineCloudflareConfig } from "@opennextjs/cloudflare";

/**
 * OpenNext config for deploying this Next.js app to Cloudflare Workers.
 * Written against @opennextjs/cloudflare's documented defaults — not
 * verified against a live build in this sandbox (no Cloudflare network
 * egress here). Run `npm run build:worker` in an environment with real
 * Cloudflare access to confirm.
 */
export default defineCloudflareConfig({
  // Incremental Static Regeneration and the fetch cache both need a KV or
  // R2-backed cache in Workers (there's no local filesystem). Wire this to
  // a KV namespace or R2 bucket binding once created — see wrangler.jsonc.
});
