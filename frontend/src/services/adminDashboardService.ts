import { apiClient } from "./api";
import type { ApiResponse } from "../types/api";
import type { AdminDashboardSummary } from "../types/admin";

export async function getAdminDashboardSummary() {
  const response = await apiClient.get<ApiResponse<AdminDashboardSummary>>(
    "/admin/dashboard/summary",
  );

  if (!response.data.data) {
    throw new Error("Missing dashboard summary response data.");
  }

  return response.data.data;
}
