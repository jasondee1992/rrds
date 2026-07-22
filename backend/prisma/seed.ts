import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { AdminRole, Prisma, PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

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

async function main() {
  const existingAdmin = await prisma.adminUser.findUnique({
    where: { email: adminEmail },
  });

  const passwordHash =
    existingAdmin && (await bcrypt.compare(adminPassword, existingAdmin.passwordHash).catch(() => false))
      ? existingAdmin.passwordHash
      : await bcrypt.hash(adminPassword, 12);

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

  const defaultFounderExpertise = [
    "Residential Air-Conditioning Systems",
    "Commercial Air-Conditioning Systems",
    "Installation and Replacement",
    "Preventive Maintenance",
    "Troubleshooting and Diagnostics",
    "Aircon Repair",
    "Cleaning and General Maintenance",
    "Multi-Unit and Hotel Aircon Operations",
  ];

  const companySettingData = {
    companyName: "RRDS Airconditioning Services",
    companyAddress:
      "#420 B Senator Neptali A. Gonzales St. Brgy. San Jose Sitio 4, Mandaluyong, Philippines, 1550",
    companyPhone: "0947 476 8214",
    companyEmail: "oneal101982@gmail.com",
    companyWebsite: "https://www.facebook.com/RRDSAirconServices",
    currencyCode: "PHP",
    facebookUrl: "https://www.facebook.com/RRDSAirconServices",
    linkedinUrl: null,
    founderName: "Ramon Dela Cruz",
    founderRole: "Founder & Lead Air-Conditioning Technician",
    founderExperienceYears: "15+",
    founderShortBiography:
      "RRDS is led by an experienced air-conditioning technician with more than 15 years of hands-on experience in residential and commercial systems. He currently handles the air-conditioning service and maintenance requirements of Makati Palace Hotel and personally oversees the technical quality of RRDS projects.",
    founderFullBiography:
      "With more than 15 years of hands-on experience in the air-conditioning industry, our founder and lead technician has developed extensive knowledge in diagnosing, repairing, maintaining, and installing different types of air-conditioning systems.\n\nHe is experienced in handling window-type, split-type, floor-mounted, cassette, ceiling-mounted, centralized, and commercial air-conditioning units from various major brands.\n\nHe currently oversees and handles the air-conditioning service and maintenance requirements of Makati Palace Hotel, giving him extensive experience in managing both individual units and large-scale commercial air-conditioning operations.\n\nHis hands-on leadership ensures that every RRDS project is approached with proper technical assessment, reliable workmanship, and a strong commitment to customer satisfaction.",
    founderCurrentResponsibility:
      "Currently Handling Air-Conditioning Operations at Makati Palace Hotel",
    founderImagePath: null,
    founderExpertise: JSON.stringify(defaultFounderExpertise),
    quotationValidityDays: 30,
    estimateValidityDays: 7,
    taxRate: new Prisma.Decimal(0),
    estimateDisclaimer:
      "Estimated amounts are subject to final inspection, scope validation, and availability of parts or materials.",
    quotationTerms:
      "Approved quotations are subject to payment terms, warranty coverage, and service schedule confirmation.",
    quotationFooter:
      "Thank you for considering RRDS Airconditioning Services.",
    registrationDetails: null,
  };

  const companySetting = existingCompanySetting
    ? existingCompanySetting
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
