import type { AdminRole } from "@prisma/client";

export type AuthenticatedAdmin = {
  id: string;
  fullName: string;
  email: string;
  role: AdminRole;
};
