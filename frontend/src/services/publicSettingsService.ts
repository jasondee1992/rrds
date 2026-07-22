import type { ApiResponse } from "../types/api";
import type { SiteSettings } from "../types/siteSettings";
import { apiClient } from "./api";

export async function getPublicSiteSettings() {
  const response = await apiClient.get<ApiResponse<SiteSettings>>("/public/site-settings");

  if (!response.data.data) {
    throw new Error("Missing public site settings response data.");
  }

  return response.data.data;
}
