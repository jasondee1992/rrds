import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  FileText,
  RefreshCw,
  Save,
  ArrowLeft,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { EstimateStatusBadge } from "../../components/admin/estimates/EstimateStatusBadge";
import { getSafeApiErrorMessage } from "../../services/apiError";
import {
  cancelAdminEstimate,
  convertAdminEstimateToQuotation,
  disableAdminEstimatePublicAccessToken,
  fetchAdminEstimatePdf,
  getAdminEstimateDetails,
  markAdminEstimateReady,
  regenerateAdminEstimatePublicAccessToken,
  saveAdminEstimateReview,
  startAdminEstimateReview,
  updateAdminEstimateNotes,
  updateAdminEstimateStatus,
} from "../../services/adminEstimateService";
import type { AdminEstimateStatus, EstimateDetails, EstimateReviewPayload } from "../../types/estimate";

const statuses: AdminEstimateStatus[] = [
  "SUBMITTED",
  "UNDER_REVIEW",
  "ESTIMATE_READY",
  "CANCELLED",
];

function formatDate(value: string | null) {
  if (!value) {
    return "Not provided";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatMoney(value: string) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(Number(value));
}

function DetailItem({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div>
      <dt className="text-xs font-bold uppercase text-slate-500">{label}</dt>
      <dd className="mt-1 break-words text-sm font-medium text-slate-900">
        {value || "Not provided"}
      </dd>
    </div>
  );
}

export function AdminEstimateDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [estimate, setEstimate] = useState<EstimateDetails | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<AdminEstimateStatus>("SUBMITTED");
  const [internalNotes, setInternalNotes] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isActionBusy, setIsActionBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [statusFeedback, setStatusFeedback] = useState("");
  const [notesFeedback, setNotesFeedback] = useState("");
  const [publicAccessFeedback, setPublicAccessFeedback] = useState("");
  const [reviewFeedback, setReviewFeedback] = useState("");
  const [conversionResult, setConversionResult] = useState<{
    id: string;
    quotationNumber: string;
  } | null>(null);
  const [reviewForm, setReviewForm] = useState({
    reviewSummary: "",
    recommendedSiteInspection: false,
    recommendedServiceDate: "",
    serviceDescription: "",
    quantity: 1,
    baseAmount: "0.00",
    capacityAdjustment: "0.00",
    urgencyAdjustment: "0.00",
    additionalFees: "0.00",
    discount: "0.00",
    taxRate: "0.00",
    notes: "",
  });

  const loadEstimate = useCallback(async () => {
    if (!id) {
      setErrorMessage("Invalid estimate request ID.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const result = await getAdminEstimateDetails(id);
      setEstimate(result);
      setSelectedStatus(
        statuses.includes(result.status as AdminEstimateStatus)
          ? (result.status as AdminEstimateStatus)
          : "SUBMITTED",
      );
      setInternalNotes(result.internalNotes ?? "");
      const latestRevision = result.latestRevision;
      const fallbackBaseAmount = Math.max(
        (Number(result.estimatedSubtotal) - Number(result.estimatedAdditionalFees)) /
          Math.max(result.quantity, 1),
        0,
      ).toFixed(2);
      setReviewForm({
        reviewSummary: result.reviewSummary ?? "",
        recommendedSiteInspection: result.recommendedSiteInspection,
        recommendedServiceDate: result.recommendedServiceDate
          ? result.recommendedServiceDate.slice(0, 10)
          : "",
        serviceDescription: latestRevision?.serviceDescription ?? result.selectedService,
        quantity: latestRevision?.quantity ?? result.quantity,
        baseAmount: latestRevision?.baseAmount ?? fallbackBaseAmount,
        capacityAdjustment: latestRevision?.capacityAdjustment ?? "0.00",
        urgencyAdjustment: latestRevision?.urgencyAdjustment ?? "0.00",
        additionalFees: latestRevision?.additionalFees ?? result.estimatedAdditionalFees,
        discount: latestRevision?.discount ?? "0.00",
        taxRate: latestRevision?.taxRate ?? "0.00",
        notes: latestRevision?.notes ?? "",
      });
      setConversionResult(
        result.quotation
          ? { id: result.quotation.id, quotationNumber: result.quotation.quotationNumber }
          : null,
      );
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(getSafeApiErrorMessage(error, "Unable to load estimate request details."));
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadEstimate();
  }, [loadEstimate]);

  async function handleStatusUpdate() {
    if (!id) {
      return;
    }

    setIsActionBusy(true);
    setStatusFeedback("");

    try {
      const result = await updateAdminEstimateStatus(id, selectedStatus);
      setEstimate((current) =>
        current ? { ...current, status: result.status, updatedAt: result.updatedAt } : current,
      );
      setStatusFeedback("Status updated.");
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(getSafeApiErrorMessage(error, "Unable to update estimate status."));
    } finally {
      setIsActionBusy(false);
    }
  }

  async function handleNotesUpdate() {
    if (!id) {
      return;
    }

    setIsActionBusy(true);
    setNotesFeedback("");

    try {
      const result = await updateAdminEstimateNotes(id, internalNotes);
      setEstimate((current) =>
        current
          ? { ...current, internalNotes: result.internalNotes, updatedAt: result.updatedAt }
          : current,
      );
      setNotesFeedback("Internal notes saved.");
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(getSafeApiErrorMessage(error, "Unable to save internal notes."));
    } finally {
      setIsActionBusy(false);
    }
  }

  function setReviewValue<K extends keyof typeof reviewForm>(
    key: K,
    value: (typeof reviewForm)[K],
  ) {
    setReviewForm((current) => ({ ...current, [key]: value }));
  }

  function reviewedTotalPreview() {
    const quantity = Number(reviewForm.quantity) || 0;
    const baseAmount = Number(reviewForm.baseAmount) || 0;
    const capacityAdjustment = Number(reviewForm.capacityAdjustment) || 0;
    const urgencyAdjustment = Number(reviewForm.urgencyAdjustment) || 0;
    const additionalFees = Number(reviewForm.additionalFees) || 0;
    const discount = Number(reviewForm.discount) || 0;
    const taxRate = Number(reviewForm.taxRate) || 0;
    const subtotal = Math.max(
      quantity * baseAmount + capacityAdjustment + urgencyAdjustment + additionalFees - discount,
      0,
    );
    const tax = subtotal * (taxRate / 100);

    return {
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      total: (subtotal + tax).toFixed(2),
    };
  }

  async function handleStartReview() {
    if (!id) {
      return;
    }

    setIsActionBusy(true);
    setReviewFeedback("");

    try {
      await startAdminEstimateReview(id);
      await loadEstimate();
      setReviewFeedback("Review started.");
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(getSafeApiErrorMessage(error, "Unable to start review."));
    } finally {
      setIsActionBusy(false);
    }
  }

  async function handleSaveReview() {
    if (!id) {
      return;
    }

    const payload: EstimateReviewPayload = {
      internalNotes,
      reviewSummary: reviewForm.reviewSummary,
      recommendedSiteInspection: reviewForm.recommendedSiteInspection,
      recommendedServiceDate: reviewForm.recommendedServiceDate || undefined,
      revision: {
        serviceDescription: reviewForm.serviceDescription,
        quantity: Number(reviewForm.quantity),
        baseAmount: Number(reviewForm.baseAmount),
        capacityAdjustment: Number(reviewForm.capacityAdjustment),
        urgencyAdjustment: Number(reviewForm.urgencyAdjustment),
        additionalFees: Number(reviewForm.additionalFees),
        discount: Number(reviewForm.discount),
        taxRate: Number(reviewForm.taxRate),
        notes: reviewForm.notes,
      },
    };

    setIsActionBusy(true);
    setReviewFeedback("");

    try {
      await saveAdminEstimateReview(id, payload);
      await loadEstimate();
      setReviewFeedback("Review saved as a new revision.");
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(getSafeApiErrorMessage(error, "Unable to save review."));
    } finally {
      setIsActionBusy(false);
    }
  }

  async function handleMarkReady() {
    if (!id) {
      return;
    }

    setIsActionBusy(true);
    setReviewFeedback("");

    try {
      await markAdminEstimateReady(id);
      await loadEstimate();
      setReviewFeedback("Estimate marked ready.");
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(getSafeApiErrorMessage(error, "Unable to mark estimate ready."));
    } finally {
      setIsActionBusy(false);
    }
  }

  async function handleCancelEstimate() {
    if (!id || !window.confirm("Cancel this estimate request?")) {
      return;
    }

    setIsActionBusy(true);
    setReviewFeedback("");

    try {
      await cancelAdminEstimate(id);
      await loadEstimate();
      setReviewFeedback("Estimate cancelled.");
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(getSafeApiErrorMessage(error, "Unable to cancel estimate."));
    } finally {
      setIsActionBusy(false);
    }
  }

  async function handleConvertToQuotation() {
    if (
      !id ||
      !window.confirm(
        "Convert this reviewed estimate into a draft official quotation?\n\nThe original client estimate will remain unchanged. A new draft quotation will be created for final editing and approval.",
      )
    ) {
      return;
    }

    setIsActionBusy(true);
    setReviewFeedback("");

    try {
      const result = await convertAdminEstimateToQuotation(id);
      setConversionResult({
        id: result.quotation.id,
        quotationNumber: result.quotation.quotationNumber,
      });
      await loadEstimate();
      setReviewFeedback(`Draft quotation ${result.quotation.quotationNumber} created.`);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(getSafeApiErrorMessage(error, "Unable to convert estimate."));
    } finally {
      setIsActionBusy(false);
    }
  }

  function getPdfFilename(currentEstimate: EstimateDetails) {
    const safeEstimateNumber = currentEstimate.estimateNumber.replace(/[^A-Za-z0-9-]/g, "");

    return `RRDS-Preliminary-Estimate-${safeEstimateNumber || "ESTIMATE"}.pdf`;
  }

  async function handleAdminPdf(mode: "download" | "inline") {
    const currentEstimate = estimate;

    if (!id || !currentEstimate) {
      return;
    }

    setIsActionBusy(true);
    setPublicAccessFeedback("");

    try {
      const blob = await fetchAdminEstimatePdf(id, mode);
      const url = URL.createObjectURL(blob);

      if (mode === "inline") {
        window.open(url, "_blank", "noopener,noreferrer");
        window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
      } else {
        const link = document.createElement("a");
        link.href = url;
        link.download = getPdfFilename(currentEstimate);
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
      }

      setErrorMessage("");
    } catch (error) {
      setErrorMessage(getSafeApiErrorMessage(error, "Unable to load estimate PDF."));
    } finally {
      setIsActionBusy(false);
    }
  }

  async function handleCopyPublicLink() {
    const publicUrl = estimate?.publicAccess.publicUrl;

    if (!publicUrl) {
      setPublicAccessFeedback("Regenerate public access to create a copyable client link.");
      return;
    }

    try {
      await navigator.clipboard.writeText(publicUrl);
      setPublicAccessFeedback("Public estimate link copied.");
    } catch {
      setPublicAccessFeedback("Unable to copy link from this browser.");
    }
  }

  async function handleRegeneratePublicAccess() {
    if (!id) {
      return;
    }

    setIsActionBusy(true);
    setPublicAccessFeedback("");

    try {
      await regenerateAdminEstimatePublicAccessToken(id);
      await loadEstimate();
      setPublicAccessFeedback("Public access token regenerated. Previous links are now invalid.");
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(getSafeApiErrorMessage(error, "Unable to regenerate public access."));
    } finally {
      setIsActionBusy(false);
    }
  }

  async function handleDisablePublicAccess() {
    if (!id) {
      return;
    }

    setIsActionBusy(true);
    setPublicAccessFeedback("");

    try {
      await disableAdminEstimatePublicAccessToken(id);
      await loadEstimate();
      setPublicAccessFeedback("Public access disabled.");
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(getSafeApiErrorMessage(error, "Unable to disable public access."));
    } finally {
      setIsActionBusy(false);
    }
  }

  if (isLoading) {
    return (
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-4">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="h-12 animate-pulse rounded-md bg-slate-100" />
          ))}
        </div>
      </section>
    );
  }

  if (errorMessage && !estimate) {
    return (
      <section className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-800">
        <h2 className="text-lg font-bold">Estimate request unavailable</h2>
        <p className="mt-2 text-sm font-medium">{errorMessage}</p>
        <Link className="mt-5 inline-flex text-sm font-bold text-red-900 underline" to="/admin/estimates">
          Back to estimate requests
        </Link>
      </section>
    );
  }

  if (!estimate) {
    return null;
  }

  const previewTotals = reviewedTotalPreview();
  const canConvert =
    estimate.status === "ESTIMATE_READY" &&
    Boolean(estimate.latestRevision) &&
    !estimate.quotation &&
    !conversionResult;
  const isReviewLocked =
    estimate.status === "CANCELLED" || estimate.status === "CONVERTED_TO_QUOTATION";

  return (
    <div className="space-y-5">
      <Link
        className="inline-flex items-center gap-2 text-sm font-bold text-blue-800 hover:text-blue-900"
        to="/admin/estimates"
      >
        <ArrowLeft aria-hidden="true" className="h-4 w-4" />
        Back to estimate requests
      </Link>

      {errorMessage ? (
        <section className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">
          {errorMessage}
        </section>
      ) : null}

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-bold text-blue-700">{estimate.estimateNumber}</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-950">{estimate.selectedService}</h2>
            <p className="mt-2 text-sm text-slate-600">
              Submitted {formatDate(estimate.createdAt)}. Last updated {formatDate(estimate.updatedAt)}.
            </p>
          </div>
          <EstimateStatusBadge status={estimate.status} />
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-5">
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-bold text-slate-950">Customer and property</h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <DetailItem label="Customer" value={estimate.customer.fullName} />
              <DetailItem label="Company" value={estimate.customer.companyName} />
              <DetailItem label="Email" value={estimate.customer.email} />
              <DetailItem label="Mobile" value={estimate.customer.mobileNumber} />
              <DetailItem label="Property type" value={estimate.propertyType} />
              <DetailItem label="City" value={estimate.customer.city} />
              <DetailItem label="Province" value={estimate.customer.province} />
              <DetailItem label="Service address" value={estimate.serviceAddress} />
            </dl>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-bold text-slate-950">Aircon and service details</h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <DetailItem label="Aircon type" value={estimate.airconType} />
              <DetailItem label="Capacity" value={estimate.airconCapacity} />
              <DetailItem label="Quantity" value={estimate.quantity} />
              <DetailItem label="Brand" value={estimate.brand} />
              <DetailItem label="Unit" value={estimate.unitCondition} />
              <DetailItem label="Indoor location" value={estimate.indoorUnitLocation} />
              <DetailItem label="Outdoor location" value={estimate.outdoorUnitLocation} />
              <DetailItem label="Preferred date" value={formatDate(estimate.preferredDate)} />
              <DetailItem label="Urgency" value={estimate.urgencyLevel} />
            </dl>
            <div className="mt-5">
              <p className="text-xs font-bold uppercase text-slate-500">Notes</p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                {estimate.notes || "Not provided"}
              </p>
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-bold text-slate-950">Calculation breakdown</h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <DetailItem label="Estimated subtotal" value={formatMoney(estimate.estimatedSubtotal)} />
              <DetailItem
                label="Estimated additional fees"
                value={formatMoney(estimate.estimatedAdditionalFees)}
              />
              <DetailItem label="Estimated tax" value={formatMoney(estimate.estimatedTax)} />
              <DetailItem label="Estimated total" value={formatMoney(estimate.estimatedTotal)} />
            </dl>
            <p className="mt-5 rounded-md bg-amber-50 p-3 text-sm font-medium leading-6 text-amber-900">
              {estimate.disclaimer}
            </p>
          </section>
        </div>

        <div className="space-y-5">
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-bold text-slate-950">Admin review</h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <DetailItem label="Reviewed by" value={estimate.reviewedBy?.fullName} />
              <DetailItem label="Reviewed date" value={formatDate(estimate.reviewedAt)} />
              <DetailItem
                label="Recommended inspection"
                value={estimate.recommendedSiteInspection ? "Yes" : "No"}
              />
              <DetailItem
                label="Recommended service date"
                value={formatDate(estimate.recommendedServiceDate)}
              />
            </dl>

            <div className="mt-5 grid gap-4">
              <label className="text-sm font-semibold text-slate-800">
                Review summary
                <textarea
                  className="mt-2 min-h-24 w-full resize-y rounded-md border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/20"
                  disabled={isActionBusy || isReviewLocked}
                  maxLength={2000}
                  onChange={(event) => setReviewValue("reviewSummary", event.target.value)}
                  value={reviewForm.reviewSummary}
                />
              </label>
              <label className="flex items-center gap-3 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm font-semibold text-slate-800">
                <input
                  checked={reviewForm.recommendedSiteInspection}
                  className="h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-700"
                  disabled={isActionBusy || isReviewLocked}
                  onChange={(event) =>
                    setReviewValue("recommendedSiteInspection", event.target.checked)
                  }
                  type="checkbox"
                />
                Recommended site inspection
              </label>
              <label className="text-sm font-semibold text-slate-800">
                Recommended service date
                <input
                  className="mt-2 min-h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/20"
                  disabled={isActionBusy || isReviewLocked}
                  onChange={(event) => setReviewValue("recommendedServiceDate", event.target.value)}
                  type="date"
                  value={reviewForm.recommendedServiceDate}
                />
              </label>
            </div>

            <div className="mt-6 rounded-md border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
                <p className="text-sm font-medium leading-6 text-slate-700">
                  Reviewed values are stored as separate revisions. The original client estimate
                  and watermarked estimate PDF keep the submission values.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-semibold text-slate-800 sm:col-span-2">
                Service description
                <input
                  className="mt-2 min-h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/20"
                  disabled={isActionBusy || isReviewLocked}
                  maxLength={240}
                  onChange={(event) => setReviewValue("serviceDescription", event.target.value)}
                  value={reviewForm.serviceDescription}
                />
              </label>
              <label className="text-sm font-semibold text-slate-800">
                Quantity
                <input
                  className="mt-2 min-h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/20"
                  disabled={isActionBusy || isReviewLocked}
                  min={1}
                  onChange={(event) => setReviewValue("quantity", Number(event.target.value))}
                  type="number"
                  value={reviewForm.quantity}
                />
              </label>
              <label className="text-sm font-semibold text-slate-800">
                Unit price / base estimate
                <input
                  className="mt-2 min-h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/20"
                  disabled={isActionBusy || isReviewLocked}
                  min={0}
                  onChange={(event) => setReviewValue("baseAmount", event.target.value)}
                  step="0.01"
                  type="number"
                  value={reviewForm.baseAmount}
                />
              </label>
              <label className="text-sm font-semibold text-slate-800">
                Capacity adjustment
                <input
                  className="mt-2 min-h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/20"
                  disabled={isActionBusy || isReviewLocked}
                  min={0}
                  onChange={(event) => setReviewValue("capacityAdjustment", event.target.value)}
                  step="0.01"
                  type="number"
                  value={reviewForm.capacityAdjustment}
                />
              </label>
              <label className="text-sm font-semibold text-slate-800">
                Urgency adjustment
                <input
                  className="mt-2 min-h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/20"
                  disabled={isActionBusy || isReviewLocked}
                  min={0}
                  onChange={(event) => setReviewValue("urgencyAdjustment", event.target.value)}
                  step="0.01"
                  type="number"
                  value={reviewForm.urgencyAdjustment}
                />
              </label>
              <label className="text-sm font-semibold text-slate-800">
                Additional fees
                <input
                  className="mt-2 min-h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/20"
                  disabled={isActionBusy || isReviewLocked}
                  min={0}
                  onChange={(event) => setReviewValue("additionalFees", event.target.value)}
                  step="0.01"
                  type="number"
                  value={reviewForm.additionalFees}
                />
              </label>
              <label className="text-sm font-semibold text-slate-800">
                Discount
                <input
                  className="mt-2 min-h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/20"
                  disabled={isActionBusy || isReviewLocked}
                  min={0}
                  onChange={(event) => setReviewValue("discount", event.target.value)}
                  step="0.01"
                  type="number"
                  value={reviewForm.discount}
                />
              </label>
              <label className="text-sm font-semibold text-slate-800">
                Tax rate
                <input
                  className="mt-2 min-h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/20"
                  disabled={isActionBusy || isReviewLocked}
                  min={0}
                  onChange={(event) => setReviewValue("taxRate", event.target.value)}
                  step="0.01"
                  type="number"
                  value={reviewForm.taxRate}
                />
              </label>
              <label className="text-sm font-semibold text-slate-800 sm:col-span-2">
                Admin review notes
                <textarea
                  className="mt-2 min-h-24 w-full resize-y rounded-md border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/20"
                  disabled={isActionBusy || isReviewLocked}
                  maxLength={3000}
                  onChange={(event) => setReviewValue("notes", event.target.value)}
                  value={reviewForm.notes}
                />
              </label>
            </div>

            <dl className="mt-5 grid gap-3 rounded-md bg-slate-50 p-4 sm:grid-cols-3">
              <DetailItem label="Reviewed subtotal" value={formatMoney(previewTotals.subtotal)} />
              <DetailItem label="Reviewed tax" value={formatMoney(previewTotals.tax)} />
              <DetailItem label="Reviewed total" value={formatMoney(previewTotals.total)} />
            </dl>

            <div className="mt-5 grid gap-3">
              <button
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-blue-700 bg-white px-4 text-sm font-semibold text-blue-800 transition hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-700 disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-slate-400"
                disabled={isActionBusy || estimate.status !== "SUBMITTED"}
                onClick={() => void handleStartReview()}
                type="button"
              >
                <FileText aria-hidden="true" className="h-4 w-4" />
                Start Review
              </button>
              <button
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-blue-700 px-4 text-sm font-semibold text-white transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                disabled={isActionBusy || isReviewLocked}
                onClick={() => void handleSaveReview()}
                type="button"
              >
                <Save aria-hidden="true" className="h-4 w-4" />
                Save Review
              </button>
              <button
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-emerald-600 bg-white px-4 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-600 disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-slate-400"
                disabled={isActionBusy || estimate.status !== "UNDER_REVIEW" || !estimate.latestRevision}
                onClick={() => void handleMarkReady()}
                type="button"
              >
                <CheckCircle2 aria-hidden="true" className="h-4 w-4" />
                Mark Estimate Ready
              </button>
              <button
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-emerald-700 px-4 text-sm font-semibold text-white transition hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                disabled={isActionBusy || !canConvert}
                onClick={() => void handleConvertToQuotation()}
                type="button"
              >
                <FileText aria-hidden="true" className="h-4 w-4" />
                Convert to Draft Quotation
              </button>
              <button
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-red-300 bg-white px-4 text-sm font-semibold text-red-700 transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:cursor-not-allowed disabled:text-slate-400"
                disabled={isActionBusy || isReviewLocked}
                onClick={() => void handleCancelEstimate()}
                type="button"
              >
                <Ban aria-hidden="true" className="h-4 w-4" />
                Cancel Estimate
              </button>
            </div>

            {reviewFeedback ? (
              <p className="mt-3 text-sm font-medium text-emerald-700">{reviewFeedback}</p>
            ) : null}
            {conversionResult ? (
              <div className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 p-3">
                <p className="text-sm font-bold text-emerald-900">
                  Draft quotation {conversionResult.quotationNumber} is available.
                </p>
                <Link
                  className="mt-3 inline-flex text-sm font-bold text-emerald-900 underline"
                  to={`/admin/quotations/${conversionResult.id}`}
                >
                  Open Draft Quotation
                </Link>
              </div>
            ) : null}
            {estimate.latestRevision ? (
              <p className="mt-3 text-xs font-medium text-slate-500">
                Latest saved revision #{estimate.latestRevision.revisionNumber}, created{" "}
                {formatDate(estimate.latestRevision.createdAt)}.
              </p>
            ) : null}
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-bold text-slate-950">Client estimate access</h2>
            <dl className="mt-4 grid gap-4">
              <DetailItem
                label="Public access"
                value={estimate.publicAccess.enabled ? "Enabled" : "Disabled"}
              />
              <DetailItem label="Token created" value={formatDate(estimate.publicAccess.createdAt)} />
              <DetailItem label="Valid until" value={formatDate(estimate.publicAccess.expiresAt)} />
              <DetailItem
                label="Last accessed"
                value={formatDate(estimate.publicAccess.lastAccessedAt)}
              />
            </dl>

            <div className="mt-5 grid gap-3">
              <button
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-blue-700 bg-white px-4 text-sm font-semibold text-blue-800 transition hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-700 disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-slate-400"
                disabled={isActionBusy || !estimate.publicAccess.publicUrl}
                onClick={() => window.open(estimate.publicAccess.publicUrl ?? "", "_blank", "noopener,noreferrer")}
                type="button"
              >
                <ExternalLink aria-hidden="true" className="h-4 w-4" />
                View client estimate
              </button>
              <button
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-blue-700 bg-white px-4 text-sm font-semibold text-blue-800 transition hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-700 disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-slate-400"
                disabled={isActionBusy || !estimate.publicAccess.publicUrl}
                onClick={() => void handleCopyPublicLink()}
                type="button"
              >
                <Copy aria-hidden="true" className="h-4 w-4" />
                Copy public estimate link
              </button>
              <button
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-blue-700 bg-white px-4 text-sm font-semibold text-blue-800 transition hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-700 disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-slate-400"
                disabled={isActionBusy}
                onClick={() => void handleAdminPdf("inline")}
                type="button"
              >
                <ExternalLink aria-hidden="true" className="h-4 w-4" />
                Preview watermarked PDF
              </button>
              <button
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-blue-700 px-4 text-sm font-semibold text-white transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                disabled={isActionBusy}
                onClick={() => void handleAdminPdf("download")}
                type="button"
              >
                <Download aria-hidden="true" className="h-4 w-4" />
                Download watermarked estimate PDF
              </button>
              <button
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:cursor-not-allowed disabled:text-slate-400"
                disabled={isActionBusy}
                onClick={() => void handleRegeneratePublicAccess()}
                type="button"
              >
                <RefreshCw aria-hidden="true" className="h-4 w-4" />
                Regenerate public access token
              </button>
              <button
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-red-300 bg-white px-4 text-sm font-semibold text-red-700 transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:cursor-not-allowed disabled:text-slate-400"
                disabled={isActionBusy || !estimate.publicAccess.enabled}
                onClick={() => void handleDisablePublicAccess()}
                type="button"
              >
                <Ban aria-hidden="true" className="h-4 w-4" />
                Disable public access
              </button>
            </div>
            {publicAccessFeedback ? (
              <p className="mt-3 text-sm font-medium text-emerald-700">{publicAccessFeedback}</p>
            ) : null}
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-bold text-slate-950">Status</h2>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <select
                className="min-h-10 flex-1 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/20"
                onChange={(event) => setSelectedStatus(event.target.value as AdminEstimateStatus)}
                value={selectedStatus}
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
              <button
                className="inline-flex min-h-10 items-center justify-center rounded-md bg-blue-700 px-4 text-sm font-semibold text-white transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                disabled={isActionBusy}
                onClick={() => void handleStatusUpdate()}
                type="button"
              >
                Update
              </button>
            </div>
            {statusFeedback ? (
              <p className="mt-3 text-sm font-medium text-emerald-700">{statusFeedback}</p>
            ) : null}
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-base font-bold text-slate-950">Internal notes</h2>
              <button
                className="inline-flex min-h-10 items-center justify-center rounded-md bg-blue-700 px-4 text-sm font-semibold text-white transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                disabled={isActionBusy}
                onClick={() => void handleNotesUpdate()}
                type="button"
              >
                <Save aria-hidden="true" className="mr-2 h-4 w-4" />
                Save notes
              </button>
            </div>
            <textarea
              className="mt-4 min-h-40 w-full resize-y rounded-md border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/20"
              maxLength={3000}
              onChange={(event) => setInternalNotes(event.target.value)}
              placeholder="Add internal notes for admins"
              value={internalNotes}
            />
            {notesFeedback ? (
              <p className="mt-3 text-sm font-medium text-emerald-700">{notesFeedback}</p>
            ) : null}
          </section>
        </div>
      </section>
    </div>
  );
}
