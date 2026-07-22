import { AdminRole } from "@prisma/client";
import type { Request, Response } from "express";
import {
  getAdminPublicProfileSettings,
  getPublicSiteSettings,
  removeFounderImage,
  updateCompanyInformation,
  updateFounderProfile,
  updateSocialLinks,
  uploadFounderImage,
} from "../services/settingsService";
import { errorResponse, successResponse } from "../utils/apiResponse";
import {
  companyInformationSchema,
  founderProfileSchema,
  socialLinksSchema,
} from "../validations/settingsSchemas";

export async function getPublicSiteSettingsController(_req: Request, res: Response) {
  const settings = await getPublicSiteSettings();

  res.json(successResponse("Public site settings retrieved", settings));
}

export async function getAdminPublicProfileSettingsController(_req: Request, res: Response) {
  const settings = await getAdminPublicProfileSettings();

  res.json(successResponse("Public profile settings retrieved", { settings }));
}

export async function patchCompanyInformation(req: Request, res: Response) {
  const parsedBody = companyInformationSchema.safeParse(req.body);

  if (!parsedBody.success) {
    res.status(400).json(errorResponse("Invalid company information."));
    return;
  }

  const settings = await updateCompanyInformation(
    parsedBody.data,
    req.admin?.id ?? "",
    req.admin?.role ?? AdminRole.STAFF,
  );

  res.json(successResponse("Company information saved", { settings }));
}

export async function patchSocialLinks(req: Request, res: Response) {
  const parsedBody = socialLinksSchema.safeParse(req.body);

  if (!parsedBody.success) {
    res.status(400).json(errorResponse("Invalid social media links."));
    return;
  }

  const settings = await updateSocialLinks(
    parsedBody.data,
    req.admin?.id ?? "",
    req.admin?.role ?? AdminRole.STAFF,
  );

  res.json(successResponse("Social links saved", { settings }));
}

export async function patchFounderProfile(req: Request, res: Response) {
  const parsedBody = founderProfileSchema.safeParse(req.body);

  if (!parsedBody.success) {
    res.status(400).json(errorResponse("Invalid founder profile."));
    return;
  }

  const settings = await updateFounderProfile(
    parsedBody.data,
    req.admin?.id ?? "",
    req.admin?.role ?? AdminRole.STAFF,
  );

  res.json(successResponse("Founder profile saved", { settings }));
}

export async function postFounderProfileImage(req: Request, res: Response) {
  const settings = await uploadFounderImage(
    req.file,
    req.admin?.id ?? "",
    req.admin?.role ?? AdminRole.STAFF,
  );

  res.status(201).json(successResponse("Founder image uploaded", { settings }));
}

export async function deleteFounderProfileImage(req: Request, res: Response) {
  const settings = await removeFounderImage(
    req.admin?.id ?? "",
    req.admin?.role ?? AdminRole.STAFF,
  );

  res.json(successResponse("Founder image removed", { settings }));
}
