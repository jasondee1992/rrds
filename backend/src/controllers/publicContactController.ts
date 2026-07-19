import type { Request, Response } from "express";
import { createContactInquiry } from "../services/inquiryService";
import { errorResponse, successResponse } from "../utils/apiResponse";
import { publicContactSchema } from "../validations/inquirySchemas";

export async function submitPublicContactInquiry(req: Request, res: Response) {
  const parsedBody = publicContactSchema.safeParse(req.body);

  if (!parsedBody.success) {
    res.status(400).json(errorResponse("Please check the contact form fields and try again."));
    return;
  }

  const inquiry = await createContactInquiry(parsedBody.data);

  res.status(201).json(
    successResponse("Your inquiry has been submitted successfully.", {
      referenceNumber: inquiry.referenceNumber,
    }),
  );
}
