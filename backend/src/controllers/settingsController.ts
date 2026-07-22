import { AdminRole } from "@prisma/client";
import type { Request, Response } from "express";
import {
  getAdminPublicProfileSettings,
  getPublicSiteSettings,
  deleteHomeCarouselImage,
  removeFounderImage,
  reorderHomeCarouselImages,
  updateHomeCarouselImage,
  updateAboutPageSettings,
  updateCompanyInformation,
  updateFounderProfile,
  updateHomePageSettings,
  updateSocialLinks,
  uploadFounderImage,
  uploadHomeCarouselImage,
} from "../services/settingsService";
import { errorResponse, successResponse } from "../utils/apiResponse";
import {
  companyInformationSchema,
  aboutPageSettingsSchema,
  founderProfileSchema,
  homeCarouselImageParamSchema,
  homeCarouselImageSchema,
  homeCarouselReorderSchema,
  homePageSettingsSchema,
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

export async function patchHomePageSettings(req: Request, res: Response) {
  const parsedBody = homePageSettingsSchema.safeParse(req.body);

  if (!parsedBody.success) {
    res.status(400).json(errorResponse("Invalid home page settings."));
    return;
  }

  const settings = await updateHomePageSettings(
    parsedBody.data,
    req.admin?.id ?? "",
    req.admin?.role ?? AdminRole.STAFF,
  );

  res.json(successResponse("Home page settings saved", { settings }));
}

export async function patchAboutPageSettings(req: Request, res: Response) {
  const parsedBody = aboutPageSettingsSchema.safeParse(req.body);

  if (!parsedBody.success) {
    res.status(400).json(errorResponse("Invalid about page settings."));
    return;
  }

  const settings = await updateAboutPageSettings(
    parsedBody.data,
    req.admin?.id ?? "",
    req.admin?.role ?? AdminRole.STAFF,
  );

  res.json(successResponse("About page settings saved", { settings }));
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

export async function postHomeCarouselImage(req: Request, res: Response) {
  const parsedBody = homeCarouselImageSchema.safeParse(req.body);

  if (!parsedBody.success) {
    res.status(400).json(errorResponse("Invalid carousel image details."));
    return;
  }

  const settings = await uploadHomeCarouselImage(
    req.file,
    parsedBody.data,
    req.admin?.id ?? "",
    req.admin?.role ?? AdminRole.STAFF,
  );

  res.status(201).json(successResponse("Home carousel image uploaded", { settings }));
}

export async function patchHomeCarouselImage(req: Request, res: Response) {
  const parsedParams = homeCarouselImageParamSchema.safeParse(req.params);

  if (!parsedParams.success) {
    res.status(400).json(errorResponse("Invalid carousel image ID."));
    return;
  }

  const parsedBody = homeCarouselImageSchema.safeParse(req.body);

  if (!parsedBody.success) {
    res.status(400).json(errorResponse("Invalid carousel image details."));
    return;
  }

  const settings = await updateHomeCarouselImage(
    parsedParams.data.imageId,
    parsedBody.data,
    req.admin?.id ?? "",
    req.admin?.role ?? AdminRole.STAFF,
  );

  res.json(successResponse("Home carousel image saved", { settings }));
}

export async function deleteHomeCarouselImageController(req: Request, res: Response) {
  const parsedParams = homeCarouselImageParamSchema.safeParse(req.params);

  if (!parsedParams.success) {
    res.status(400).json(errorResponse("Invalid carousel image ID."));
    return;
  }

  const settings = await deleteHomeCarouselImage(
    parsedParams.data.imageId,
    req.admin?.id ?? "",
    req.admin?.role ?? AdminRole.STAFF,
  );

  res.json(successResponse("Home carousel image removed", { settings }));
}

export async function patchHomeCarouselImageOrder(req: Request, res: Response) {
  const parsedBody = homeCarouselReorderSchema.safeParse(req.body);

  if (!parsedBody.success) {
    res.status(400).json(errorResponse("Invalid carousel image order."));
    return;
  }

  const settings = await reorderHomeCarouselImages(
    parsedBody.data,
    req.admin?.id ?? "",
    req.admin?.role ?? AdminRole.STAFF,
  );

  res.json(successResponse("Home carousel image order saved", { settings }));
}
