import type { ApiResponse } from "../types/api";
import type { PublicContactPayload, PublicContactResponse } from "../types/inquiry";
import { apiClient } from "./api";

export async function submitPublicContact(payload: PublicContactPayload) {
  const response = await apiClient.post<ApiResponse<PublicContactResponse>>(
    "/public/contact",
    payload,
  );

  if (!response.data.data) {
    throw new Error("Missing contact submission response data.");
  }

  return response.data.data;
}
