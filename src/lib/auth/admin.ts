import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/db";

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret-change-me";

export interface AdminSession {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions: string[];
}

/**
 * Reads and verifies the jay_admin_session cookie, then loads the admin +
 * role/permissions from the database. Returns null if there is no valid
 * session — callers must handle that as 401, never assume access.
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  const token = cookies().get("jay_admin_session")?.value;
  if (!token) return null;

  let payload: { sub: string };
  try {
    payload = jwt.verify(token, JWT_SECRET) as { sub: string };
  } catch {
    return null;
  }

  const admin = await prisma.admin.findUnique({
    where: { id: payload.sub },
    include: { role: true },
  });
  if (!admin) return null;

  return {
    id: admin.id,
    email: admin.email,
    name: admin.name,
    role: admin.role.name,
    permissions: (admin.role.permissions as string[]) ?? [],
  };
}

export function hasPermission(session: AdminSession, permission: string) {
  return session.permissions.includes("*") || session.permissions.includes(permission);
}

export async function requireAdmin(permission?: string): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) {
    throw new AdminAuthError("Not authenticated", 401);
  }
  if (permission && !hasPermission(session, permission)) {
    throw new AdminAuthError("Insufficient permissions", 403);
  }
  return session;
}

export class AdminAuthError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}
