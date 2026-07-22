import fs from "fs";
import path from "path";
import { AdminRole, Prisma, QuotationStatus } from "@prisma/client";
import PDFDocument from "pdfkit";
import { prisma } from "../config/prisma";
import type { AuthenticatedAdmin } from "../types/authenticated-admin";
import { AppError } from "../utils/AppError";

const PAGE_MARGIN = 40;
const FOOTER_TOP = 768;
const BODY_BOTTOM = 748;
const TABLE_WIDTH = 515;
const TABLE_COLUMNS = [
  { key: "number", label: "#", width: 28 },
  { key: "type", label: "Type", width: 62 },
  { key: "description", label: "Description", width: 165 },
  { key: "quantity", label: "Qty", width: 40 },
  { key: "unit", label: "Unit", width: 40 },
  { key: "unitPrice", label: "Unit Price", width: 65 },
  { key: "discount", label: "Discount", width: 55 },
  { key: "amount", label: "Line Total", width: 60 },
] as const;

type PdfMode = "inline" | "download";

type QuotationPdfRecord = Prisma.QuotationGetPayload<{
  include: {
    customer: true;
    estimateRequest: { select: { estimateNumber: true } };
    preparedBy: { select: { fullName: true; email: true } };
    approvedBy: { select: { fullName: true; email: true } };
    items: { orderBy: { sortOrder: "asc" } };
  };
}>;

type CompanyPdfSettings = NonNullable<
  Awaited<ReturnType<typeof getCompanyPdfSettings>>
>;

function cleanText(value: unknown, maxLength = 500) {
  if (value === null || value === undefined || value === "") {
    return "Not provided";
  }

  const text = value instanceof Date ? value.toISOString() : String(value);

  return text
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{4,}/g, "\n\n\n")
    .trim()
    .slice(0, maxLength);
}

function safeOptionalText(value: unknown, maxLength = 500) {
  const cleaned = cleanText(value, maxLength);
  return cleaned === "Not provided" ? "" : cleaned;
}

function formatDate(value: Date | string | null | undefined, includeTime = false) {
  if (!value) {
    return "Not provided";
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not provided";
  }

  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "long",
    timeStyle: includeTime ? "short" : undefined,
    timeZone: "Asia/Manila",
  }).format(date);
}

function decimal(value: Prisma.Decimal | string | number | null | undefined) {
  try {
    return new Prisma.Decimal(value ?? 0);
  } catch {
    return new Prisma.Decimal(0);
  }
}

export function formatPdfMoney(
  value: Prisma.Decimal | string | number | null | undefined,
  currencyCode = "PHP",
) {
  const amount = decimal(value);
  const safeCurrency = cleanText(currencyCode || "PHP", 12).replace(/[^A-Za-z]/g, "") || "PHP";
  const sign = amount.isNegative() ? "-" : "";
  const fixed = amount.abs().toFixed(2);
  const [whole, fraction] = fixed.split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  return `${safeCurrency.toUpperCase()} ${sign}${grouped}.${fraction}`;
}

function formatQuantity(value: Prisma.Decimal | string | number | null | undefined) {
  const fixed = decimal(value).toFixed(2);
  return fixed.replace(/\.00$/, "").replace(/(\.\d)0$/, "$1");
}

function sanitizeFilenamePart(value: string) {
  return value.replace(/[^A-Za-z0-9-]/g, "").slice(0, 80) || "QTN";
}

export function getQuotationPdfFilename(quotationNumber: string, status: QuotationStatus) {
  const safeQuotationNumber = sanitizeFilenamePart(quotationNumber);

  if (status === QuotationStatus.DRAFT) {
    return `RRDS-Draft-Quotation-${safeQuotationNumber}.pdf`;
  }

  if (status === QuotationStatus.CANCELLED) {
    return `RRDS-Cancelled-Quotation-${safeQuotationNumber}.pdf`;
  }

  return `RRDS-Quotation-${safeQuotationNumber}.pdf`;
}

function getStatusLabel(status: QuotationStatus) {
  const labels: Record<QuotationStatus, string> = {
    [QuotationStatus.DRAFT]: "DRAFT - NOT YET APPROVED",
    [QuotationStatus.READY]: "READY FOR CLIENT PRESENTATION",
    [QuotationStatus.CANCELLED]: "CANCELLED - NO LONGER VALID",
    [QuotationStatus.SENT]: "SENT",
    [QuotationStatus.VIEWED]: "VIEWED",
    [QuotationStatus.ACCEPTED]: "ACCEPTED",
    [QuotationStatus.REJECTED]: "REJECTED",
    [QuotationStatus.EXPIRED]: "EXPIRED",
  };

  return labels[status];
}

function getFooterNotice(status: QuotationStatus) {
  if (status === QuotationStatus.DRAFT) {
    return "This draft quotation is not yet approved for client issuance.";
  }

  if (status === QuotationStatus.CANCELLED) {
    return "This quotation has been cancelled and is no longer valid.";
  }

  return "This quotation is valid only until the stated validity date and remains subject to the listed terms and conditions.";
}

async function getCompanyPdfSettings() {
  const setting = await prisma.companySetting.findFirst({
    orderBy: { createdAt: "asc" },
    select: {
      companyName: true,
      companyAddress: true,
      companyPhone: true,
      companyEmail: true,
      companyWebsite: true,
      companyLogoPath: true,
      currencyCode: true,
      quotationFooter: true,
      registrationDetails: true,
    },
  });

  return {
    companyName: setting?.companyName ?? "RRDS Airconditioning Services",
    companyAddress: setting?.companyAddress ?? "",
    companyPhone: setting?.companyPhone ?? "",
    companyEmail: setting?.companyEmail ?? "",
    companyWebsite: setting?.companyWebsite ?? "",
    companyLogoPath: setting?.companyLogoPath ?? "",
    currencyCode: setting?.currencyCode ?? "PHP",
    quotationFooter: setting?.quotationFooter ?? "",
    registrationDetails: setting?.registrationDetails ?? "",
  };
}

function resolveLogoPath(configuredLogoPath: string) {
  const candidates: string[] = [];
  const frontendPublic = path.resolve(process.cwd(), "../frontend/public");
  const localFrontendPublic = path.resolve(process.cwd(), "frontend/public");

  if (configuredLogoPath) {
    const configured = configuredLogoPath.replace(/\\/g, "/");
    candidates.push(path.resolve(frontendPublic, configured));
    candidates.push(path.resolve(localFrontendPublic, configured));

    if (path.isAbsolute(configuredLogoPath)) {
      candidates.push(configuredLogoPath);
    }
  }

  candidates.push(
    path.resolve(frontendPublic, "rrds-logo-mark.png"),
    path.resolve(localFrontendPublic, "rrds-logo-mark.png"),
    path.resolve(frontendPublic, "rrds-logo.png"),
    path.resolve(localFrontendPublic, "rrds-logo.png"),
  );

  for (const candidate of candidates) {
    try {
      const extension = path.extname(candidate).toLowerCase();

      if (![".png", ".jpg", ".jpeg"].includes(extension)) {
        continue;
      }

      const stats = fs.statSync(candidate);

      if (!stats.isFile() || stats.size > 2 * 1024 * 1024) {
        continue;
      }

      return candidate;
    } catch {
      continue;
    }
  }

  return null;
}

function assertCanAccessQuotationPdf(quotation: QuotationPdfRecord, admin: AuthenticatedAdmin) {
  if (admin.role === AdminRole.STAFF && quotation.status !== QuotationStatus.DRAFT) {
    throw new AppError("Staff can only access draft quotation PDFs.", 403);
  }
}

async function getQuotationPdfRecord(id: string) {
  const quotation = await prisma.quotation.findUnique({
    where: { id },
    include: {
      customer: true,
      estimateRequest: { select: { estimateNumber: true } },
      preparedBy: { select: { fullName: true, email: true } },
      approvedBy: { select: { fullName: true, email: true } },
      items: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!quotation) {
    throw new AppError("Quotation not found.", 404);
  }

  if (quotation.items.length === 0) {
    throw new AppError("Quotation must have at least one item before generating a PDF.", 409);
  }

  return quotation;
}

function customerSnapshot(quotation: QuotationPdfRecord) {
  return {
    fullName: quotation.customerFullName ?? quotation.customer.fullName,
    companyName: quotation.customerCompanyName ?? quotation.customer.companyName,
    email: quotation.customerEmail ?? quotation.customer.email,
    mobileNumber: quotation.customerMobileNumber ?? quotation.customer.mobileNumber,
    billingAddress: quotation.billingAddress ?? quotation.customer.address,
    serviceAddress: quotation.serviceAddress ?? quotation.customer.address,
  };
}

function ensureSpace(doc: PDFKit.PDFDocument, requiredHeight: number, onPageBreak?: () => void) {
  if (doc.y + requiredHeight > BODY_BOTTOM) {
    doc.addPage();
    if (onPageBreak) {
      onPageBreak();
    }
  }
}

function sectionTitle(doc: PDFKit.PDFDocument, title: string) {
  ensureSpace(doc, 44);
  doc.moveDown(0.9);
  doc.font("Helvetica-Bold").fontSize(12).fillColor("#0f172a").text(title);
  doc
    .moveTo(PAGE_MARGIN, doc.y + 4)
    .lineTo(doc.page.width - PAGE_MARGIN, doc.y + 4)
    .strokeColor("#cbd5e1")
    .stroke();
  doc.moveDown(0.7);
}

function detailRow(
  doc: PDFKit.PDFDocument,
  label: string,
  value: unknown,
  x: number,
  y: number,
  labelWidth: number,
  valueWidth: number,
  maxLength = 500,
) {
  doc.font("Helvetica-Bold").fontSize(8.5).fillColor("#475569").text(label, x, y, {
    width: labelWidth,
  });
  doc.font("Helvetica").fontSize(9).fillColor("#0f172a").text(cleanText(value, maxLength), x + labelWidth + 8, y, {
    width: valueWidth,
  });
}

function drawInfoGrid(
  doc: PDFKit.PDFDocument,
  rows: Array<[string, unknown, string, unknown]>,
) {
  const leftX = PAGE_MARGIN;
  const rightX = 315;

  for (const [leftLabel, leftValue, rightLabel, rightValue] of rows) {
    ensureSpace(doc, 32);
    const y = doc.y;
    detailRow(doc, leftLabel, leftValue, leftX, y, 92, 160);
    detailRow(doc, rightLabel, rightValue, rightX, y, 86, 154);
    doc.y = y + 30;
  }
}

function drawParagraphSection(
  doc: PDFKit.PDFDocument,
  title: string,
  value: unknown,
  maxLength = 5000,
  omitIfEmpty = false,
) {
  const cleaned = safeOptionalText(value, maxLength);

  if (!cleaned && omitIfEmpty) {
    return;
  }

  sectionTitle(doc, title);
  const text = cleaned || "Not provided";
  const height = doc.heightOfString(text, { lineGap: 3, width: TABLE_WIDTH });
  ensureSpace(doc, Math.min(height + 12, 240));
  doc.font("Helvetica").fontSize(9).fillColor("#0f172a").text(text, {
    lineGap: 3,
    width: TABLE_WIDTH,
  });
}

function drawTableHeader(doc: PDFKit.PDFDocument) {
  ensureSpace(doc, 26);
  const y = doc.y;
  let x = PAGE_MARGIN;

  doc.rect(PAGE_MARGIN, y, TABLE_WIDTH, 21).fill("#e2e8f0");
  doc.font("Helvetica-Bold").fontSize(7.3).fillColor("#0f172a");

  for (const column of TABLE_COLUMNS) {
    doc.text(column.label, x + 3, y + 6, {
      width: column.width - 6,
      lineBreak: false,
    });
    x += column.width;
  }

  doc.y = y + 26;
}

function drawItemsTable(
  doc: PDFKit.PDFDocument,
  quotation: QuotationPdfRecord,
  currencyCode: string,
) {
  sectionTitle(doc, "Quotation Items");
  drawTableHeader(doc);

  quotation.items.forEach((item, index) => {
    const description = cleanText(item.description, 1200);
    const descriptionHeight = doc.heightOfString(description, {
      width: TABLE_COLUMNS[2].width - 6,
    });
    const rowHeight = Math.max(32, descriptionHeight + 12);
    ensureSpace(doc, rowHeight + 6, () => drawTableHeader(doc));

    const y = doc.y;
    let x = PAGE_MARGIN;

    doc.rect(PAGE_MARGIN, y - 2, TABLE_WIDTH, rowHeight).strokeColor("#e2e8f0").stroke();
    doc.font("Helvetica").fontSize(7.3).fillColor("#0f172a");

    const rowValues = [
      String(index + 1),
      cleanText(item.itemType, 30),
      description,
      formatQuantity(item.quantity),
      cleanText(item.unit, 30),
      formatPdfMoney(item.unitPrice, currencyCode),
      decimal(item.discount).equals(0) ? "-" : formatPdfMoney(item.discount, currencyCode),
      formatPdfMoney(item.amount, currencyCode),
    ];

    rowValues.forEach((value, columnIndex) => {
      const column = TABLE_COLUMNS[columnIndex];
      const align = column.key === "description" || column.key === "type" ? "left" : "right";
      doc.text(value, x + 3, y + 6, {
        align,
        width: column.width - 6,
      });
      x += column.width;
    });

    doc.y = y + rowHeight + 3;
  });
}

function drawCostSummary(
  doc: PDFKit.PDFDocument,
  quotation: QuotationPdfRecord,
  currencyCode: string,
) {
  const taxableSubtotal = decimal(quotation.subtotal)
    .minus(quotation.discount)
    .plus(quotation.additionalFees);

  ensureSpace(doc, 180);
  sectionTitle(doc, "Cost Summary");

  const rows: Array<{
    label: string;
    value: Prisma.Decimal | string;
    isTotal: boolean;
    isMoney: boolean;
  }> = [
    { label: "Items subtotal", value: quotation.subtotal, isTotal: false, isMoney: true },
    { label: "Quotation-level discount", value: quotation.discount, isTotal: false, isMoney: true },
    { label: "Additional fees", value: quotation.additionalFees, isTotal: false, isMoney: true },
    { label: "Taxable subtotal", value: taxableSubtotal, isTotal: false, isMoney: true },
    { label: "Tax rate", value: `${decimal(quotation.taxRate).toFixed(2)}%`, isTotal: false, isMoney: false },
    { label: "Tax amount", value: quotation.taxAmount, isTotal: false, isMoney: true },
    { label: "Grand total", value: quotation.grandTotal, isTotal: true, isMoney: true },
  ];

  rows.forEach(({ label, value, isTotal, isMoney }) => {
    ensureSpace(doc, 28);
    const y = doc.y;
    doc
      .font(isTotal ? "Helvetica-Bold" : "Helvetica")
      .fontSize(isTotal ? 12 : 9)
      .fillColor(isTotal ? "#0f172a" : "#334155")
      .text(label, 315, y, { width: 120 });
    doc.text(isMoney ? formatPdfMoney(value, currencyCode) : cleanText(value, 40), 435, y, {
      align: "right",
      width: 120,
    });

    if (isTotal) {
      doc.moveTo(315, y - 4).lineTo(555, y - 4).strokeColor("#94a3b8").stroke();
    }

    doc.y = y + (isTotal ? 26 : 22);
  });
}

function drawHeader(
  doc: PDFKit.PDFDocument,
  quotation: QuotationPdfRecord,
  company: CompanyPdfSettings,
) {
  const logoPath = resolveLogoPath(company.companyLogoPath);

  if (logoPath) {
    try {
      doc.image(logoPath, PAGE_MARGIN, 38, { fit: [88, 62] });
    } catch {
      doc.font("Helvetica-Bold").fontSize(22).fillColor("#1d4ed8").text("RRDS", PAGE_MARGIN, 42);
    }
  } else {
    doc.font("Helvetica-Bold").fontSize(22).fillColor("#1d4ed8").text("RRDS", PAGE_MARGIN, 42);
  }

  doc
    .font("Helvetica-Bold")
    .fontSize(13)
    .fillColor("#0f172a")
    .text(cleanText(company.companyName, 120), 140, 42, { width: 250 });
  doc
    .font("Helvetica")
    .fontSize(8.5)
    .fillColor("#475569")
    .text(cleanText(company.companyAddress, 220), 140, 60, { width: 250 })
    .text(`Phone: ${cleanText(company.companyPhone, 60)}`, 140)
    .text(`Email: ${cleanText(company.companyEmail, 120)}`, 140);

  if (company.companyWebsite) {
    doc.text(`Website: ${cleanText(company.companyWebsite, 140)}`, 140);
  }

  if (company.registrationDetails) {
    doc.text(cleanText(company.registrationDetails, 120), 140);
  }

  doc
    .font("Helvetica-Bold")
    .fontSize(16)
    .fillColor("#0f172a")
    .text("OFFICIAL QUOTATION", 360, 42, { align: "right", width: 195 });
  doc
    .font("Helvetica-Bold")
    .fontSize(8.5)
    .fillColor(
      quotation.status === QuotationStatus.CANCELLED
        ? "#991b1b"
        : quotation.status === QuotationStatus.READY
          ? "#166534"
        : "#92400e",
    )
    .text(getStatusLabel(quotation.status), 360, 66, { align: "right", width: 195 });

  doc.y = 122;
}

function drawWatermark(doc: PDFKit.PDFDocument, status: QuotationStatus) {
  if (status !== QuotationStatus.DRAFT && status !== QuotationStatus.CANCELLED) {
    return;
  }

  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;
  const lines =
    status === QuotationStatus.DRAFT ? ["DRAFT", "NOT YET APPROVED"] : ["CANCELLED"];

  doc.save();
  doc.opacity(status === QuotationStatus.CANCELLED ? 0.16 : 0.12);
  doc.fillColor(status === QuotationStatus.CANCELLED ? "#991b1b" : "#64748b");
  doc.font("Helvetica-Bold").fontSize(status === QuotationStatus.CANCELLED ? 58 : 48);
  doc.rotate(-35, { origin: [pageWidth / 2, pageHeight / 2] });

  lines.forEach((line, index) => {
    doc.text(line, -120, pageHeight / 2 - 44 + index * 60, {
      align: "center",
      lineBreak: false,
      width: pageWidth + 240,
    });
  });

  doc.restore();
}

function drawFooter(
  doc: PDFKit.PDFDocument,
  quotation: QuotationPdfRecord,
  company: CompanyPdfSettings,
  pageNumber: number,
  pageCount: number,
  generatedAt: Date,
) {
  doc.save();
  doc
    .moveTo(PAGE_MARGIN, FOOTER_TOP - 8)
    .lineTo(doc.page.width - PAGE_MARGIN, FOOTER_TOP - 8)
    .strokeColor("#cbd5e1")
    .stroke();
  doc.font("Helvetica").fontSize(7.2).fillColor("#64748b");
  doc.text(
    `${cleanText(company.companyName, 80)} | ${cleanText(quotation.quotationNumber, 60)} | Generated ${formatDate(generatedAt, true)}`,
    PAGE_MARGIN,
    FOOTER_TOP,
    { lineBreak: false, width: 350 },
  );
  doc.text(`Page ${pageNumber} of ${pageCount}`, 455, FOOTER_TOP, {
    align: "right",
    lineBreak: false,
    width: 100,
  });
  doc.text(getFooterNotice(quotation.status), PAGE_MARGIN, FOOTER_TOP + 13, {
    align: "center",
    lineBreak: false,
    width: TABLE_WIDTH,
  });
  doc.restore();
}

function decoratePages(
  doc: PDFKit.PDFDocument,
  quotation: QuotationPdfRecord,
  company: CompanyPdfSettings,
  generatedAt: Date,
) {
  const range = doc.bufferedPageRange();

  for (let pageIndex = range.start; pageIndex < range.start + range.count; pageIndex += 1) {
    doc.switchToPage(pageIndex);
    drawWatermark(doc, quotation.status);
    drawFooter(
      doc,
      quotation,
      company,
      pageIndex - range.start + 1,
      range.count,
      generatedAt,
    );
  }
}

function renderQuotationPdf(quotation: QuotationPdfRecord, company: CompanyPdfSettings) {
  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    const generatedAt = new Date();
    const currencyCode = company.currencyCode || "PHP";
    const customer = customerSnapshot(quotation);
    const doc = new PDFDocument({
      autoFirstPage: false,
      bufferPages: true,
      compress: false,
      margin: PAGE_MARGIN,
      size: "A4",
    });

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.addPage();
    drawHeader(doc, quotation, company);

    sectionTitle(doc, "Quotation Information");
    const quotationInfoRows: Array<[string, unknown, string, unknown]> = [
      ["Quotation number", quotation.quotationNumber, "Status", getStatusLabel(quotation.status)],
      ["Quotation date", formatDate(quotation.quotationDate), "Valid until", formatDate(quotation.validUntil)],
      [
        "Reference estimate",
        quotation.estimateRequest?.estimateNumber ?? "Not provided",
        "Project title",
        quotation.projectTitle,
      ],
      ["Prepared by", quotation.preparedBy.fullName, "Generated date", formatDate(generatedAt, true)],
    ];

    if (quotation.approvedBy) {
      quotationInfoRows.push(["Approved by", quotation.approvedBy.fullName, "Approval record", "Available"]);
    }

    drawInfoGrid(doc, quotationInfoRows);

    if (quotation.status === QuotationStatus.DRAFT) {
      ensureSpace(doc, 30);
      doc
        .font("Helvetica-Bold")
        .fontSize(9)
        .fillColor("#92400e")
        .text("DRAFT NOTICE: This quotation is not yet approved for client issuance.", {
          width: TABLE_WIDTH,
        });
    } else if (quotation.status === QuotationStatus.CANCELLED) {
      ensureSpace(doc, 30);
      doc
        .font("Helvetica-Bold")
        .fontSize(9)
        .fillColor("#991b1b")
        .text("CANCELLED NOTICE: This quotation record is no longer valid.", {
          width: TABLE_WIDTH,
        });
    }

    sectionTitle(doc, "Customer Information");
    drawInfoGrid(doc, [
      ["Full name", customer.fullName, "Company", customer.companyName ?? "Not provided"],
      ["Email", customer.email, "Mobile number", customer.mobileNumber],
      ["Billing address", customer.billingAddress, "Service address", customer.serviceAddress],
    ]);

    drawItemsTable(doc, quotation, currencyCode);
    drawCostSummary(doc, quotation, currencyCode);
    drawParagraphSection(doc, "Scope of Work", quotation.scopeOfWork);
    drawParagraphSection(doc, "Exclusions", quotation.exclusions, 5000, true);
    drawParagraphSection(doc, "Payment Terms", quotation.paymentTerms);
    drawParagraphSection(doc, "Warranty Terms", quotation.warrantyTerms);
    drawParagraphSection(doc, "Additional Notes", quotation.notes, 5000, true);

    if (company.quotationFooter) {
      drawParagraphSection(doc, "Company Notice", company.quotationFooter, 1000, true);
    }

    decoratePages(doc, quotation, company, generatedAt);
    doc.end();
  });
}

async function auditQuotationPdfAccess(
  quotation: QuotationPdfRecord,
  adminId: string,
  mode: PdfMode,
) {
  const action =
    quotation.status === QuotationStatus.CANCELLED
      ? "CANCELLED_QUOTATION_PDF_ACCESSED"
      : mode === "inline"
        ? "QUOTATION_PDF_PREVIEWED"
        : "QUOTATION_PDF_DOWNLOADED";

  await prisma.auditLog.create({
    data: {
      adminId,
      action,
      entityType: "Quotation",
      entityId: quotation.id,
      entityReference: quotation.quotationNumber,
      metadata: JSON.stringify({
        mode,
        status: quotation.status,
      }),
    },
    select: { id: true },
  });
}

export async function generateAdminQuotationPdf(
  id: string,
  mode: PdfMode,
  admin: AuthenticatedAdmin,
) {
  const quotation = await getQuotationPdfRecord(id);
  assertCanAccessQuotationPdf(quotation, admin);

  const company = await getCompanyPdfSettings();

  try {
    const pdfBuffer = await renderQuotationPdf(quotation, company);
    await auditQuotationPdfAccess(quotation, admin.id, mode);

    return {
      pdfBuffer,
      filename: getQuotationPdfFilename(quotation.quotationNumber, quotation.status),
    };
  } catch (error) {
    console.error("Quotation PDF generation failed", {
      quotationId: quotation.id,
      quotationNumber: quotation.quotationNumber,
      status: quotation.status,
    });
    throw new AppError("Unable to generate quotation PDF.", 500);
  }
}
