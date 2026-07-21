import type { ApiResponse } from "../types/api";
import type {
  AdminEstimateStatus,
  EstimateConversionResult,
  EstimateDetails,
  EstimatePublicAccess,
  EstimateReviewPayload,
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

export async function startAdminEstimateReview(id: string) {
  const response = await apiClient.post<
    ApiResponse<{ estimate: Pick<EstimateDetails, "id" | "estimateNumber" | "status" | "reviewedAt" | "updatedAt"> }>
  >(`/admin/estimates/${id}/start-review`);

  if (!response.data.data) {
    throw new Error("Missing estimate review response data.");
  }

  return response.data.data.estimate;
}

export async function saveAdminEstimateReview(id: string, payload: EstimateReviewPayload) {
  const response = await apiClient.put<ApiResponse<{ revision: EstimateDetails["latestRevision"] }>>(
    `/admin/estimates/${id}/review`,
    payload,
  );

  if (!response.data.data) {
    throw new Error("Missing estimate review response data.");
  }

  return response.data.data.revision;
}

export async function markAdminEstimateReady(id: string) {
  const response = await apiClient.post<
    ApiResponse<{ estimate: Pick<EstimateDetails, "id" | "estimateNumber" | "status" | "updatedAt"> }>
  >(`/admin/estimates/${id}/mark-ready`);

  if (!response.data.data) {
    throw new Error("Missing estimate ready response data.");
  }

  return response.data.data.estimate;
}

export async function cancelAdminEstimate(id: string) {
  const response = await apiClient.post<
    ApiResponse<{ estimate: Pick<EstimateDetails, "id" | "estimateNumber" | "status" | "updatedAt"> }>
  >(`/admin/estimates/${id}/cancel`);

  if (!response.data.data) {
    throw new Error("Missing estimate cancellation response data.");
  }

  return response.data.data.estimate;
}

export async function convertAdminEstimateToQuotation(id: string) {
  const response = await apiClient.post<ApiResponse<EstimateConversionResult>>(
    `/admin/estimates/${id}/convert-to-quotation`,
  );

  if (!response.data.data) {
    throw new Error("Missing estimate conversion response data.");
  }

  return response.data.data;
}

export async function fetchAdminEstimatePdf(
  id: string,
  mode: "download" | "inline" = "download",
) {
  const response = await apiClient.get<Blob>(
    `/admin/estimates/${encodeURIComponent(id)}/pdf`,
    {
      params: { mode },
      responseType: "blob",
    },
  );

  return response.data;
}

export async function regenerateAdminEstimatePublicAccessToken(id: string) {
  const response = await apiClient.post<
    ApiResponse<{
      publicAccess: {
        publicAccessToken: string;
        publicUrl: string;
        expiresAt: string;
      };
    }>
  >(`/admin/estimates/${id}/public-access-token`);

  if (!response.data.data) {
    throw new Error("Missing public access token response data.");
  }

  return response.data.data.publicAccess;
}

export async function disableAdminEstimatePublicAccessToken(id: string) {
  const response = await apiClient.delete<
    ApiResponse<{ publicAccess: { estimateNumber: string; disabled: boolean } }>
  >(`/admin/estimates/${id}/public-access-token`);

  if (!response.data.data) {
    throw new Error("Missing public access disable response data.");
  }

  return response.data.data.publicAccess;
}

export function mergePublicAccess(
  current: EstimatePublicAccess,
  update: Partial<EstimatePublicAccess>,
) {
  return {
    ...current,
    ...update,
  };
}
