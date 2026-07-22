import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import { AdminRole, Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import { AppError } from "../utils/AppError";
import type {
  CompanyInformationInput,
  FounderProfileInput,
  SocialLinksInput,
} from "../validations/settingsSchemas";

const founderUploadPublicPath = "/uploads/founder";
const founderUploadDirectory = path.resolve(process.cwd(), "uploads", "founder");
const maxFounderImageSize = 5 * 1024 * 1024;

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

const defaultSettings = {
  companyName: "RRDS Airconditioning Services",
  companyAddress:
    "#420 B Senator Neptali A. Gonzales St. Brgy. San Jose Sitio 4, Mandaluyong, Philippines, 1550",
  companyPhone: "0947 476 8214",
  companyEmail: "oneal101982@gmail.com",
  companyWebsite: "https://www.facebook.com/RRDSAirconServices",
  companyLogoPath: null,
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
  quotationFooter: "Thank you for considering RRDS Airconditioning Services.",
  registrationDetails: null,
};

let publicSettingsCache: { expiresAt: number; data: PublicSiteSettings } | null = null;

type CompanySettingRecord = Awaited<ReturnType<typeof getOrCreateSettingsRecord>>;

export type PublicSiteSettings = {
  company: {
    name: string;
    contactNumber: string;
    email: string;
    address: string;
  };
  socialLinks: {
    facebook?: string;
    linkedin?: string;
  };
  founder: {
    name: string;
    role: string;
    experienceYears: string;
    currentResponsibility: string;
    shortBiography: string;
    fullBiography: string;
    imageUrl?: string;
    expertise: string[];
  };
};

function cleanText(value: string | null | undefined, fallback: string, maxLength: number) {
  const text = (value ?? fallback)
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/[<>]/g, "")
    .trim()
    .slice(0, maxLength);

  return text || fallback;
}

function cleanOptionalText(value: string | null | undefined, maxLength: number) {
  const text = (value ?? "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/[<>]/g, "")
    .trim()
    .slice(0, maxLength);

  return text || null;
}

function parseFounderExpertise(value: string | null | undefined) {
  try {
    const parsed = JSON.parse(value ?? "[]");

    if (!Array.isArray(parsed)) {
      return defaultFounderExpertise;
    }

    const itemMap = new Map<string, string>();

    parsed
      .filter((item): item is string => typeof item === "string")
      .forEach((item) => {
        const cleaned = cleanText(item, "", 120);

        if (cleaned) {
          itemMap.set(cleaned.toLowerCase(), cleaned);
        }
      });

    const uniqueItems = Array.from(itemMap.values());

    return uniqueItems.length > 0 ? uniqueItems : defaultFounderExpertise;
  } catch {
    return defaultFounderExpertise;
  }
}

function ensureCanWriteSettings(role: AdminRole) {
  if (role !== AdminRole.SUPER_ADMIN && role !== AdminRole.ADMIN) {
    throw new AppError("Only admins can update public settings.", 403);
  }
}

function mapPublicSettings(setting: CompanySettingRecord): PublicSiteSettings {
  const facebookUrl = cleanOptionalText(setting.facebookUrl, 240);
  const linkedinUrl = cleanOptionalText(setting.linkedinUrl, 240);
  const imageUrl = cleanOptionalText(setting.founderImagePath, 240);

  return {
    company: {
      name: cleanText(setting.companyName, defaultSettings.companyName, 120),
      contactNumber: cleanText(setting.companyPhone, defaultSettings.companyPhone, 40),
      email: cleanText(setting.companyEmail, defaultSettings.companyEmail, 160),
      address: cleanText(setting.companyAddress, defaultSettings.companyAddress, 300),
    },
    socialLinks: {
      ...(facebookUrl ? { facebook: facebookUrl } : {}),
      ...(linkedinUrl ? { linkedin: linkedinUrl } : {}),
    },
    founder: {
      name: cleanText(setting.founderName, defaultSettings.founderName, 120),
      role: cleanText(setting.founderRole, defaultSettings.founderRole, 140),
      experienceYears: cleanText(
        setting.founderExperienceYears,
        defaultSettings.founderExperienceYears,
        30,
      ),
      currentResponsibility: cleanText(
        setting.founderCurrentResponsibility,
        defaultSettings.founderCurrentResponsibility,
        240,
      ),
      shortBiography: cleanText(
        setting.founderShortBiography,
        defaultSettings.founderShortBiography,
        800,
      ),
      fullBiography: cleanText(
        setting.founderFullBiography,
        defaultSettings.founderFullBiography,
        5000,
      ),
      ...(imageUrl ? { imageUrl } : {}),
      expertise: parseFounderExpertise(setting.founderExpertise),
    },
  };
}

function mapAdminSettings(setting: CompanySettingRecord) {
  return {
    ...mapPublicSettings(setting),
    founder: {
      ...mapPublicSettings(setting).founder,
      expertise: parseFounderExpertise(setting.founderExpertise),
    },
  };
}

async function getOrCreateSettingsRecord() {
  const existing = await prisma.companySetting.findFirst({
    orderBy: { createdAt: "asc" },
  });

  if (existing) {
    return existing;
  }

  return prisma.companySetting.create({
    data: defaultSettings,
  });
}

function invalidatePublicSettingsCache() {
  publicSettingsCache = null;
}

async function logSettingsAudit(
  adminId: string,
  action: string,
  metadata?: Record<string, unknown>,
) {
  await prisma.auditLog.create({
    data: {
      adminId,
      action,
      entityType: "CompanySetting",
      entityReference: "public-profile",
      metadata: metadata ? JSON.stringify(metadata).slice(0, 2000) : null,
    },
    select: { id: true },
  });
}

export async function getPublicSiteSettings() {
  const now = Date.now();

  if (publicSettingsCache && publicSettingsCache.expiresAt > now) {
    return publicSettingsCache.data;
  }

  const setting = await getOrCreateSettingsRecord();
  const data = mapPublicSettings(setting);
  publicSettingsCache = {
    data,
    expiresAt: now + 60_000,
  };

  return data;
}

export async function getAdminPublicProfileSettings() {
  const setting = await getOrCreateSettingsRecord();

  return mapAdminSettings(setting);
}

export async function updateCompanyInformation(
  input: CompanyInformationInput,
  adminId: string,
  role: AdminRole,
) {
  ensureCanWriteSettings(role);

  const setting = await getOrCreateSettingsRecord();
  const updated = await prisma.companySetting.update({
    where: { id: setting.id },
    data: {
      companyName: cleanText(input.companyName, defaultSettings.companyName, 120),
      companyPhone: cleanText(input.contactNumber, defaultSettings.companyPhone, 40),
      companyEmail: cleanText(input.contactEmail, defaultSettings.companyEmail, 160),
      companyAddress: cleanText(input.businessAddress, defaultSettings.companyAddress, 300),
    },
  });

  invalidatePublicSettingsCache();
  await logSettingsAudit(adminId, "COMPANY_INFORMATION_CHANGED");

  return mapAdminSettings(updated);
}

export async function updateSocialLinks(
  input: SocialLinksInput,
  adminId: string,
  role: AdminRole,
) {
  ensureCanWriteSettings(role);

  const setting = await getOrCreateSettingsRecord();
  const updated = await prisma.companySetting.update({
    where: { id: setting.id },
    data: {
      facebookUrl: cleanOptionalText(input.facebookUrl, 240),
      linkedinUrl: cleanOptionalText(input.linkedinUrl, 240),
    },
  });

  invalidatePublicSettingsCache();
  await logSettingsAudit(adminId, "SOCIAL_LINKS_CHANGED", {
    facebookConfigured: Boolean(updated.facebookUrl),
    linkedinConfigured: Boolean(updated.linkedinUrl),
  });

  return mapAdminSettings(updated);
}

export async function updateFounderProfile(
  input: FounderProfileInput,
  adminId: string,
  role: AdminRole,
) {
  ensureCanWriteSettings(role);

  const setting = await getOrCreateSettingsRecord();
  const updated = await prisma.companySetting.update({
    where: { id: setting.id },
    data: {
      founderName: cleanText(input.founderName, defaultSettings.founderName, 120),
      founderRole: cleanText(input.founderRole, defaultSettings.founderRole, 140),
      founderExperienceYears: cleanText(
        input.founderExperienceYears,
        defaultSettings.founderExperienceYears,
        30,
      ),
      founderCurrentResponsibility: cleanText(
        input.founderCurrentResponsibility,
        defaultSettings.founderCurrentResponsibility,
        240,
      ),
      founderShortBiography: cleanText(
        input.founderShortBiography,
        defaultSettings.founderShortBiography,
        800,
      ),
      founderFullBiography: cleanText(
        input.founderFullBiography,
        defaultSettings.founderFullBiography,
        5000,
      ),
      founderExpertise: JSON.stringify(input.founderExpertise.map((item) => cleanText(item, "", 120))),
    },
  });

  invalidatePublicSettingsCache();
  await logSettingsAudit(adminId, "FOUNDER_PROFILE_CHANGED", {
    expertiseCount: input.founderExpertise.length,
  });

  return mapAdminSettings(updated);
}

function assertFounderImage(file: Express.Multer.File | undefined) {
  if (!file) {
    throw new AppError("Founder profile image is required.", 400);
  }

  if (file.size > maxFounderImageSize) {
    throw new AppError("Founder profile image must be 5 MB or smaller.", 400);
  }

  const extension = path.extname(file.originalname).toLowerCase();
  const allowed: Record<string, string[]> = {
    "image/jpeg": [".jpg", ".jpeg"],
    "image/png": [".png"],
    "image/webp": [".webp"],
  };

  if (!allowed[file.mimetype]?.includes(extension)) {
    throw new AppError("Founder profile image must be a JPEG, PNG, or WebP file.", 400);
  }

  return extension === ".jpeg" ? ".jpg" : extension;
}

async function removeLocalFounderImage(imagePath: string | null | undefined) {
  if (!imagePath?.startsWith(`${founderUploadPublicPath}/`)) {
    return;
  }

  const filename = path.basename(imagePath);
  const resolved = path.resolve(founderUploadDirectory, filename);
  const relative = path.relative(founderUploadDirectory, resolved);

  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    return;
  }

  await fs.unlink(resolved).catch(() => undefined);
}

export async function uploadFounderImage(
  file: Express.Multer.File | undefined,
  adminId: string,
  role: AdminRole,
) {
  ensureCanWriteSettings(role);

  const extension = assertFounderImage(file);
  const setting = await getOrCreateSettingsRecord();
  const filename = `${crypto.randomUUID()}${extension}`;
  const publicPath = `${founderUploadPublicPath}/${filename}`;

  await fs.mkdir(founderUploadDirectory, { recursive: true });
  await fs.writeFile(path.join(founderUploadDirectory, filename), file!.buffer, {
    flag: "wx",
  });

  const updated = await prisma.companySetting.update({
    where: { id: setting.id },
    data: { founderImagePath: publicPath },
  });

  await removeLocalFounderImage(setting.founderImagePath);
  invalidatePublicSettingsCache();
  await logSettingsAudit(
    adminId,
    setting.founderImagePath ? "FOUNDER_IMAGE_REPLACED" : "FOUNDER_IMAGE_UPLOADED",
    { imageConfigured: true },
  );

  return mapAdminSettings(updated);
}

export async function removeFounderImage(adminId: string, role: AdminRole) {
  ensureCanWriteSettings(role);

  const setting = await getOrCreateSettingsRecord();
  const previousImagePath = setting.founderImagePath;
  const updated = await prisma.companySetting.update({
    where: { id: setting.id },
    data: { founderImagePath: null },
  });

  await removeLocalFounderImage(previousImagePath);
  invalidatePublicSettingsCache();
  await logSettingsAudit(adminId, "FOUNDER_IMAGE_REMOVED", {
    imageConfigured: false,
  });

  return mapAdminSettings(updated);
}
