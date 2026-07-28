import { SignJWT, jwtVerify, type JWTPayload } from "jose";

/**
 * jsonwebtoken uses Node's `crypto` module in ways the Edge/Workers runtime
 * can't run — Next.js middleware always executes on the Edge runtime, so
 * that import alone breaks Cloudflare Workers builds. `jose` implements the
 * same JWT operations on the Web Crypto API instead, which works
 * identically in Node.js, Edge, and Workers. This is the one place the
 * secret gets encoded and the one place tokens get signed/verified —
 * everything else (middleware, admin auth, customer auth, login route)
 * calls through here.
 */

function getSecretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET ?? "dev-secret-change-me";
  return new TextEncoder().encode(secret);
}

export async function signJwt(
  payload: JWTPayload,
  expiresIn: string
): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(getSecretKey());
}

export async function verifyJwt<T extends JWTPayload = JWTPayload>(token: string): Promise<T> {
  const { payload } = await jwtVerify(token, getSecretKey());
  return payload as T;
}
