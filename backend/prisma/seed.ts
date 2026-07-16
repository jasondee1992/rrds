import "dotenv/config";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { AdminRole, Prisma, PrismaClient } from "@prisma/client";

const databaseUrl = process.env.DATABASE_URL;
const adminName = process.env.ADMIN_NAME;
const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required.");
}

if (!adminName || !adminEmail || !adminPassword) {
  throw new Error("ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD are required.");
}

const adapter = new PrismaBetterSqlite3({ url: databaseUrl });
const prisma = new PrismaClient({ adapter });

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const keyLength = 64;
  const derivedKey = scryptSync(password, salt, keyLength);

  return `scrypt:${keyLength}:${salt}:${derivedKey.toString("hex")}`;
}

function isScryptHashForPassword(password: string, passwordHash: string): boolean {
  const [algorithm, keyLengthValue, salt, storedHash] = passwordHash.split(":");

  if (algorithm !== "scrypt" || !keyLengthValue || !salt || !storedHash) {
    return false;
  }

  const keyLength = Number(keyLengthValue);

  if (!Number.isInteger(keyLength) || keyLength <= 0) {
    return false;
  }

  const storedBuffer = Buffer.from(storedHash, "hex");
  const derivedBuffer = scryptSync(password, salt, keyLength);

  return storedBuffer.length === derivedBuffer.length && timingSafeEqual(storedBuffer, derivedBuffer);
}

async function main() {
  const existingAdmin = await prisma.adminUser.findUnique({
    where: { email: adminEmail },
  });

  const passwordHash =
    existingAdmin && isScryptHashForPassword(adminPassword, existingAdmin.passwordHash)
      ? existingAdmin.passwordHash
      : hashPassword(adminPassword);

  const adminUser = await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: {
      fullName: adminName,
      passwordHash,
      role: AdminRole.SUPER_ADMIN,
      isActive: true,
    },
    create: {
      fullName: adminName,
      email: adminEmail,
      passwordHash,
      role: AdminRole.SUPER_ADMIN,
      isActive: true,
    },
  });

  const existingCompanySetting = await prisma.companySetting.findFirst({
    orderBy: { createdAt: "asc" },
  });

  const companySettingData = {
    companyName: "RRDS Airconditioning Services",
    companyAddress: "Philippines",
    companyPhone: "To be updated",
    companyEmail: adminEmail,
    quotationValidityDays: 30,
    estimateValidityDays: 7,
    taxRate: new Prisma.Decimal(0),
    estimateDisclaimer:
      "Estimated amounts are subject to final inspection, scope validation, and availability of parts or materials.",
    quotationTerms:
      "Approved quotations are subject to payment terms, warranty coverage, and service schedule confirmation.",
  };

  const companySetting = existingCompanySetting
    ? await prisma.companySetting.update({
        where: { id: existingCompanySetting.id },
        data: companySettingData,
      })
    : await prisma.companySetting.create({
        data: companySettingData,
      });

  console.log(`Seeded admin user: ${adminUser.email}`);
  console.log(`Seeded company settings: ${companySetting.companyName}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
