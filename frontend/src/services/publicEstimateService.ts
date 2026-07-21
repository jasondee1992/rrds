import type { ApiResponse } from "../types/api";
import type {
  EstimateOptions,
  PublicEstimateDocument,
  PublicEstimatePayload,
  PublicEstimateResult,
} from "../types/estimate";
import { API_BASE_URL, apiClient } from "./api";

export async function getPublicEstimateOptions() {
  const response = await apiClient.get<ApiResponse<EstimateOptions>>(
    "/public/estimate-options",
  );

  if (!response.data.data) {
    throw new Error("Missing estimate options response data.");
  }

  return response.data.data;
}

export async function submitPublicEstimate(payload: PublicEstimatePayload) {
  const response = await apiClient.post<ApiResponse<PublicEstimateResult>>(
    "/public/estimates",
    payload,
  );

  if (!response.data.data) {
    throw new Error("Missing estimate submission response data.");
  }

  return response.data.data;
}

export async function getPublicEstimateAccess(token: string) {
  const response = await apiClient.get<ApiResponse<{ estimate: PublicEstimateDocument }>>(
    `/public/estimates/access/${encodeURIComponent(token)}`,
  );

  if (!response.data.data) {
    throw new Error("Missing public estimate response data.");
  }

  return response.data.data.estimate;
}

export function getPublicEstimatePdfUrl(token: string, mode: "download" | "inline" = "download") {
  return `${API_BASE_URL}/public/estimates/access/${encodeURIComponent(token)}/pdf?mode=${mode}`;
}
