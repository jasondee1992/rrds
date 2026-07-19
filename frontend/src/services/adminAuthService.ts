import { apiClient } from "./api";
import type { ApiResponse } from "../types/api";
import type { AdminLoginResponse, AuthenticatedAdmin } from "../types/admin";

export async function loginAdmin(credentials: { email: string; password: string }) {
  const response = await apiClient.post<ApiResponse<AdminLoginResponse>>(
    "/admin/auth/login",
    credentials,
  );

  if (!response.data.data) {
    throw new Error("Missing login response data.");
  }

  return response.data.data;
}

export async function getCurrentAdmin() {
  const response = await apiClient.get<ApiResponse<{ admin: AuthenticatedAdmin }>>(
    "/admin/auth/me",
  );

  if (!response.data.data) {
    throw new Error("Missing current admin response data.");
  }

  return response.data.data.admin;
}

export async function logoutAdmin() {
  await apiClient.post("/admin/auth/logout");
}
