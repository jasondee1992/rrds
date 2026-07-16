import type { ApiResponse } from "../types/api-response";

export function successResponse<T>(
  message: string,
  data?: T,
): ApiResponse<T> {
  return data === undefined
    ? { success: true, message }
    : { success: true, message, data };
}

export function errorResponse(message: string): ApiResponse {
  return {
    success: false,
    message,
  };
}
