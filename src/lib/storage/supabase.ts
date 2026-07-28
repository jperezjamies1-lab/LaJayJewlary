import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

/**
 * Supabase Storage. Two buckets, created ahead of time in the Supabase
 * dashboard (or via `supabase storage create-bucket`):
 *
 *   public-media    — public bucket. Product images, logo, banners,
 *                      collection images, review media. Publicly readable.
 *   payment-proofs  — private bucket. Zelle payment screenshots. Never
 *                      publicly readable — only accessed via short-lived
 *                      signed URLs generated for the uploading customer or
 *                      an authorized admin.
 *
 * SUPABASE_SERVICE_ROLE_KEY has full storage access and must only ever be
 * used server-side (this file is only imported from API routes / server
 * components — never from a "use client" component).
 */

export const PUBLIC_BUCKET = "public-media";
export const PAYMENT_PROOFS_BUCKET = "payment-proofs";

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
    );
  }
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function uniqueFileName(originalName: string): string {
  const ext = originalName.includes(".") ? originalName.split(".").pop() : "bin";
  const safeExt = (ext ?? "bin").toLowerCase().replace(/[^a-z0-9]/g, "");
  const unique = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}`;
  return `${unique}.${safeExt}`;
}

/** Upload to the public bucket. Returns the public URL. */
export async function uploadPublicMedia(params: {
  folder: string; // e.g. "products", "homepage", "collections", "reviews", "logos"
  fileName: string;
  body: Buffer;
  contentType: string;
}): Promise<{ path: string; publicUrl: string }> {
  const client = getServiceClient();
  const path = `${params.folder}/${uniqueFileName(params.fileName)}`;

  const { error } = await client.storage
    .from(PUBLIC_BUCKET)
    .upload(path, params.body, { contentType: params.contentType, upsert: false });

  if (error) throw new Error(`Supabase upload failed: ${error.message}`);

  const { data } = client.storage.from(PUBLIC_BUCKET).getPublicUrl(path);
  return { path, publicUrl: data.publicUrl };
}

/** Upload a Zelle payment screenshot to the private bucket. Returns only the storage path — never a public URL. */
export async function uploadPaymentProof(params: {
  orderNumber: string;
  fileName: string;
  body: Buffer;
  contentType: string;
}): Promise<{ path: string }> {
  const client = getServiceClient();
  const path = `${params.orderNumber}/${uniqueFileName(params.fileName)}`;

  const { error } = await client.storage
    .from(PAYMENT_PROOFS_BUCKET)
    .upload(path, params.body, { contentType: params.contentType, upsert: false });

  if (error) throw new Error(`Supabase upload failed: ${error.message}`);

  return { path };
}

/** Short-lived signed URL for admin (or the owning customer) to view a payment proof. */
export async function getSignedPaymentProofUrl(path: string, expiresInSeconds = 300): Promise<string> {
  const client = getServiceClient();
  const { data, error } = await client.storage
    .from(PAYMENT_PROOFS_BUCKET)
    .createSignedUrl(path, expiresInSeconds);

  if (error || !data) throw new Error(`Could not create signed URL: ${error?.message}`);
  return data.signedUrl;
}

export async function deletePublicMedia(path: string): Promise<void> {
  const client = getServiceClient();
  const { error } = await client.storage.from(PUBLIC_BUCKET).remove([path]);
  if (error) throw new Error(`Supabase delete failed: ${error.message}`);
}

export async function deletePaymentProof(path: string): Promise<void> {
  const client = getServiceClient();
  const { error } = await client.storage.from(PAYMENT_PROOFS_BUCKET).remove([path]);
  if (error) throw new Error(`Supabase delete failed: ${error.message}`);
}

/** Extracts the storage path from a public-media URL so it can be deleted/renamed later. */
export function pathFromPublicUrl(url: string): string | null {
  const marker = `/object/public/${PUBLIC_BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return url.slice(idx + marker.length);
}
