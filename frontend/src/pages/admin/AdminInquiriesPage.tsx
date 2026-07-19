import { useEffect, useState } from "react";
import { InquiryFilters } from "../../components/admin/inquiries/InquiryFilters";
import { InquiryTable } from "../../components/admin/inquiries/InquiryTable";
import { getSafeApiErrorMessage } from "../../services/apiError";
import { getAdminInquiries } from "../../services/adminInquiryService";
import type { InquiryListFilters, InquiryListResponse } from "../../types/inquiry";

const defaultFilters: InquiryListFilters = {
  page: 1,
  limit: 10,
  search: "",
  status: "",
  source: "",
  dateFrom: "",
  dateTo: "",
  sort: "latest",
};

export function AdminInquiriesPage() {
  const [draftFilters, setDraftFilters] = useState<InquiryListFilters>(defaultFilters);
  const [activeFilters, setActiveFilters] = useState<InquiryListFilters>(defaultFilters);
  const [data, setData] = useState<InquiryListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function loadInquiries() {
      setIsLoading(true);

      try {
        const result = await getAdminInquiries(activeFilters);

        if (isMounted) {
          setData(result);
          setErrorMessage("");
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(
            getSafeApiErrorMessage(error, "Unable to load inquiries. Please try again."),
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadInquiries();

    return () => {
      isMounted = false;
    };
  }, [activeFilters, refreshKey]);

  function applyFilters() {
    setActiveFilters({
      ...draftFilters,
      page: 1,
    });
  }

  function setPage(page: number) {
    setActiveFilters((filters) => ({
      ...filters,
      page,
    }));
    setDraftFilters((filters) => ({
      ...filters,
      page,
    }));
  }

  const totalPages = data?.pagination.totalPages ?? 1;
  const page = data?.pagination.page ?? activeFilters.page;

  return (
    <div className="space-y-5">
      <InquiryFilters
        draftFilters={draftFilters}
        isLoading={isLoading}
        onApply={applyFilters}
        onDraftFiltersChange={setDraftFilters}
        onRefresh={() => setRefreshKey((key) => key + 1)}
      />

      {errorMessage ? (
        <section className="rounded-lg border border-red-200 bg-red-50 p-5 text-sm font-medium text-red-800">
          {errorMessage}
        </section>
      ) : null}

      {isLoading ? (
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="space-y-3">
            {Array.from({ length: 6 }, (_, index) => (
              <div key={index} className="h-12 animate-pulse rounded-md bg-slate-100" />
            ))}
          </div>
        </section>
      ) : null}

      {!isLoading && data && data.records.length === 0 ? (
        <section className="flex min-h-48 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center shadow-sm">
          <div>
            <h2 className="text-base font-bold text-slate-950">No inquiries found</h2>
            <p className="mt-2 text-sm text-slate-600">
              Try changing the search, status, source, or date filters.
            </p>
          </div>
        </section>
      ) : null}

      {!isLoading && data && data.records.length > 0 ? (
        <>
          <InquiryTable inquiries={data.records} />
          <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium text-slate-600">
              Showing page {page} of {Math.max(totalPages, 1)} with {data.pagination.total} total
              result{data.pagination.total === 1 ? "" : "s"}.
            </p>
            <div className="flex gap-2">
              <button
                className="min-h-10 rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
                disabled={page <= 1 || isLoading}
                onClick={() => setPage(page - 1)}
                type="button"
              >
                Previous
              </button>
              <button
                className="min-h-10 rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
                disabled={page >= totalPages || isLoading}
                onClick={() => setPage(page + 1)}
                type="button"
              >
                Next
              </button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
