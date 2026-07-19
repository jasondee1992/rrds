import bcrypt from "bcrypt";
import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma";
import { errorResponse, successResponse } from "../utils/apiResponse";
import { signAdminAccessToken } from "../utils/jwt";

const loginSchema = z.object({
  email: z.email().trim().toLowerCase(),
  password: z.string().min(1),
});

const invalidCredentialsMessage = "Invalid email or password.";

export async function loginAdmin(req: Request, res: Response) {
  const parsedBody = loginSchema.safeParse(req.body);

  if (!parsedBody.success) {
    res.status(400).json(errorResponse(invalidCredentialsMessage));
    return;
  }

  const { email, password } = parsedBody.data;

  const admin = await prisma.adminUser.findUnique({
    where: { email },
  });

  if (!admin || !admin.isActive) {
    res.status(401).json(errorResponse(invalidCredentialsMessage));
    return;
  }

  const isPasswordValid = await bcrypt.compare(password, admin.passwordHash);

  if (!isPasswordValid) {
    res.status(401).json(errorResponse(invalidCredentialsMessage));
    return;
  }

  const updatedAdmin = await prisma.adminUser.update({
    where: { id: admin.id },
    data: { lastLoginAt: new Date() },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      lastLoginAt: true,
    },
  });

  const accessToken = signAdminAccessToken(updatedAdmin);

  res.json(
    successResponse("Admin login successful", {
      admin: updatedAdmin,
      accessToken,
    }),
  );
}

export function getCurrentAdmin(req: Request, res: Response) {
  res.json(successResponse("Authenticated admin retrieved", { admin: req.admin }));
}

export function logoutAdmin(_req: Request, res: Response) {
  res.json(
    successResponse("Admin logout successful", {
      message: "JWT logout is stateless. Remove the access token from the client.",
    }),
  );
}
