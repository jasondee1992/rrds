import { Eye } from "lucide-react";
import { Link } from "react-router-dom";
import type { EstimateListItem } from "../../../types/estimate";
import { EstimateStatusBadge } from "./EstimateStatusBadge";

function formatDate(value: string) {
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

export function EstimateTable({ estimates }: { estimates: EstimateListItem[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
      <table className="min-w-[1040px] w-full border-collapse text-left text-sm">
        <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-500">
          <tr>
            <th className="px-4 py-3">Estimate</th>
            <th className="px-4 py-3">Customer</th>
            <th className="px-4 py-3">Service</th>
            <th className="px-4 py-3">Aircon</th>
            <th className="px-4 py-3">Capacity</th>
            <th className="px-4 py-3">Qty</th>
            <th className="px-4 py-3">Estimated total</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Submitted</th>
            <th className="px-4 py-3 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {estimates.map((estimate) => (
            <tr
              className={estimate.status === "SUBMITTED" ? "bg-cyan-50/40" : "bg-white"}
              key={estimate.id}
            >
              <td className="px-4 py-4 font-bold text-slate-950">{estimate.estimateNumber}</td>
              <td className="px-4 py-4">
                <p className="font-semibold text-slate-900">{estimate.customer.fullName}</p>
                <p className="mt-1 text-xs text-slate-500">{estimate.customer.email}</p>
              </td>
              <td className="px-4 py-4 text-slate-700">{estimate.selectedService}</td>
              <td className="px-4 py-4 text-slate-700">{estimate.airconType}</td>
              <td className="px-4 py-4 text-slate-700">{estimate.airconCapacity}</td>
              <td className="px-4 py-4 text-slate-700">{estimate.quantity}</td>
              <td className="px-4 py-4 font-semibold text-slate-900">
                {formatMoney(estimate.estimatedTotal)}
              </td>
              <td className="px-4 py-4">
                <EstimateStatusBadge status={estimate.status} />
              </td>
              <td className="px-4 py-4 text-slate-600">{formatDate(estimate.createdAt)}</td>
              <td className="px-4 py-4 text-right">
                <Link
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-700"
                  title="View estimate request"
                  to={`/admin/estimates/${estimate.id}`}
                >
                  <Eye aria-hidden="true" className="h-4 w-4" />
                  <span className="sr-only">View estimate request</span>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
