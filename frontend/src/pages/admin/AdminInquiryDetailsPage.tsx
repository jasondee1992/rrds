import { ArrowLeft, Save } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CustomerLinkPanel } from "../../components/admin/inquiries/CustomerLinkPanel";
import { InquiryStatusBadge } from "../../components/admin/inquiries/InquiryStatusBadge";
import { getSafeApiErrorMessage } from "../../services/apiError";
import {
  createCustomerFromAdminInquiry,
  getAdminInquiryCustomerMatches,
  getAdminInquiryDetails,
  linkAdminInquiryCustomer,
  updateAdminInquiryNotes,
  updateAdminInquiryStatus,
} from "../../services/adminInquiryService";
import type { CustomerSummary, InquiryDetails, InquiryStatus } from "../../types/inquiry";

const statuses: InquiryStatus[] = ["NEW", "IN_PROGRESS", "RESOLVED", "CLOSED"];

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-bold uppercase text-slate-500">{label}</dt>
      <dd className="mt-1 break-words text-sm font-medium text-slate-900">{value || "Not provided"}</dd>
    </div>
  );
}

export function AdminInquiryDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [inquiry, setInquiry] = useState<InquiryDetails | null>(null);
  const [matches, setMatches] = useState<CustomerSummary[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<InquiryStatus>("NEW");
  const [internalNotes, setInternalNotes] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isActionBusy, setIsActionBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [statusFeedback, setStatusFeedback] = useState("");
  const [notesFeedback, setNotesFeedback] = useState("");
  const [customerFeedback, setCustomerFeedback] = useState("");
  const [customerError, setCustomerError] = useState("");

  const loadInquiry = useCallback(async () => {
    if (!id) {
      setErrorMessage("Invalid inquiry ID.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const result = await getAdminInquiryDetails(id);
      setInquiry(result);
      setSelectedStatus(result.status);
      setInternalNotes(result.internalNotes ?? "");
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(getSafeApiErrorMessage(error, "Unable to load inquiry details."));
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  const loadCustomerMatches = useCallback(
    async (search: string) => {
      if (!id || inquiry?.customer) {
        return;
      }

      try {
        const result = await getAdminInquiryCustomerMatches(id, search);
        setMatches(result);
        setCustomerError("");
      } catch (error) {
        setCustomerError(getSafeApiErrorMessage(error, "Unable to load customer matches."));
      }
    },
    [id, inquiry?.customer],
  );

  useEffect(() => {
    void loadInquiry();
  }, [loadInquiry]);

  useEffect(() => {
    if (inquiry && !inquiry.customer) {
      void loadCustomerMatches("");
    }
  }, [inquiry, loadCustomerMatches]);

  async function handleStatusUpdate() {
    if (!id) {
      return;
    }

    setIsActionBusy(true);
    setStatusFeedback("");

    try {
      const result = await updateAdminInquiryStatus(id, selectedStatus);
      setInquiry((current) => (current ? { ...current, status: result.status, updatedAt: result.updatedAt } : current));
      setStatusFeedback("Status updated.");
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(getSafeApiErrorMessage(error, "Unable to update inquiry status."));
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
      const result = await updateAdminInquiryNotes(id, internalNotes);
      setInquiry((current) =>
        current ? { ...current, internalNotes: result.internalNotes, updatedAt: result.updatedAt } : current,
      );
      setNotesFeedback("Internal notes saved.");
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(getSafeApiErrorMessage(error, "Unable to save internal notes."));
    } finally {
      setIsActionBusy(false);
    }
  }

  async function handleCustomerSearch() {
    await loadCustomerMatches(customerSearch);
  }

  async function handleLinkCustomer() {
    if (!id || !selectedCustomerId) {
      return;
    }

    setIsActionBusy(true);
    setCustomerFeedback("");
    setCustomerError("");

    try {
      const customer = await linkAdminInquiryCustomer(id, selectedCustomerId);
      setInquiry((current) => (current ? { ...current, customer } : current));
      setCustomerFeedback("Customer linked.");
    } catch (error) {
      setCustomerError(getSafeApiErrorMessage(error, "Unable to link customer."));
    } finally {
      setIsActionBusy(false);
    }
  }

  async function handleCreateCustomer() {
    if (!id) {
      return;
    }

    setIsActionBusy(true);
    setCustomerFeedback("");
    setCustomerError("");

    try {
      const result = await createCustomerFromAdminInquiry(id);

      if (result.created) {
        setInquiry((current) =>
          current && result.customer ? { ...current, customer: result.customer } : current,
        );
        setCustomerFeedback("Customer created and linked.");
      } else {
        setMatches(result.matches);
        setCustomerError("A likely matching customer already exists. Select a customer to link.");
      }
    } catch (error) {
      setCustomerError(getSafeApiErrorMessage(error, "Unable to create customer."));
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

  if (errorMessage && !inquiry) {
    return (
      <section className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-800">
        <h2 className="text-lg font-bold">Inquiry unavailable</h2>
        <p className="mt-2 text-sm font-medium">{errorMessage}</p>
        <Link className="mt-5 inline-flex text-sm font-bold text-red-900 underline" to="/admin/inquiries">
          Back to inquiries
        </Link>
      </section>
    );
  }

  if (!inquiry) {
    return null;
  }

  return (
    <div className="space-y-5">
      <Link
        className="inline-flex items-center gap-2 text-sm font-bold text-blue-800 hover:text-blue-900"
        to="/admin/inquiries"
      >
        <ArrowLeft aria-hidden="true" className="h-4 w-4" />
        Back to inquiries
      </Link>

      {errorMessage ? (
        <section className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">
          {errorMessage}
        </section>
      ) : null}

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-bold text-blue-700">{inquiry.referenceNumber}</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-950">{inquiry.subject}</h2>
            <p className="mt-2 text-sm text-slate-600">
              Submitted {formatDate(inquiry.createdAt)}. Last updated {formatDate(inquiry.updatedAt)}.
            </p>
          </div>
          <InquiryStatusBadge status={inquiry.status} />
        </div>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <DetailItem label="Full name" value={inquiry.fullName} />
          <DetailItem label="Email" value={inquiry.email} />
          <DetailItem label="Mobile number" value={inquiry.mobileNumber} />
          <DetailItem label="Source" value={inquiry.source.replace("_", " ")} />
        </dl>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-5">
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-bold text-slate-950">Message</h2>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-700">
              {inquiry.message}
            </p>
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

        <div className="space-y-5">
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-bold text-slate-950">Status</h2>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <select
                className="min-h-10 flex-1 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/20"
                onChange={(event) => setSelectedStatus(event.target.value as InquiryStatus)}
                value={selectedStatus}
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status.replace("_", " ")}
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

          <CustomerLinkPanel
            customerSearch={customerSearch}
            errorMessage={customerError}
            feedbackMessage={customerFeedback}
            isBusy={isActionBusy}
            linkedCustomer={inquiry.customer}
            matches={matches}
            onCreateCustomer={() => void handleCreateCustomer()}
            onCustomerSearchChange={setCustomerSearch}
            onLinkCustomer={() => void handleLinkCustomer()}
            onSearch={() => void handleCustomerSearch()}
            onSelectedCustomerIdChange={setSelectedCustomerId}
            selectedCustomerId={selectedCustomerId}
          />

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-bold text-slate-950">Status history</h2>
            <p className="mt-3 text-sm text-slate-600">
              Status history tracking is reserved for a later phase.
            </p>
          </section>
        </div>
      </section>
    </div>
  );
}
