import type { InquiryStatus } from "../../../types/inquiry";

const statusClasses: Record<InquiryStatus, string> = {
  NEW: "bg-cyan-50 text-cyan-800 ring-cyan-200",
  IN_PROGRESS: "bg-blue-50 text-blue-800 ring-blue-200",
  RESOLVED: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  CLOSED: "bg-slate-100 text-slate-700 ring-slate-200",
};

export function InquiryStatusBadge({ status }: { status: InquiryStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-bold ring-1 ring-inset ${statusClasses[status]}`}
    >
      {status.replace("_", " ")}
    </span>
  );
}
