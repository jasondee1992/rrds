import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import type { PublicEstimateDocument } from "./estimateAccessService";

const footerNotice =
  "This document is a preliminary estimate only and is not an official RRDS quotation.";

function cleanText(value: string | number | Date | null | undefined, maxLength = 500) {
  if (value === null || value === undefined || value === "") {
    return "Not provided";
  }

  const text = value instanceof Date ? value.toISOString() : String(value);

  return text
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/\s+\n/g, "\n")
    .trim()
    .slice(0, maxLength);
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
    dateStyle: "medium",
    timeStyle: includeTime ? "short" : undefined,
    timeZone: "Asia/Manila",
  }).format(date);
}

function formatMoney(value: string) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(Number(value));
}

function getPdfLogoPath() {
  const candidates = [
    path.resolve(process.cwd(), "../frontend/public/rrds-logo-mark.png"),
    path.resolve(process.cwd(), "frontend/public/rrds-logo-mark.png"),
    path.resolve(process.cwd(), "../frontend/public/rrds-logo.png"),
    path.resolve(process.cwd(), "frontend/public/rrds-logo.png"),
  ];

  return candidates.find((candidate) => fs.existsSync(candidate)) ?? null;
}

function drawPageDecoration(doc: PDFKit.PDFDocument) {
  const { x, y } = doc;
  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;

  doc.save();
  doc.opacity(0.12);
  doc.fillColor("#64748b");
  doc.font("Helvetica-Bold");
  doc.fontSize(38);
  doc.rotate(-35, { origin: [pageWidth / 2, pageHeight / 2] });
  doc.text("SAMPLE ESTIMATE ONLY", -120, pageHeight / 2 - 52, {
    align: "center",
    lineBreak: false,
    width: pageWidth + 240,
  });
  doc.text("NOT AN OFFICIAL QUOTATION", -120, pageHeight / 2 + 4, {
    align: "center",
    lineBreak: false,
    width: pageWidth + 240,
  });
  doc.restore();

  doc.save();
  doc.font("Helvetica");
  doc.fontSize(8);
  doc.fillColor("#64748b");
  doc.text(footerNotice, 40, pageHeight - 54, {
    align: "center",
    height: 14,
    lineBreak: false,
    width: pageWidth - 80,
  });
  doc.restore();
  doc.x = x;
  doc.y = y;
}

function ensureSpace(doc: PDFKit.PDFDocument, requiredHeight: number) {
  if (doc.y + requiredHeight > doc.page.height - 72) {
    doc.addPage();
  }
}

function sectionTitle(doc: PDFKit.PDFDocument, title: string) {
  ensureSpace(doc, 42);
  doc.moveDown(0.8);
  doc.font("Helvetica-Bold").fontSize(12).fillColor("#0f172a").text(title);
  doc.moveTo(40, doc.y + 4).lineTo(doc.page.width - 40, doc.y + 4).strokeColor("#cbd5e1").stroke();
  doc.moveDown(0.6);
}

function detailRow(
  doc: PDFKit.PDFDocument,
  label: string,
  value: string | number | Date | null | undefined,
  maxLength = 500,
) {
  ensureSpace(doc, 34);
  const startY = doc.y;
  doc.font("Helvetica-Bold").fontSize(9).fillColor("#475569").text(label, 40, startY, {
    width: 160,
  });
  doc.font("Helvetica").fontSize(10).fillColor("#0f172a").text(cleanText(value, maxLength), 210, startY, {
    width: 345,
  });
  doc.moveDown(0.45);
}

function moneyRow(doc: PDFKit.PDFDocument, label: string, value: string, isTotal = false) {
  ensureSpace(doc, 30);
  const startY = doc.y;
  doc
    .font(isTotal ? "Helvetica-Bold" : "Helvetica")
    .fontSize(isTotal ? 12 : 10)
    .fillColor("#0f172a")
    .text(label, 40, startY, { width: 320 });
  doc
    .font(isTotal ? "Helvetica-Bold" : "Helvetica")
    .fontSize(isTotal ? 12 : 10)
    .text(formatMoney(value), 390, startY, { align: "right", width: 165 });
  doc.moveDown(0.45);
}

export function getEstimatePdfFilename(estimateNumber: string) {
  const safeEstimateNumber = estimateNumber.replace(/[^A-Za-z0-9-]/g, "");

  return `RRDS-Preliminary-Estimate-${safeEstimateNumber || "ESTIMATE"}.pdf`;
}

export async function renderEstimatePdf(estimate: PublicEstimateDocument) {
  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    const doc = new PDFDocument({
      autoFirstPage: false,
      bufferPages: false,
      compress: false,
      margin: 40,
      size: "A4",
    });

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
    doc.on("pageAdded", () => drawPageDecoration(doc));

    doc.addPage();

    const logoPath = getPdfLogoPath();

    if (logoPath) {
      doc.image(logoPath, 40, 40, { width: 90 });
    } else {
      doc.font("Helvetica-Bold").fontSize(22).fillColor("#1d4ed8").text("RRDS", 40, 42);
    }

    doc
      .font("Helvetica-Bold")
      .fontSize(14)
      .fillColor("#0f172a")
      .text(cleanText(estimate.company.name, 120), 150, 45);
    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor("#475569")
      .text(cleanText(estimate.company.address, 180), 150, 64)
      .text(`Phone: ${cleanText(estimate.company.phone, 60)}`, 150)
      .text(`Email: ${cleanText(estimate.company.email, 120)}`, 150);

    doc
      .font("Helvetica-Bold")
      .fontSize(18)
      .fillColor("#0f172a")
      .text("Preliminary Cost Estimate", 40, 112, { align: "right", width: 515 });

    doc.moveDown(2);

    sectionTitle(doc, "Estimate Information");
    detailRow(doc, "Estimate number", estimate.estimateNumber, 60);
    detailRow(doc, "Generated date and time", formatDate(estimate.generatedDate, true), 80);
    detailRow(doc, "Valid until", formatDate(estimate.validUntil), 80);
    detailRow(doc, "Current status", estimate.status.replaceAll("_", " "), 60);

    sectionTitle(doc, "Customer Information");
    detailRow(doc, "Full name", estimate.customer.fullName, 120);
    detailRow(doc, "Company name", estimate.customer.companyName, 120);
    detailRow(doc, "Email", estimate.customer.email, 160);
    detailRow(doc, "Mobile number", estimate.customer.mobileNumber, 40);
    detailRow(doc, "Service address", estimate.serviceAddress, 240);
    detailRow(doc, "Property type", estimate.propertyType, 80);

    sectionTitle(doc, "Service Information");
    detailRow(doc, "Selected service", estimate.selectedService, 120);
    detailRow(doc, "Aircon type", estimate.airconType, 80);
    detailRow(doc, "Aircon capacity", estimate.airconCapacity, 40);
    detailRow(doc, "Brand", estimate.brand, 80);
    detailRow(doc, "Quantity", estimate.quantity, 20);
    detailRow(doc, "Existing or new unit", estimate.unitCondition, 80);
    detailRow(doc, "Indoor unit location", estimate.indoorUnitLocation, 160);
    detailRow(doc, "Outdoor unit location", estimate.outdoorUnitLocation, 160);
    detailRow(doc, "Preferred service date", formatDate(estimate.preferredDate), 80);
    detailRow(doc, "Urgency", estimate.urgencyLevel, 80);
    detailRow(doc, "Client notes", estimate.notes, 1200);

    sectionTitle(doc, "Estimated Cost Breakdown");
    moneyRow(doc, "Estimated additional fees", estimate.estimatedAdditionalFees);
    moneyRow(doc, "Estimated subtotal", estimate.estimatedSubtotal);
    moneyRow(doc, "Estimated tax", estimate.estimatedTax);
    doc.moveTo(40, doc.y + 4).lineTo(555, doc.y + 4).strokeColor("#cbd5e1").stroke();
    doc.moveDown(0.8);
    moneyRow(doc, "Estimated total", estimate.estimatedTotal, true);

    doc
      .font("Helvetica")
      .fontSize(8)
      .fillColor("#64748b")
      .text(
        "Base service, quantity, capacity, and urgency adjustments are not shown separately because this document uses only the stored Phase 6 calculation values saved with the estimate request.",
        { lineGap: 2 },
      );

    sectionTitle(doc, "Disclaimer");
    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .fillColor("#92400e")
      .text(cleanText(estimate.requiredDisclaimer, 900), {
        lineGap: 4,
      });
    doc.moveDown(0.8);
    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor("#0f172a")
      .list([
        `Prices may change after inspection. Estimate validity ends on ${formatDate(estimate.validUntil)}.`,
        "No authorized signature is included.",
        "No approval stamp is included.",
        `Generated on ${formatDate(estimate.generatedDate, true)}.`,
        `Estimate reference number: ${cleanText(estimate.estimateNumber, 60)}.`,
      ]);

    doc.end();
  });
}
