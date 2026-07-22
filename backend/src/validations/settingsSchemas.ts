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

export type CompanyInformationInput = z.infer<typeof companyInformationSchema>;
export type SocialLinksInput = z.infer<typeof socialLinksSchema>;
export type FounderProfileInput = z.infer<typeof founderProfileSchema>;
