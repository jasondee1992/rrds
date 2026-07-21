import type { ApiResponse } from "../types/api";
import type {
  AdminEstimateStatus,
  EstimateDetails,
  EstimateListFilters,
  EstimateListResponse,
} from "../types/estimate";
import { apiClient } from "./api";

function cleanParams(filters: EstimateListFilters) {
  return Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== undefined && value !== ""),
  );
}

export async function getAdminEstimates(filters: EstimateListFilters) {
  const response = await apiClient.get<ApiResponse<EstimateListResponse>>(
    "/admin/estimates",
    {
      params: cleanParams(filters),
    },
  );

  if (!response.data.data) {
    throw new Error("Missing estimate list response data.");
  }

  return response.data.data;
}

export async function getAdminEstimateDetails(id: string) {
  const response = await apiClient.get<ApiResponse<{ estimate: EstimateDetails }>>(
    `/admin/estimates/${id}`,
  );

  if (!response.data.data) {
    throw new Error("Missing estimate details response data.");
  }

  return response.data.data.estimate;
}

export async function updateAdminEstimateStatus(id: string, status: AdminEstimateStatus) {
  const response = await apiClient.patch<
    ApiResponse<{ estimate: Pick<EstimateDetails, "id" | "estimateNumber" | "status" | "updatedAt"> }>
  >(`/admin/estimates/${id}/status`, { status });

  if (!response.data.data) {
    throw new Error("Missing estimate status response data.");
  }

  return response.data.data.estimate;
}

export async function updateAdminEstimateNotes(id: string, internalNotes: string) {
  const response = await apiClient.patch<
    ApiResponse<{ estimate: Pick<EstimateDetails, "id" | "estimateNumber" | "internalNotes" | "updatedAt"> }>
  >(`/admin/estimates/${id}/notes`, { internalNotes });

  if (!response.data.data) {
    throw new Error("Missing estimate notes response data.");
  }

  return response.data.data.estimate;
}
