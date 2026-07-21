import type { ApiResponse } from "../types/api";
import type {
  QuotationDetails,
  QuotationListFilters,
  QuotationListResponse,
} from "../types/quotation";
import { apiClient } from "./api";

function cleanParams(filters: QuotationListFilters) {
  return Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== undefined && value !== ""),
  );
}

export async function getAdminQuotations(filters: QuotationListFilters) {
  const response = await apiClient.get<ApiResponse<QuotationListResponse>>(
    "/admin/quotations",
    {
      params: cleanParams(filters),
    },
  );

  if (!response.data.data) {
    throw new Error("Missing quotation list response data.");
  }

  return response.data.data;
}

export async function getAdminQuotationDetails(id: string) {
  const response = await apiClient.get<ApiResponse<{ quotation: QuotationDetails }>>(
    `/admin/quotations/${id}`,
  );

  if (!response.data.data) {
    throw new Error("Missing quotation details response data.");
  }

  return response.data.data.quotation;
}
