import type { ApiResponse } from "../types/api";
import type {
  EstimateOptions,
  PublicEstimatePayload,
  PublicEstimateResult,
} from "../types/estimate";
import { apiClient } from "./api";

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
