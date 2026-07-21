import { Eye, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getSafeApiErrorMessage } from "../../services/apiError";
import { getAdminQuotations } from "../../services/adminQuotationService";
import type {
  QuotationListFilters,
  QuotationListResponse,
  QuotationStatus,
} from "../../types/quotation";

const statuses: Array<QuotationStatus | ""> = [
  "",
  "DRAFT",
  "READY",
  "SENT",
  "VIEWED",
  "ACCEPTED",
  "REJECTED",
  "EXPIRED",
  "CANCELLED",
];

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

export function AdminQuotationsPage() {
  const [filters, setFilters] = useState<QuotationListFilters>({
    page: 1,
    limit: 10,
    search: "",
    status: "",
    sort: "latest",
  });
  const [data, setData] = useState<QuotationListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const queryKey = useMemo(() => JSON.stringify(filters), [filters]);

  useEffect(() => {
    let isMounted = true;

    async function loadQuotations() {
      setIsLoading(true);

      try {
        const result = await getAdminQuotations(filters);

        if (isMounted) {
          setData(result);
          setErrorMessage("");
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(getSafeApiErrorMessage(error, "Unable to load quotations."));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadQuotations();

    return () => {
      isMounted = false;
    };
  }, [queryKey]);

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-950">Quotations</h2>
            <p className="mt-1 text-sm text-slate-600">
              Draft quotations created from reviewed estimates.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-[1fr_180px] lg:min-w-[520px]">
            <label className="text-sm font-semibold text-slate-800">
              Search
              <div className="mt-2 flex min-h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-3 focus-within:border-blue-700 focus-within:ring-2 focus-within:ring-blue-700/20">
                <Search aria-hidden="true" className="h-4 w-4 shrink-0 text-slate-400" />
                <input
                  className="w-full border-0 bg-transparent text-sm outline-none"
                  onChange={(event) =>
                    setFilters((current) => ({
                      ...current,
                      page: 1,
                      search: event.target.value,
                    }))
                  }
                  placeholder="Quotation, customer, estimate"
                  value={filters.search}
                />
              </div>
            </label>
            <label className="text-sm font-semibold text-slate-800">
              Status
              <select
                className="mt-2 min-h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/20"
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    page: 1,
                    status: event.target.value as QuotationStatus | "",
                  }))
                }
                value={filters.status}
              >
                {statuses.map((status) => (
                  <option key={status || "all"} value={status}>
                    {status ? status.replaceAll("_", " ") : "All statuses"}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </section>

      {errorMessage ? (
        <section className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">
          {errorMessage}
        </section>
      ) : null}

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 6 }, (_, index) => (
              <div key={index} className="h-12 animate-pulse rounded-md bg-slate-100" />
            ))}
          </div>
        ) : data && data.records.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs font-bold uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Quotation</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Estimate</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Prepared by</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.records.map((quotation) => (
                  <tr key={quotation.id}>
                    <td className="px-4 py-3 font-bold text-slate-950">
                      {quotation.quotationNumber}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{quotation.customer.fullName}</td>
                    <td className="px-4 py-3 text-slate-700">
                      {quotation.estimateRequest?.estimateNumber ?? "Not linked"}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-950">
                      {formatMoney(quotation.grandTotal)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-md bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700">
                        {quotation.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{quotation.preparedBy.fullName}</td>
                    <td className="px-4 py-3 text-slate-700">{formatDate(quotation.createdAt)}</td>
                    <td className="px-4 py-3">
                      <Link
                        className="inline-flex items-center gap-2 rounded-md border border-blue-700 px-3 py-2 text-xs font-bold text-blue-800 hover:bg-blue-50"
                        to={`/admin/quotations/${quotation.id}`}
                      >
                        <Eye aria-hidden="true" className="h-4 w-4" />
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex min-h-40 items-center justify-center p-5 text-sm font-medium text-slate-500">
            No quotations found.
          </div>
        )}
      </section>

      {data ? (
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-slate-600">
            Page {data.pagination.page} of {Math.max(data.pagination.totalPages, 1)}
          </p>
          <div className="flex gap-2">
            <button
              className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:text-slate-400"
              disabled={filters.page <= 1}
              onClick={() => setFilters((current) => ({ ...current, page: current.page - 1 }))}
              type="button"
            >
              Previous
            </button>
            <button
              className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:text-slate-400"
              disabled={filters.page >= data.pagination.totalPages}
              onClick={() => setFilters((current) => ({ ...current, page: current.page + 1 }))}
              type="button"
            >
              Next
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
