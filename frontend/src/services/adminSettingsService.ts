import type { ApiResponse } from "../types/api";
import type { SiteSettings } from "../types/siteSettings";
import { apiClient } from "./api";

export type CompanyInformationPayload = {
  companyName: string;
  contactNumber: string;
  contactEmail: string;
  businessAddress: string;
};

export type SocialLinksPayload = {
  facebookUrl?: string;
  linkedinUrl?: string;
};

export type FounderProfilePayload = {
  founderName: string;
  founderRole: string;
  founderExperienceYears: string;
  founderCurrentResponsibility: string;
  founderShortBiography: string;
  founderFullBiography: string;
  founderExpertise: string[];
};

export type HomePageSettingsPayload = {
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
};

export type AboutPageSettingsPayload = {
  heroEyebrow: string;
  heroTitle: string;
  heroDescription: string;
  introTitle: string;
  introParagraphs: string[];
  commitmentTitle: string;
  commitmentDescription: string;
  missionTitle: string;
  missionDescription: string;
  visionTitle: string;
  visionDescription: string;
  valuesEyebrow: string;
  valuesTitle: string;
  valuesDescription: string;
  coreValues: string[];
  whyEyebrow: string;
  whyTitle: string;
  whyDescription: string;
  whyItems: Array<{
    title: string;
    description: string;
  }>;
  finalTitle: string;
  finalDescription: string;
};

export type PublicServicePayload = {
  name: string;
  summary: string;
  description: string;
  isActive?: boolean;
};

type SettingsResponse = ApiResponse<{ settings: SiteSettings }>;

function requireSettings(response: SettingsResponse) {
  if (!response.data?.settings) {
    throw new Error("Missing settings response data.");
  }

  return response.data.settings;
}

export async function getAdminPublicProfileSettings() {
  const response = await apiClient.get<SettingsResponse>("/admin/settings/public-profile");

  return requireSettings(response.data);
}

export async function updateCompanyInformation(payload: CompanyInformationPayload) {
  const response = await apiClient.patch<SettingsResponse>(
    "/admin/settings/company-information",
    payload,
  );

  return requireSettings(response.data);
}

export async function updateSocialLinks(payload: SocialLinksPayload) {
  const response = await apiClient.patch<SettingsResponse>(
    "/admin/settings/social-links",
    payload,
  );

  return requireSettings(response.data);
}

export async function updateFounderProfile(payload: FounderProfilePayload) {
  const response = await apiClient.patch<SettingsResponse>(
    "/admin/settings/founder-profile",
    payload,
  );

  return requireSettings(response.data);
}

export async function uploadFounderProfileImage(file: File) {
  const formData = new FormData();
  formData.append("image", file);

  const response = await apiClient.post<SettingsResponse>(
    "/admin/settings/founder-profile/image",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );

  return requireSettings(response.data);
}

export async function removeFounderProfileImage() {
  const response = await apiClient.delete<SettingsResponse>(
    "/admin/settings/founder-profile/image",
  );

  return requireSettings(response.data);
}

export async function updateHomePageSettings(payload: HomePageSettingsPayload) {
  const response = await apiClient.patch<SettingsResponse>(
    "/admin/settings/home-page",
    payload,
  );

  return requireSettings(response.data);
}

export async function updateAboutPageSettings(payload: AboutPageSettingsPayload) {
  const response = await apiClient.patch<SettingsResponse>(
    "/admin/settings/about-page",
    payload,
  );

  return requireSettings(response.data);
}

export async function updatePublicService(serviceKey: string, payload: PublicServicePayload) {
  const response = await apiClient.patch<SettingsResponse>(
    `/admin/settings/services/${serviceKey}`,
    payload,
  );

  return requireSettings(response.data);
}

export async function uploadPublicServiceImage(serviceKey: string, file: File) {
  const formData = new FormData();
  formData.append("image", file);

  const response = await apiClient.post<SettingsResponse>(
    `/admin/settings/services/${serviceKey}/image`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );

  return requireSettings(response.data);
}

export async function removePublicServiceImage(serviceKey: string) {
  const response = await apiClient.delete<SettingsResponse>(
    `/admin/settings/services/${serviceKey}/image`,
  );

  return requireSettings(response.data);
}

export async function uploadHomeCarouselImage(file: File, altText: string, caption: string) {
  const formData = new FormData();
  formData.append("image", file);
  formData.append("altText", altText);
  formData.append("caption", caption);

  const response = await apiClient.post<SettingsResponse>(
    "/admin/settings/home-page/carousel-images",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );

  return requireSettings(response.data);
}

export async function updateHomeCarouselImage(
  imageId: string,
  payload: { altText: string; caption?: string },
) {
  const response = await apiClient.patch<SettingsResponse>(
    `/admin/settings/home-page/carousel-images/${imageId}`,
    payload,
  );

  return requireSettings(response.data);
}

export async function deleteHomeCarouselImage(imageId: string) {
  const response = await apiClient.delete<SettingsResponse>(
    `/admin/settings/home-page/carousel-images/${imageId}`,
  );

  return requireSettings(response.data);
}

export async function reorderHomeCarouselImages(imageIds: string[]) {
  const response = await apiClient.patch<SettingsResponse>(
    "/admin/settings/home-page/carousel-images/reorder",
    { imageIds },
  );

  return requireSettings(response.data);
}
