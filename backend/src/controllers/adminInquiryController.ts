import type { Request, Response } from "express";
import {
  createCustomerFromInquiry,
  findCustomerMatchesForInquiry,
  getInquiryDetails,
  linkInquiryToCustomer,
  listInquiries,
  updateInquiryNotes,
  updateInquiryStatus,
} from "../services/inquiryService";
import { errorResponse, successResponse } from "../utils/apiResponse";
import {
  inquiryCustomerMatchesQuerySchema,
  inquiryIdParamSchema,
  inquiryListQuerySchema,
  linkInquiryCustomerSchema,
  updateInquiryNotesSchema,
  updateInquiryStatusSchema,
} from "../validations/inquirySchemas";

function parseInquiryId(req: Request, res: Response) {
  const parsedParams = inquiryIdParamSchema.safeParse(req.params);

  if (!parsedParams.success) {
    res.status(400).json(errorResponse("Invalid inquiry ID."));
    return null;
  }

  return parsedParams.data.id;
}

export async function getAdminInquiries(req: Request, res: Response) {
  const parsedQuery = inquiryListQuerySchema.safeParse(req.query);

  if (!parsedQuery.success) {
    res.status(400).json(errorResponse("Invalid inquiry list filters."));
    return;
  }

  const result = await listInquiries(parsedQuery.data);

  res.json(successResponse("Inquiries retrieved", result));
}

export async function getAdminInquiryDetails(req: Request, res: Response) {
  const inquiryId = parseInquiryId(req, res);

  if (!inquiryId) {
    return;
  }

  const inquiry = await getInquiryDetails(inquiryId);

  res.json(successResponse("Inquiry details retrieved", { inquiry }));
}

export async function patchAdminInquiryStatus(req: Request, res: Response) {
  const inquiryId = parseInquiryId(req, res);

  if (!inquiryId) {
    return;
  }

  const parsedBody = updateInquiryStatusSchema.safeParse(req.body);

  if (!parsedBody.success) {
    res.status(400).json(errorResponse("Invalid inquiry status."));
    return;
  }

  const inquiry = await updateInquiryStatus(inquiryId, parsedBody.data.status);

  res.json(successResponse("Inquiry status updated", { inquiry }));
}

export async function patchAdminInquiryNotes(req: Request, res: Response) {
  const inquiryId = parseInquiryId(req, res);

  if (!inquiryId) {
    return;
  }

  const parsedBody = updateInquiryNotesSchema.safeParse(req.body);

  if (!parsedBody.success) {
    res.status(400).json(errorResponse("Invalid internal notes."));
    return;
  }

  const inquiry = await updateInquiryNotes(inquiryId, parsedBody.data.internalNotes);

  res.json(successResponse("Internal notes updated", { inquiry }));
}

export async function getAdminInquiryCustomerMatches(req: Request, res: Response) {
  const inquiryId = parseInquiryId(req, res);

  if (!inquiryId) {
    return;
  }

  const parsedQuery = inquiryCustomerMatchesQuerySchema.safeParse(req.query);

  if (!parsedQuery.success) {
    res.status(400).json(errorResponse("Invalid customer search."));
    return;
  }

  const customers = await findCustomerMatchesForInquiry(
    inquiryId,
    parsedQuery.data.search,
    parsedQuery.data.limit,
  );

  res.json(successResponse("Customer matches retrieved", { customers }));
}

export async function postAdminInquiryCreateCustomer(req: Request, res: Response) {
  const inquiryId = parseInquiryId(req, res);

  if (!inquiryId) {
    return;
  }

  const result = await createCustomerFromInquiry(inquiryId);

  if (!result.created) {
    res.status(409).json({
      success: false,
      message: "A likely matching customer already exists. Link the existing customer instead.",
      data: {
        matches: result.matches,
      },
    });
    return;
  }

  res.status(201).json(successResponse("Customer created and linked", { customer: result.customer }));
}

export async function patchAdminInquiryLinkCustomer(req: Request, res: Response) {
  const inquiryId = parseInquiryId(req, res);

  if (!inquiryId) {
    return;
  }

  const parsedBody = linkInquiryCustomerSchema.safeParse(req.body);

  if (!parsedBody.success) {
    res.status(400).json(errorResponse("Invalid customer ID."));
    return;
  }

  const customer = await linkInquiryToCustomer(inquiryId, parsedBody.data.customerId);

  res.json(successResponse("Inquiry linked to customer", { customer }));
}
