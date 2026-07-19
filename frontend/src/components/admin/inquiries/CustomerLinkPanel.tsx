import { Link2, Plus, Search } from "lucide-react";
import type { CustomerSummary } from "../../../types/inquiry";

type CustomerLinkPanelProps = {
  linkedCustomer: CustomerSummary | null;
  matches: CustomerSummary[];
  selectedCustomerId: string;
  customerSearch: string;
  feedbackMessage: string;
  errorMessage: string;
  isBusy: boolean;
  onCustomerSearchChange: (value: string) => void;
  onSearch: () => void;
  onSelectedCustomerIdChange: (value: string) => void;
  onLinkCustomer: () => void;
  onCreateCustomer: () => void;
};

export function CustomerLinkPanel({
  linkedCustomer,
  matches,
  selectedCustomerId,
  customerSearch,
  feedbackMessage,
  errorMessage,
  isBusy,
  onCustomerSearchChange,
  onSearch,
  onSelectedCustomerIdChange,
  onLinkCustomer,
  onCreateCustomer,
}: CustomerLinkPanelProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-bold text-slate-950">Linked customer</h2>

      {linkedCustomer ? (
        <div className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 p-4">
          <p className="font-bold text-emerald-950">{linkedCustomer.fullName}</p>
          <p className="mt-1 text-sm text-emerald-900">{linkedCustomer.email}</p>
          <p className="text-sm text-emerald-900">{linkedCustomer.mobileNumber}</p>
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="relative flex-1">
              <span className="sr-only">Search customers</span>
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              />
              <input
                className="min-h-10 w-full rounded-md border border-slate-300 bg-white px-3 pl-9 text-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/20"
                onChange={(event) => onCustomerSearchChange(event.target.value)}
                placeholder="Search customers"
                value={customerSearch}
              />
            </label>
            <button
              className="inline-flex min-h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-700"
              disabled={isBusy}
              onClick={onSearch}
              type="button"
            >
              Search
            </button>
          </div>

          <select
            className="min-h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/20"
            onChange={(event) => onSelectedCustomerIdChange(event.target.value)}
            value={selectedCustomerId}
          >
            <option value="">Select customer to link</option>
            {matches.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.fullName} - {customer.email} - {customer.mobileNumber}
              </option>
            ))}
          </select>

          <div className="flex flex-wrap gap-3">
            <button
              className="inline-flex min-h-10 items-center justify-center rounded-md bg-blue-700 px-4 text-sm font-semibold text-white transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
              disabled={isBusy || !selectedCustomerId}
              onClick={onLinkCustomer}
              type="button"
            >
              <Link2 aria-hidden="true" className="mr-2 h-4 w-4" />
              Link customer
            </button>
            <button
              className="inline-flex min-h-10 items-center justify-center rounded-md border border-blue-700 bg-white px-4 text-sm font-semibold text-blue-800 transition hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-700 disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-slate-400"
              disabled={isBusy}
              onClick={onCreateCustomer}
              type="button"
            >
              <Plus aria-hidden="true" className="mr-2 h-4 w-4" />
              Create from inquiry
            </button>
          </div>
        </div>
      )}

      {feedbackMessage ? (
        <p className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800">
          {feedbackMessage}
        </p>
      ) : null}
      {errorMessage ? (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-800">
          {errorMessage}
        </p>
      ) : null}
    </section>
  );
}
