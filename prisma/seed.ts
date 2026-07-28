import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/**
 * Seeds only what's structurally required to log into the admin panel:
 * the Owner role and one admin account. No sample products, no demo
 * customers, no fake orders — the store starts empty by design.
 *
 * Credentials come from environment variables, never hardcoded, and the
 * script refuses to run without them so a real password is always required.
 */
async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME;

  if (!email || !password || !name) {
    console.error(
      "Missing ADMIN_EMAIL, ADMIN_PASSWORD, or ADMIN_NAME environment variables.\n" +
        "Set them before seeding — see .env.example. Refusing to create an admin with a default password."
    );
    process.exit(1);
  }

  if (password.length < 12) {
    console.error("ADMIN_PASSWORD must be at least 12 characters.");
    process.exit(1);
  }

  const ownerRole = await prisma.role.upsert({
    where: { name: "Owner" },
    update: {},
    create: { name: "Owner", permissions: ["*"] },
  });

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.admin.upsert({
    where: { email },
    update: { passwordHash, name, roleId: ownerRole.id },
    create: { email, passwordHash, name, roleId: ownerRole.id },
  });

  console.log(`Seed complete. Admin account ready for ${email}.`);
  console.log("The storefront starts with zero products — add your first one from /admin/dashboard/productos/nuevo.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
