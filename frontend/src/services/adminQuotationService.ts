import type { ApiResponse } from "../types/api";
import type {
  QuotationCustomerOption,
  QuotationDefaults,
  QuotationDetails,
  QuotationListFilters,
  QuotationListResponse,
  QuotationPayload,
  QuotationStatus,
  QuotationUpdatePayload,
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

export async function getAdminQuotationDefaults() {
  const response = await apiClient.get<ApiResponse<{ defaults: QuotationDefaults }>>(
    "/admin/quotations/defaults",
  );

  if (!response.data.data) {
    throw new Error("Missing quotation defaults response data.");
  }

  return response.data.data.defaults;
}

export async function getAdminQuotationCustomers(search = "") {
  const response = await apiClient.get<
    ApiResponse<{ records: QuotationCustomerOption[] }>
  >("/admin/quotations/customers", {
    params: search ? { search } : undefined,
  });

  if (!response.data.data) {
    throw new Error("Missing quotation customers response data.");
  }

  return response.data.data.records;
}

export async function createAdminQuotation(payload: QuotationPayload) {
  const response = await apiClient.post<
    ApiResponse<{
      quotation: Pick<QuotationDetails, "id" | "quotationNumber" | "status" | "grandTotal">;
    }>
  >("/admin/quotations", payload);

  if (!response.data.data) {
    throw new Error("Missing quotation creation response data.");
  }

  return response.data.data.quotation;
}

export async function updateAdminQuotation(id: string, payload: QuotationUpdatePayload) {
  const response = await apiClient.patch<ApiResponse<{ quotation: QuotationDetails }>>(
    `/admin/quotations/${id}`,
    payload,
  );

  if (!response.data.data) {
    throw new Error("Missing quotation update response data.");
  }

  return response.data.data.quotation;
}

export async function updateAdminQuotationStatus(
  id: string,
  status: Extract<QuotationStatus, "DRAFT" | "READY" | "CANCELLED">,
  updatedAt: string,
) {
  const response = await apiClient.patch<
    ApiResponse<{
      quotation: Pick<QuotationDetails, "id" | "quotationNumber" | "status" | "updatedAt">;
    }>
  >(`/admin/quotations/${id}/status`, { status, updatedAt });

  if (!response.data.data) {
    throw new Error("Missing quotation status response data.");
  }

  return response.data.data.quotation;
}

export async function duplicateAdminQuotation(id: string) {
  const response = await apiClient.post<
    ApiResponse<{
      quotation: Pick<QuotationDetails, "id" | "quotationNumber" | "status" | "grandTotal">;
    }>
  >(`/admin/quotations/${id}/duplicate`);

  if (!response.data.data) {
    throw new Error("Missing quotation duplicate response data.");
  }

  return response.data.data.quotation;
}

export async function fetchAdminQuotationPdf(
  id: string,
  mode: "inline" | "download",
) {
  const response = await apiClient.get<Blob>(`/admin/quotations/${id}/pdf`, {
    params: { mode },
    responseType: "blob",
  });

  return response.data;
}
