import {
  ClipboardList,
  FileCheck2,
  FileClock,
  FileText,
  Inbox,
  Send,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAdminDashboardSummary } from "../../services/adminDashboardService";
import type { AdminDashboardSummary } from "../../types/admin";

type SummaryCard = {
  label: string;
  value: number;
  Icon: LucideIcon;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function formatMoney(value: string) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(Number(value));
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex min-h-32 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 text-center">
      <p className="text-sm font-medium text-slate-500">{label}</p>
    </div>
  );
}

export function AdminDashboardPage() {
  const [summary, setSummary] = useState<AdminDashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadDashboardSummary() {
      try {
        const data = await getAdminDashboardSummary();

        if (isMounted) {
          setSummary(data);
          setErrorMessage("");
        }
      } catch {
        if (isMounted) {
          setErrorMessage("Unable to load dashboard summary.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadDashboardSummary();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div
            key={index}
            className="h-32 animate-pulse rounded-lg border border-slate-200 bg-white"
          />
        ))}
      </section>
    );
  }

  if (errorMessage || !summary) {
    return (
      <section className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-800">
        <h2 className="text-lg font-bold">Dashboard unavailable</h2>
        <p className="mt-2 text-sm font-medium">
          {errorMessage || "Unable to load dashboard summary."}
        </p>
      </section>
    );
  }

  const cards: SummaryCard[] = [
    { label: "Total Customers", value: summary.totalCustomers, Icon: Users },
    { label: "Total Inquiries", value: summary.totalInquiries, Icon: Inbox },
    { label: "Pending Reviews", value: summary.pendingEstimateReviews, Icon: FileClock },
    { label: "Active Estimates", value: summary.pendingEstimates, Icon: ClipboardList },
    { label: "Converted Estimates", value: summary.convertedEstimates, Icon: FileCheck2 },
    { label: "Draft Quotations", value: summary.draftQuotations, Icon: FileText },
    { label: "Sent Quotations", value: summary.sentQuotations, Icon: Send },
    { label: "Accepted Quotations", value: summary.acceptedQuotations, Icon: FileCheck2 },
  ];

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map(({ label, value, Icon }) => (
          <article
            key={label}
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-500">{label}</p>
                <p className="mt-3 text-3xl font-bold text-slate-950">{value}</p>
              </div>
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-700">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-bold text-slate-950">Recent inquiries</h2>
          <div className="mt-4 space-y-3">
            {summary.recentInquiries.length > 0 ? (
              summary.recentInquiries.map((inquiry) => (
                <Link
                  key={inquiry.id}
                  className={`block rounded-md border p-3 transition hover:border-blue-300 hover:bg-blue-50/40 focus:outline-none focus:ring-2 focus:ring-blue-700 ${
                    inquiry.status === "NEW"
                      ? "border-cyan-200 bg-cyan-50/60"
                      : "border-slate-200 bg-white"
                  }`}
                  to={`/admin/inquiries/${inquiry.id}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="min-w-0 truncate text-sm font-bold text-slate-950">
                      {inquiry.fullName}
                    </p>
                    <span className="shrink-0 rounded-md bg-cyan-50 px-2 py-1 text-xs font-bold text-cyan-700">
                      {inquiry.status}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-sm text-slate-600">{inquiry.subject}</p>
                  <p className="mt-2 text-xs font-medium text-slate-500">
                    {inquiry.referenceNumber} - {formatDate(inquiry.createdAt)}
                  </p>
                </Link>
              ))
            ) : (
              <EmptyState label="No inquiries yet." />
            )}
          </div>
        </article>

        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-bold text-slate-950">Recent estimate requests</h2>
          <div className="mt-4 space-y-3">
            {summary.recentEstimateRequests.length > 0 ? (
              summary.recentEstimateRequests.map((estimate) => (
                <Link
                  key={estimate.id}
                  className={`block rounded-md border p-3 transition hover:border-blue-300 hover:bg-blue-50/40 focus:outline-none focus:ring-2 focus:ring-blue-700 ${
                    estimate.status === "SUBMITTED"
                      ? "border-cyan-200 bg-cyan-50/60"
                      : "border-slate-200 bg-white"
                  }`}
                  to={`/admin/estimates/${estimate.id}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="min-w-0 truncate text-sm font-bold text-slate-950">
                      {estimate.customer.fullName}
                    </p>
                    <span className="shrink-0 rounded-md bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700">
                      {estimate.status}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-sm text-slate-600">
                    {estimate.selectedService}
                  </p>
                  <p className="mt-2 text-xs font-medium text-slate-500">
                    {estimate.estimateNumber} - {formatDate(estimate.createdAt)}
                  </p>
                </Link>
              ))
            ) : (
              <EmptyState label="No estimate requests yet." />
            )}
          </div>
        </article>

        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="flex items-center gap-2 text-base font-bold text-slate-950">
            <ClipboardList className="h-5 w-5 text-blue-700" aria-hidden="true" />
            Recent quotations
          </h2>
          <div className="mt-4 space-y-3">
            {summary.recentQuotations.length > 0 ? (
              summary.recentQuotations.map((quotation) => (
                <Link
                  key={quotation.id}
                  className="block rounded-md border border-slate-200 p-3 transition hover:border-blue-300 hover:bg-blue-50/40 focus:outline-none focus:ring-2 focus:ring-blue-700"
                  to={`/admin/quotations/${quotation.id}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="min-w-0 truncate text-sm font-bold text-slate-950">
                      {quotation.customer.fullName}
                    </p>
                    <span className="shrink-0 rounded-md bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700">
                      {quotation.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-semibold text-slate-700">
                    {formatMoney(quotation.grandTotal)}
                  </p>
                  <p className="mt-2 text-xs font-medium text-slate-500">
                    {quotation.quotationNumber} - {formatDate(quotation.createdAt)}
                  </p>
                </Link>
              ))
            ) : (
              <EmptyState label="No quotations yet." />
            )}
          </div>
        </article>
      </section>
    </div>
  );
}
