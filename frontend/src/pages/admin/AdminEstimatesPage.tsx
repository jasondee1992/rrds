import { useEffect, useState } from "react";
import { EstimateFilters } from "../../components/admin/estimates/EstimateFilters";
import { EstimateTable } from "../../components/admin/estimates/EstimateTable";
import { getSafeApiErrorMessage } from "../../services/apiError";
import { getAdminEstimates } from "../../services/adminEstimateService";
import { getPublicEstimateOptions } from "../../services/publicEstimateService";
import type { EstimateListFilters, EstimateListResponse } from "../../types/estimate";

const defaultFilters: EstimateListFilters = {
  page: 1,
  limit: 10,
  search: "",
  status: "",
  service: "",
  dateFrom: "",
  dateTo: "",
  sort: "latest",
};

export function AdminEstimatesPage() {
  const [draftFilters, setDraftFilters] = useState<EstimateListFilters>(defaultFilters);
  const [activeFilters, setActiveFilters] = useState<EstimateListFilters>(defaultFilters);
  const [data, setData] = useState<EstimateListResponse | null>(null);
  const [services, setServices] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function loadServices() {
      try {
        const options = await getPublicEstimateOptions();

        if (isMounted) {
          setServices(options.services.map((service) => service.label));
        }
      } catch {
        if (isMounted) {
          setServices([]);
        }
      }
    }

    void loadServices();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadEstimates() {
      setIsLoading(true);

      try {
        const result = await getAdminEstimates(activeFilters);

        if (isMounted) {
          setData(result);
          setErrorMessage("");
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(
            getSafeApiErrorMessage(error, "Unable to load estimate requests. Please try again."),
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadEstimates();

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
      <EstimateFilters
        draftFilters={draftFilters}
        isLoading={isLoading}
        onApply={applyFilters}
        onDraftFiltersChange={setDraftFilters}
        onRefresh={() => setRefreshKey((key) => key + 1)}
        services={services}
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
            <h2 className="text-base font-bold text-slate-950">No estimate requests found</h2>
            <p className="mt-2 text-sm text-slate-600">
              Try changing the search, status, service, or date filters.
            </p>
          </div>
        </section>
      ) : null}

      {!isLoading && data && data.records.length > 0 ? (
        <>
          <EstimateTable estimates={data.records} />
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
