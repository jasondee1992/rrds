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
