import { prisma } from "@/lib/db";

export type LogCategory =
  | "LOGIN"
  | "LOGOUT"
  | "ADMIN"
  | "PRODUCT"
  | "ORDER"
  | "INVENTORY"
  | "CUSTOMER"
  | "REVIEW"
  | "AI"
  | "SECURITY"
  | "MEDIA_UPLOAD"
  | "HOMEPAGE"
  | "COUPON"
  | "SETTINGS";

/**
 * Writes a structured entry to ActivityLog. This is the single write path so
 * "everything logged, admin can search logs" (master prompt Phase 6) is
 * actually true rather than aspirational — every route below calls this.
 */
export async function logActivity(params: {
  category: LogCategory;
  action: string;
  adminId?: string | null;
  entity?: string;
  entityId?: string;
  ipAddress?: string | null;
}) {
  await prisma.activityLog.create({
    data: {
      adminId: params.adminId ?? null,
      action: `${params.category}:${params.action}`,
      entity: params.entity,
      entityId: params.entityId,
      ipAddress: params.ipAddress ?? undefined,
    },
  });
}
