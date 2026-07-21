import type { EstimateRequestStatus } from "../../../types/estimate";

const statusClasses: Record<EstimateRequestStatus, string> = {
  DRAFT: "bg-slate-100 text-slate-700 ring-slate-200",
  SUBMITTED: "bg-cyan-50 text-cyan-800 ring-cyan-200",
  UNDER_REVIEW: "bg-blue-50 text-blue-800 ring-blue-200",
  ESTIMATE_READY: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  CONVERTED_TO_QUOTATION: "bg-violet-50 text-violet-800 ring-violet-200",
  CANCELLED: "bg-red-50 text-red-800 ring-red-200",
};

export function EstimateStatusBadge({ status }: { status: EstimateRequestStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-bold ring-1 ring-inset ${statusClasses[status]}`}
    >
      {status.replaceAll("_", " ")}
    </span>
  );
}
