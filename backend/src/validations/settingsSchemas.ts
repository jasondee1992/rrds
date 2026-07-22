import { z } from "zod";

const requiredText = (fieldName: string, maxLength: number) =>
  z
    .string()
    .trim()
    .min(1, `${fieldName} is required.`)
    .max(maxLength, `${fieldName} must be ${maxLength} characters or fewer.`);

const optionalText = (maxLength: number) =>
  z
    .string()
    .trim()
    .max(maxLength)
    .optional()
    .transform((value) => value || undefined);

function isAllowedHttpsUrl(value: string | undefined, allowedDomains: string[]) {
  if (!value) {
    return true;
  }

  try {
    const url = new URL(value);
    const hostname = url.hostname.toLowerCase();

    return url.protocol === "https:" && allowedDomains.includes(hostname);
  } catch {
    return false;
  }
}

export const companyInformationSchema = z.object({
  companyName: requiredText("Company name", 120),
  contactNumber: requiredText("Contact number", 40),
  contactEmail: z.email("Email must be valid.").trim().toLowerCase().max(160),
  businessAddress: requiredText("Business address", 300),
});

export const socialLinksSchema = z.object({
  facebookUrl: optionalText(240).refine(
    (value) => isAllowedHttpsUrl(value, ["facebook.com", "www.facebook.com", "fb.com"]),
    "Facebook URL must be a valid HTTPS Facebook URL.",
  ),
  linkedinUrl: optionalText(240).refine(
    (value) => isAllowedHttpsUrl(value, ["linkedin.com", "www.linkedin.com"]),
    "LinkedIn URL must be a valid HTTPS LinkedIn URL.",
  ),
});

export const founderProfileSchema = z.object({
  founderName: requiredText("Founder name", 120),
  founderRole: requiredText("Professional title", 140),
  founderExperienceYears: requiredText("Years of experience", 30),
  founderCurrentResponsibility: requiredText("Current responsibility", 240),
  founderShortBiography: requiredText("Short biography", 800),
  founderFullBiography: requiredText("Full biography", 5000),
  founderExpertise: z
    .array(requiredText("Expertise", 120))
    .min(1, "Add at least one expertise item.")
    .max(20, "Expertise list is too long.")
    .superRefine((items, context) => {
      const normalized = new Set<string>();

      items.forEach((item, index) => {
        const key = item.toLowerCase();

        if (normalized.has(key)) {
          context.addIssue({
            code: "custom",
            message: "Expertise items must be unique.",
            path: [index],
          });
        }

        normalized.add(key);
      });
    }),
});

const routePath = z
  .string()
  .trim()
  .min(1)
  .max(120)
  .regex(/^\/[A-Za-z0-9/_-]*$/, "CTA path must be an internal route.");

const homeStatSchema = z.object({
  label: requiredText("Stat label", 60),
  value: requiredText("Stat value", 60),
});

export const homePageSettingsSchema = z.object({
  heroEyebrow: requiredText("Hero eyebrow", 120),
  heroTitle: requiredText("Hero title", 120),
  heroSubtitle: requiredText("Hero subtitle", 300),
  primaryCtaLabel: requiredText("Primary button label", 80),
  primaryCtaPath: routePath,
  secondaryCtaLabel: requiredText("Secondary button label", 80),
  secondaryCtaPath: routePath,
  stats: z.array(homeStatSchema).min(1).max(6),
  whyEyebrow: requiredText("Why section eyebrow", 80),
  whyTitle: requiredText("Why section title", 140),
  whyDescription: requiredText("Why section description", 300),
  servicesEyebrow: requiredText("Services eyebrow", 80),
  servicesTitle: requiredText("Services title", 140),
  servicesDescription: requiredText("Services description", 300),
  aboutEyebrow: requiredText("About eyebrow", 80),
  aboutTitle: requiredText("About title", 160),
  aboutDescription: requiredText("About description", 700),
  aboutCtaLabel: requiredText("About button label", 80),
  projectsEyebrow: requiredText("Projects eyebrow", 80),
  projectsTitle: requiredText("Projects title", 140),
  projectsDescription: requiredText("Projects description", 300),
  testimonialsEyebrow: requiredText("Testimonials eyebrow", 80),
  testimonialsTitle: requiredText("Testimonials title", 140),
  testimonialsDescription: requiredText("Testimonials description", 300),
});

export const homeCarouselImageParamSchema = z.object({
  imageId: z.uuid("Invalid carousel image ID."),
});

export const homeCarouselImageSchema = z.object({
  altText: requiredText("Image alt text", 160),
  caption: optionalText(160),
});

export const homeCarouselReorderSchema = z.object({
  imageIds: z.array(z.uuid("Invalid carousel image ID.")).min(1).max(20),
});

export type CompanyInformationInput = z.infer<typeof companyInformationSchema>;
export type SocialLinksInput = z.infer<typeof socialLinksSchema>;
export type FounderProfileInput = z.infer<typeof founderProfileSchema>;
export type HomePageSettingsInput = z.infer<typeof homePageSettingsSchema>;
export type HomeCarouselImageInput = z.infer<typeof homeCarouselImageSchema>;
export type HomeCarouselReorderInput = z.infer<typeof homeCarouselReorderSchema>;
