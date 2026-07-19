import { RefreshCw, Search } from "lucide-react";
import type { FormEvent } from "react";
import type { InquiryListFilters, InquirySource, InquiryStatus } from "../../../types/inquiry";

const statuses: InquiryStatus[] = ["NEW", "IN_PROGRESS", "RESOLVED", "CLOSED"];
const sources: InquirySource[] = ["CONTACT_FORM", "CHATBOT", "PHONE", "EMAIL", "MANUAL"];

const inputClass =
  "min-h-10 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-700/20";

type InquiryFiltersProps = {
  draftFilters: InquiryListFilters;
  onDraftFiltersChange: (filters: InquiryListFilters) => void;
  onApply: () => void;
  onRefresh: () => void;
  isLoading: boolean;
};

export function InquiryFilters({
  draftFilters,
  onDraftFiltersChange,
  onApply,
  onRefresh,
  isLoading,
}: InquiryFiltersProps) {
  function updateFilter(key: keyof InquiryListFilters, value: string | number) {
    onDraftFiltersChange({
      ...draftFilters,
      [key]: value,
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onApply();
  }

  return (
    <form
      className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
      onSubmit={handleSubmit}
    >
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1.4fr_0.8fr_0.8fr_0.8fr_0.8fr_0.7fr]">
        <label className="relative block">
          <span className="sr-only">Search inquiries</span>
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          />
          <input
            className={`${inputClass} w-full pl-9`}
            onChange={(event) => updateFilter("search", event.target.value)}
            placeholder="Search reference, name, email, mobile, subject"
            type="search"
            value={draftFilters.search ?? ""}
          />
        </label>

        <select
          className={inputClass}
          onChange={(event) => updateFilter("status", event.target.value)}
          value={draftFilters.status ?? ""}
        >
          <option value="">All statuses</option>
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status.replace("_", " ")}
            </option>
          ))}
        </select>

        <select
          className={inputClass}
          onChange={(event) => updateFilter("source", event.target.value)}
          value={draftFilters.source ?? ""}
        >
          <option value="">All sources</option>
          {sources.map((source) => (
            <option key={source} value={source}>
              {source.replace("_", " ")}
            </option>
          ))}
        </select>

        <input
          className={inputClass}
          onChange={(event) => updateFilter("dateFrom", event.target.value)}
          type="date"
          value={draftFilters.dateFrom ?? ""}
        />

        <input
          className={inputClass}
          onChange={(event) => updateFilter("dateTo", event.target.value)}
          type="date"
          value={draftFilters.dateTo ?? ""}
        />

        <select
          className={inputClass}
          onChange={(event) => updateFilter("sort", event.target.value)}
          value={draftFilters.sort ?? "latest"}
        >
          <option value="latest">Latest</option>
          <option value="oldest">Oldest</option>
        </select>
      </div>

      <div className="mt-4 flex flex-wrap justify-end gap-3">
        <button
          className="inline-flex min-h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-700"
          disabled={isLoading}
          onClick={onRefresh}
          type="button"
        >
          <RefreshCw aria-hidden="true" className="mr-2 h-4 w-4" />
          Refresh
        </button>
        <button
          className="inline-flex min-h-10 items-center justify-center rounded-md bg-blue-700 px-4 text-sm font-semibold text-white transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          disabled={isLoading}
          type="submit"
        >
          Apply filters
        </button>
      </div>
    </form>
  );
}
