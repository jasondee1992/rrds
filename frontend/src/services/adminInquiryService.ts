import { AxiosError } from "axios";
import type { ApiResponse } from "../types/api";
import type {
  CustomerSummary,
  InquiryDetails,
  InquiryListFilters,
  InquiryListResponse,
  InquiryStatus,
} from "../types/inquiry";
import { apiClient } from "./api";

function cleanParams(filters: InquiryListFilters) {
  return Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== undefined && value !== ""),
  );
}

export async function getAdminInquiries(filters: InquiryListFilters) {
  const response = await apiClient.get<ApiResponse<InquiryListResponse>>("/admin/inquiries", {
    params: cleanParams(filters),
  });

  if (!response.data.data) {
    throw new Error("Missing inquiry list response data.");
  }

  return response.data.data;
}

export async function getAdminInquiryDetails(id: string) {
  const response = await apiClient.get<ApiResponse<{ inquiry: InquiryDetails }>>(
    `/admin/inquiries/${id}`,
  );

  if (!response.data.data) {
    throw new Error("Missing inquiry details response data.");
  }

  return response.data.data.inquiry;
}

export async function updateAdminInquiryStatus(id: string, status: InquiryStatus) {
  const response = await apiClient.patch<
    ApiResponse<{ inquiry: Pick<InquiryDetails, "id" | "referenceNumber" | "status" | "updatedAt"> }>
  >(`/admin/inquiries/${id}/status`, { status });

  if (!response.data.data) {
    throw new Error("Missing inquiry status response data.");
  }

  return response.data.data.inquiry;
}

export async function updateAdminInquiryNotes(id: string, internalNotes: string) {
  const response = await apiClient.patch<
    ApiResponse<{ inquiry: Pick<InquiryDetails, "id" | "referenceNumber" | "internalNotes" | "updatedAt"> }>
  >(`/admin/inquiries/${id}/notes`, { internalNotes });

  if (!response.data.data) {
    throw new Error("Missing inquiry notes response data.");
  }

  return response.data.data.inquiry;
}

export async function getAdminInquiryCustomerMatches(
  id: string,
  search: string,
) {
  const response = await apiClient.get<ApiResponse<{ customers: CustomerSummary[] }>>(
    `/admin/inquiries/${id}/customer-matches`,
    {
      params: cleanParams({ page: 1, limit: 10, search }),
    },
  );

  if (!response.data.data) {
    throw new Error("Missing customer matches response data.");
  }

  return response.data.data.customers;
}

export async function linkAdminInquiryCustomer(id: string, customerId: string) {
  const response = await apiClient.patch<ApiResponse<{ customer: CustomerSummary }>>(
    `/admin/inquiries/${id}/link-customer`,
    { customerId },
  );

  if (!response.data.data) {
    throw new Error("Missing linked customer response data.");
  }

  return response.data.data.customer;
}

export async function createCustomerFromAdminInquiry(id: string) {
  try {
    const response = await apiClient.post<ApiResponse<{ customer: CustomerSummary }>>(
      `/admin/inquiries/${id}/create-customer`,
    );

    if (!response.data.data) {
      throw new Error("Missing created customer response data.");
    }

    return {
      created: true as const,
      customer: response.data.data.customer,
      matches: [],
    };
  } catch (error) {
    if (error instanceof AxiosError && error.response?.status === 409) {
      const data = error.response.data as ApiResponse<{ matches?: CustomerSummary[] }>;

      return {
        created: false as const,
        customer: null,
        matches: data.data?.matches ?? [],
      };
    }

    throw error;
  }
}
