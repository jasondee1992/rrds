import type { AdminRole } from "@prisma/client";
import jwt, { type SignOptions } from "jsonwebtoken";
import { z } from "zod";
import { env } from "../config/env";

const adminTokenPayloadSchema = z.object({
  sub: z.string().uuid(),
  role: z.enum(["SUPER_ADMIN", "ADMIN", "STAFF"]),
});

export type AdminTokenPayload = z.infer<typeof adminTokenPayloadSchema>;

export function signAdminAccessToken(admin: { id: string; role: AdminRole }) {
  const payload: AdminTokenPayload = {
    sub: admin.id,
    role: admin.role,
  };

  const options: SignOptions = {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"],
  };

  return jwt.sign(payload, env.JWT_SECRET, options);
}

export function verifyAdminAccessToken(token: string): AdminTokenPayload | null {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);

    if (typeof decoded === "string") {
      return null;
    }

    const parsedPayload = adminTokenPayloadSchema.safeParse(decoded);

    return parsedPayload.success ? parsedPayload.data : null;
  } catch {
    return null;
  }
}
