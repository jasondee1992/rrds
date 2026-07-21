import { ArrowLeft, Save } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { EstimateStatusBadge } from "../../components/admin/estimates/EstimateStatusBadge";
import { getSafeApiErrorMessage } from "../../services/apiError";
import {
  getAdminEstimateDetails,
  updateAdminEstimateNotes,
  updateAdminEstimateStatus,
} from "../../services/adminEstimateService";
import type { AdminEstimateStatus, EstimateDetails } from "../../types/estimate";

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
