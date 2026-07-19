import { EstimateRequestStatus, QuotationStatus } from "@prisma/client";
import type { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { successResponse } from "../utils/apiResponse";

export async function getAdminDashboardSummary(_req: Request, res: Response) {
  const [
    totalCustomers,
    totalInquiries,
    pendingEstimates,
    draftQuotations,
    sentQuotations,
    acceptedQuotations,
    recentInquiries,
    recentEstimateRequests,
    recentQuotations,
  ] = await prisma.$transaction([
    prisma.customer.count(),
    prisma.inquiry.count(),
    prisma.estimateRequest.count({
      where: {
        status: {
          in: [EstimateRequestStatus.SUBMITTED, EstimateRequestStatus.UNDER_REVIEW],
        },
      },
    }),
    prisma.quotation.count({ where: { status: QuotationStatus.DRAFT } }),
    prisma.quotation.count({ where: { status: QuotationStatus.SENT } }),
    prisma.quotation.count({ where: { status: QuotationStatus.ACCEPTED } }),
    prisma.inquiry.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        referenceNumber: true,
        fullName: true,
        subject: true,
        status: true,
        source: true,
        createdAt: true,
      },
    }),
    prisma.estimateRequest.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        estimateNumber: true,
        selectedService: true,
        status: true,
        createdAt: true,
        customer: {
          select: {
            fullName: true,
          },
        },
      },
    }),
    prisma.quotation.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        quotationNumber: true,
        status: true,
        grandTotal: true,
        createdAt: true,
        customer: {
          select: {
            fullName: true,
          },
        },
      },
    }),
  ]);

  res.json(
    successResponse("Admin dashboard summary retrieved", {
      totalCustomers,
      totalInquiries,
      pendingEstimates,
      draftQuotations,
      sentQuotations,
      acceptedQuotations,
      recentInquiries,
      recentEstimateRequests,
      recentQuotations,
    }),
  );
}
