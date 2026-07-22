import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import { AdminRole, Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import { AppError } from "../utils/AppError";
import type {
  CompanyInformationInput,
  FounderProfileInput,
  HomeCarouselImageInput,
  HomeCarouselReorderInput,
  HomePageSettingsInput,
  SocialLinksInput,
} from "../validations/settingsSchemas";

const founderUploadPublicPath = "/uploads/founder";
const founderUploadDirectory = path.resolve(process.cwd(), "uploads", "founder");
const homeUploadPublicPath = "/uploads/home";
const homeUploadDirectory = path.resolve(process.cwd(), "uploads", "home");
const maxFounderImageSize = 5 * 1024 * 1024;
const maxHomeImageSize = 5 * 1024 * 1024;

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

const defaultHomeStats = [
  { label: "Residential Support", value: "Homes" },
  { label: "Commercial Support", value: "Businesses" },
  { label: "Service Focus", value: "Cooling Comfort" },
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
  homeHeroEyebrow: "RRDS Airconditioning Services",
  homeHeroTitle: "KEEPING YOU COOL. ALWAYS.",
  homeHeroSubtitle:
    "Professional air-conditioning installation, maintenance, cleaning, and repair services for homes and businesses.",
  homePrimaryCtaLabel: "Request Free Quotation",
  homePrimaryCtaPath: "/free-quotation",
  homeSecondaryCtaLabel: "Contact Us",
  homeSecondaryCtaPath: "/contact",
  homeStats: JSON.stringify(defaultHomeStats),
  homeWhyEyebrow: "Why Choose RRDS",
  homeWhyTitle: "Reliable Air-Conditioning Support",
  homeWhyDescription:
    "Built around dependable workmanship, practical recommendations, and responsive support.",
  homeServicesEyebrow: "Our Services",
  homeServicesTitle: "Aircon Services for Homes and Businesses",
  homeServicesDescription:
    "Core RRDS public service offerings shown with editable placeholder descriptions.",
  homeAboutEyebrow: "About RRDS",
  homeAboutTitle: "Professional service with a focus on comfort and reliability.",
  homeAboutDescription:
    "RRDS Airconditioning Services is presented here with editable placeholder content. This section can later be updated with approved company details while keeping the focus on quality work, reliable service, and support for both residential and commercial customers.",
  homeAboutCtaLabel: "Learn More About RRDS",
  homeProjectsEyebrow: "Sample Projects",
  homeProjectsTitle: "Project Preview",
  homeProjectsDescription:
    "Sample cards only. Replace these with verified RRDS project details during a later phase.",
  homeTestimonialsEyebrow: "Testimonials",
  homeTestimonialsTitle: "What Customers May Say",
  homeTestimonialsDescription:
    "Placeholder testimonials for layout approval. Replace with verified customer feedback later.",
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
  home: {
    heroEyebrow: string;
    heroTitle: string;
    heroSubtitle: string;
    primaryCtaLabel: string;
    primaryCtaPath: string;
    secondaryCtaLabel: string;
    secondaryCtaPath: string;
    stats: Array<{ label: string; value: string }>;
    whyEyebrow: string;
    whyTitle: string;
    whyDescription: string;
    servicesEyebrow: string;
    servicesTitle: string;
    servicesDescription: string;
    aboutEyebrow: string;
    aboutTitle: string;
    aboutDescription: string;
    aboutCtaLabel: string;
    projectsEyebrow: string;
    projectsTitle: string;
    projectsDescription: string;
    testimonialsEyebrow: string;
    testimonialsTitle: string;
    testimonialsDescription: string;
    carouselImages: Array<{
      imageUrl: string;
      altText: string;
      caption?: string;
      sortOrder: number;
    }>;
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

function parseHomeStats(value: string | null | undefined) {
  try {
    const parsed = JSON.parse(value ?? "[]");

    if (!Array.isArray(parsed)) {
      return defaultHomeStats;
    }

    const stats = parsed
      .filter(
        (item): item is { label: unknown; value: unknown } =>
          typeof item === "object" && item !== null && "label" in item && "value" in item,
      )
      .map((item) => ({
        label: cleanText(String(item.label), "", 60),
        value: cleanText(String(item.value), "", 60),
      }))
      .filter((item) => item.label && item.value)
      .slice(0, 6);

    return stats.length > 0 ? stats : defaultHomeStats;
  } catch {
    return defaultHomeStats;
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
    home: {
      heroEyebrow: cleanText(setting.homeHeroEyebrow, defaultSettings.homeHeroEyebrow, 120),
      heroTitle: cleanText(setting.homeHeroTitle, defaultSettings.homeHeroTitle, 120),
      heroSubtitle: cleanText(setting.homeHeroSubtitle, defaultSettings.homeHeroSubtitle, 300),
      primaryCtaLabel: cleanText(
        setting.homePrimaryCtaLabel,
        defaultSettings.homePrimaryCtaLabel,
        80,
      ),
      primaryCtaPath: cleanText(
        setting.homePrimaryCtaPath,
        defaultSettings.homePrimaryCtaPath,
        120,
      ),
      secondaryCtaLabel: cleanText(
        setting.homeSecondaryCtaLabel,
        defaultSettings.homeSecondaryCtaLabel,
        80,
      ),
      secondaryCtaPath: cleanText(
        setting.homeSecondaryCtaPath,
        defaultSettings.homeSecondaryCtaPath,
        120,
      ),
      stats: parseHomeStats(setting.homeStats),
      whyEyebrow: cleanText(setting.homeWhyEyebrow, defaultSettings.homeWhyEyebrow, 80),
      whyTitle: cleanText(setting.homeWhyTitle, defaultSettings.homeWhyTitle, 140),
      whyDescription: cleanText(
        setting.homeWhyDescription,
        defaultSettings.homeWhyDescription,
        300,
      ),
      servicesEyebrow: cleanText(
        setting.homeServicesEyebrow,
        defaultSettings.homeServicesEyebrow,
        80,
      ),
      servicesTitle: cleanText(setting.homeServicesTitle, defaultSettings.homeServicesTitle, 140),
      servicesDescription: cleanText(
        setting.homeServicesDescription,
        defaultSettings.homeServicesDescription,
        300,
      ),
      aboutEyebrow: cleanText(setting.homeAboutEyebrow, defaultSettings.homeAboutEyebrow, 80),
      aboutTitle: cleanText(setting.homeAboutTitle, defaultSettings.homeAboutTitle, 160),
      aboutDescription: cleanText(
        setting.homeAboutDescription,
        defaultSettings.homeAboutDescription,
        700,
      ),
      aboutCtaLabel: cleanText(setting.homeAboutCtaLabel, defaultSettings.homeAboutCtaLabel, 80),
      projectsEyebrow: cleanText(
        setting.homeProjectsEyebrow,
        defaultSettings.homeProjectsEyebrow,
        80,
      ),
      projectsTitle: cleanText(setting.homeProjectsTitle, defaultSettings.homeProjectsTitle, 140),
      projectsDescription: cleanText(
        setting.homeProjectsDescription,
        defaultSettings.homeProjectsDescription,
        300,
      ),
      testimonialsEyebrow: cleanText(
        setting.homeTestimonialsEyebrow,
        defaultSettings.homeTestimonialsEyebrow,
        80,
      ),
      testimonialsTitle: cleanText(
        setting.homeTestimonialsTitle,
        defaultSettings.homeTestimonialsTitle,
        140,
      ),
      testimonialsDescription: cleanText(
        setting.homeTestimonialsDescription,
        defaultSettings.homeTestimonialsDescription,
        300,
      ),
      carouselImages: setting.homeCarouselImages.map((image) => ({
        imageUrl: image.imagePath,
        altText: cleanText(image.altText, "RRDS air-conditioning service work", 160),
        ...(cleanOptionalText(image.caption, 160)
          ? { caption: cleanOptionalText(image.caption, 160) ?? undefined }
          : {}),
        sortOrder: image.sortOrder,
      })),
    },
  };
}

function mapAdminSettings(setting: CompanySettingRecord) {
  const publicSettings = mapPublicSettings(setting);

  return {
    ...publicSettings,
    founder: {
      ...publicSettings.founder,
      expertise: parseFounderExpertise(setting.founderExpertise),
    },
    home: {
      ...publicSettings.home,
      carouselImages: setting.homeCarouselImages.map((image) => ({
        id: image.id,
        imageUrl: image.imagePath,
        altText: cleanText(image.altText, "RRDS air-conditioning service work", 160),
        caption: cleanOptionalText(image.caption, 160) ?? undefined,
        sortOrder: image.sortOrder,
      })),
    },
  };
}

async function getOrCreateSettingsRecord() {
  const existing = await prisma.companySetting.findFirst({
    orderBy: { createdAt: "asc" },
    include: { homeCarouselImages: { orderBy: { sortOrder: "asc" } } },
  });

  if (existing) {
    return existing;
  }

  return prisma.companySetting.create({
    data: defaultSettings,
    include: { homeCarouselImages: { orderBy: { sortOrder: "asc" } } },
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
    include: { homeCarouselImages: { orderBy: { sortOrder: "asc" } } },
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
    include: { homeCarouselImages: { orderBy: { sortOrder: "asc" } } },
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
    include: { homeCarouselImages: { orderBy: { sortOrder: "asc" } } },
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
    include: { homeCarouselImages: { orderBy: { sortOrder: "asc" } } },
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
    include: { homeCarouselImages: { orderBy: { sortOrder: "asc" } } },
  });

  await removeLocalFounderImage(previousImagePath);
  invalidatePublicSettingsCache();
  await logSettingsAudit(adminId, "FOUNDER_IMAGE_REMOVED", {
    imageConfigured: false,
  });

  return mapAdminSettings(updated);
}

export async function updateHomePageSettings(
  input: HomePageSettingsInput,
  adminId: string,
  role: AdminRole,
) {
  ensureCanWriteSettings(role);

  const setting = await getOrCreateSettingsRecord();
  const updated = await prisma.companySetting.update({
    where: { id: setting.id },
    data: {
      homeHeroEyebrow: cleanText(input.heroEyebrow, defaultSettings.homeHeroEyebrow, 120),
      homeHeroTitle: cleanText(input.heroTitle, defaultSettings.homeHeroTitle, 120),
      homeHeroSubtitle: cleanText(input.heroSubtitle, defaultSettings.homeHeroSubtitle, 300),
      homePrimaryCtaLabel: cleanText(
        input.primaryCtaLabel,
        defaultSettings.homePrimaryCtaLabel,
        80,
      ),
      homePrimaryCtaPath: cleanText(
        input.primaryCtaPath,
        defaultSettings.homePrimaryCtaPath,
        120,
      ),
      homeSecondaryCtaLabel: cleanText(
        input.secondaryCtaLabel,
        defaultSettings.homeSecondaryCtaLabel,
        80,
      ),
      homeSecondaryCtaPath: cleanText(
        input.secondaryCtaPath,
        defaultSettings.homeSecondaryCtaPath,
        120,
      ),
      homeStats: JSON.stringify(
        input.stats.map((stat) => ({
          label: cleanText(stat.label, "", 60),
          value: cleanText(stat.value, "", 60),
        })),
      ),
      homeWhyEyebrow: cleanText(input.whyEyebrow, defaultSettings.homeWhyEyebrow, 80),
      homeWhyTitle: cleanText(input.whyTitle, defaultSettings.homeWhyTitle, 140),
      homeWhyDescription: cleanText(
        input.whyDescription,
        defaultSettings.homeWhyDescription,
        300,
      ),
      homeServicesEyebrow: cleanText(
        input.servicesEyebrow,
        defaultSettings.homeServicesEyebrow,
        80,
      ),
      homeServicesTitle: cleanText(input.servicesTitle, defaultSettings.homeServicesTitle, 140),
      homeServicesDescription: cleanText(
        input.servicesDescription,
        defaultSettings.homeServicesDescription,
        300,
      ),
      homeAboutEyebrow: cleanText(input.aboutEyebrow, defaultSettings.homeAboutEyebrow, 80),
      homeAboutTitle: cleanText(input.aboutTitle, defaultSettings.homeAboutTitle, 160),
      homeAboutDescription: cleanText(
        input.aboutDescription,
        defaultSettings.homeAboutDescription,
        700,
      ),
      homeAboutCtaLabel: cleanText(
        input.aboutCtaLabel,
        defaultSettings.homeAboutCtaLabel,
        80,
      ),
      homeProjectsEyebrow: cleanText(
        input.projectsEyebrow,
        defaultSettings.homeProjectsEyebrow,
        80,
      ),
      homeProjectsTitle: cleanText(input.projectsTitle, defaultSettings.homeProjectsTitle, 140),
      homeProjectsDescription: cleanText(
        input.projectsDescription,
        defaultSettings.homeProjectsDescription,
        300,
      ),
      homeTestimonialsEyebrow: cleanText(
        input.testimonialsEyebrow,
        defaultSettings.homeTestimonialsEyebrow,
        80,
      ),
      homeTestimonialsTitle: cleanText(
        input.testimonialsTitle,
        defaultSettings.homeTestimonialsTitle,
        140,
      ),
      homeTestimonialsDescription: cleanText(
        input.testimonialsDescription,
        defaultSettings.homeTestimonialsDescription,
        300,
      ),
    },
    include: { homeCarouselImages: { orderBy: { sortOrder: "asc" } } },
  });

  invalidatePublicSettingsCache();
  await logSettingsAudit(adminId, "HOME_PAGE_SETTINGS_CHANGED");

  return mapAdminSettings(updated);
}

function assertHomeCarouselImage(file: Express.Multer.File | undefined) {
  if (!file) {
    throw new AppError("Home carousel image is required.", 400);
  }

  if (file.size > maxHomeImageSize) {
    throw new AppError("Home carousel image must be 5 MB or smaller.", 400);
  }

  const extension = path.extname(file.originalname).toLowerCase();
  const allowed: Record<string, string[]> = {
    "image/jpeg": [".jpg", ".jpeg"],
    "image/png": [".png"],
    "image/webp": [".webp"],
  };

  if (!allowed[file.mimetype]?.includes(extension)) {
    throw new AppError("Home carousel image must be a JPEG, PNG, or WebP file.", 400);
  }

  return extension === ".jpeg" ? ".jpg" : extension;
}

async function removeLocalHomeImage(imagePath: string | null | undefined) {
  if (!imagePath?.startsWith(`${homeUploadPublicPath}/`)) {
    return;
  }

  const filename = path.basename(imagePath);
  const resolved = path.resolve(homeUploadDirectory, filename);
  const relative = path.relative(homeUploadDirectory, resolved);

  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    return;
  }

  await fs.unlink(resolved).catch(() => undefined);
}

export async function uploadHomeCarouselImage(
  file: Express.Multer.File | undefined,
  input: HomeCarouselImageInput,
  adminId: string,
  role: AdminRole,
) {
  ensureCanWriteSettings(role);

  const extension = assertHomeCarouselImage(file);
  const setting = await getOrCreateSettingsRecord();
  const count = await prisma.homeCarouselImage.count({
    where: { companySettingId: setting.id },
  });

  if (count >= 12) {
    throw new AppError("Home carousel can contain up to 12 images.", 409);
  }

  const filename = `${crypto.randomUUID()}${extension}`;
  const publicPath = `${homeUploadPublicPath}/${filename}`;

  await fs.mkdir(homeUploadDirectory, { recursive: true });
  await fs.writeFile(path.join(homeUploadDirectory, filename), file!.buffer, {
    flag: "wx",
  });

  await prisma.homeCarouselImage.create({
    data: {
      companySettingId: setting.id,
      imagePath: publicPath,
      altText: cleanText(input.altText, "RRDS air-conditioning service work", 160),
      caption: cleanOptionalText(input.caption, 160),
      sortOrder: count + 1,
    },
    select: { id: true },
  });

  invalidatePublicSettingsCache();
  await logSettingsAudit(adminId, "HOME_CAROUSEL_IMAGE_UPLOADED", { imageCount: count + 1 });

  return getAdminPublicProfileSettings();
}

export async function updateHomeCarouselImage(
  imageId: string,
  input: HomeCarouselImageInput,
  adminId: string,
  role: AdminRole,
) {
  ensureCanWriteSettings(role);

  await prisma.homeCarouselImage.update({
    where: { id: imageId },
    data: {
      altText: cleanText(input.altText, "RRDS air-conditioning service work", 160),
      caption: cleanOptionalText(input.caption, 160),
    },
    select: { id: true },
  });

  invalidatePublicSettingsCache();
  await logSettingsAudit(adminId, "HOME_CAROUSEL_IMAGE_CHANGED");

  return getAdminPublicProfileSettings();
}

export async function deleteHomeCarouselImage(
  imageId: string,
  adminId: string,
  role: AdminRole,
) {
  ensureCanWriteSettings(role);

  const image = await prisma.homeCarouselImage.findUnique({
    where: { id: imageId },
  });

  if (!image) {
    throw new AppError("Home carousel image not found.", 404);
  }

  await prisma.homeCarouselImage.delete({ where: { id: imageId }, select: { id: true } });
  await removeLocalHomeImage(image.imagePath);

  const remainingImages = await prisma.homeCarouselImage.findMany({
    where: { companySettingId: image.companySettingId },
    orderBy: { sortOrder: "asc" },
    select: { id: true },
  });

  await prisma.$transaction(
    remainingImages.map((remainingImage, index) =>
      prisma.homeCarouselImage.update({
        where: { id: remainingImage.id },
        data: { sortOrder: index + 1 },
        select: { id: true },
      }),
    ),
  );

  invalidatePublicSettingsCache();
  await logSettingsAudit(adminId, "HOME_CAROUSEL_IMAGE_REMOVED");

  return getAdminPublicProfileSettings();
}

export async function reorderHomeCarouselImages(
  input: HomeCarouselReorderInput,
  adminId: string,
  role: AdminRole,
) {
  ensureCanWriteSettings(role);

  const setting = await getOrCreateSettingsRecord();
  const existingImages = await prisma.homeCarouselImage.findMany({
    where: { companySettingId: setting.id },
    select: { id: true },
  });
  const existingIds = new Set(existingImages.map((image) => image.id));

  if (
    input.imageIds.length !== existingImages.length ||
    input.imageIds.some((imageId) => !existingIds.has(imageId))
  ) {
    throw new AppError("Invalid carousel image order.", 400);
  }

  await prisma.$transaction(
    input.imageIds.map((imageId, index) =>
      prisma.homeCarouselImage.update({
        where: { id: imageId },
        data: { sortOrder: index + 1 },
        select: { id: true },
      }),
    ),
  );

  invalidatePublicSettingsCache();
  await logSettingsAudit(adminId, "HOME_CAROUSEL_IMAGES_REORDERED", {
    imageCount: input.imageIds.length,
  });

  return getAdminPublicProfileSettings();
}
