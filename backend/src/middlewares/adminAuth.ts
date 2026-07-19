import type { AdminRole } from "@prisma/client";
import type { NextFunction, Request, Response } from "express";
import { prisma } from "../config/prisma";
import { errorResponse } from "../utils/apiResponse";
import { verifyAdminAccessToken } from "../utils/jwt";

function getBearerToken(authorizationHeader: string | undefined) {
  if (!authorizationHeader) {
    return null;
  }

  const [scheme, token] = authorizationHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return null;
  }

  return token;
}

export async function authenticateAdmin(req: Request, res: Response, next: NextFunction) {
  const token = getBearerToken(req.headers.authorization);

  if (!token) {
    res.status(401).json(errorResponse("Unauthorized"));
    return;
  }

  const payload = verifyAdminAccessToken(token);

  if (!payload) {
    res.status(401).json(errorResponse("Unauthorized"));
    return;
  }

  const admin = await prisma.adminUser.findUnique({
    where: { id: payload.sub },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      isActive: true,
    },
  });

  if (!admin || !admin.isActive) {
    res.status(401).json(errorResponse("Unauthorized"));
    return;
  }

  req.admin = {
    id: admin.id,
    fullName: admin.fullName,
    email: admin.email,
    role: admin.role,
  };

  next();
}

export function authorizeRoles(...allowedRoles: AdminRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.admin || !allowedRoles.includes(req.admin.role)) {
      res.status(403).json(errorResponse("Forbidden"));
      return;
    }

    next();
  };
}
