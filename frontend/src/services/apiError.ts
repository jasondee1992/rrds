import { AxiosError } from "axios";
import type { ApiResponse } from "../types/api";

export function getSafeApiErrorMessage(error: unknown, fallback: string) {
  if (error instanceof AxiosError) {
    const responseData = error.response?.data as ApiResponse | undefined;

    if (responseData?.message) {
      return responseData.message;
    }
  }

  return fallback;
}
