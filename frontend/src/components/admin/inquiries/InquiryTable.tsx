import { Eye } from "lucide-react";
import { Link } from "react-router-dom";
import type { InquiryListItem } from "../../../types/inquiry";
import { InquiryStatusBadge } from "./InquiryStatusBadge";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

type InquiryTableProps = {
  inquiries: InquiryListItem[];
};

export function InquiryTable({ inquiries }: InquiryTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
      <table className="min-w-[920px] w-full border-collapse text-left text-sm">
        <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-500">
          <tr>
            <th className="px-4 py-3">Reference</th>
            <th className="px-4 py-3">Customer</th>
            <th className="px-4 py-3">Subject</th>
            <th className="px-4 py-3">Contact</th>
            <th className="px-4 py-3">Source</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Submitted</th>
            <th className="px-4 py-3 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {inquiries.map((inquiry) => (
            <tr key={inquiry.id} className={inquiry.status === "NEW" ? "bg-cyan-50/40" : "bg-white"}>
              <td className="px-4 py-4 font-bold text-slate-950">{inquiry.referenceNumber}</td>
              <td className="px-4 py-4">
                <p className="font-semibold text-slate-900">{inquiry.fullName}</p>
                {inquiry.customerId ? (
                  <p className="mt-1 text-xs font-medium text-emerald-700">Linked customer</p>
                ) : null}
              </td>
              <td className="max-w-[260px] px-4 py-4">
                <p className="truncate font-medium text-slate-800">{inquiry.subject}</p>
              </td>
              <td className="px-4 py-4 text-slate-600">
                <p>{inquiry.mobileNumber || inquiry.email}</p>
                {inquiry.mobileNumber ? (
                  <p className="mt-1 text-xs text-slate-500">{inquiry.email}</p>
                ) : null}
              </td>
              <td className="px-4 py-4 text-slate-700">{inquiry.source.replace("_", " ")}</td>
              <td className="px-4 py-4">
                <InquiryStatusBadge status={inquiry.status} />
              </td>
              <td className="px-4 py-4 text-slate-600">{formatDate(inquiry.createdAt)}</td>
              <td className="px-4 py-4 text-right">
                <Link
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-700"
                  title="View inquiry"
                  to={`/admin/inquiries/${inquiry.id}`}
                >
                  <Eye aria-hidden="true" className="h-4 w-4" />
                  <span className="sr-only">View inquiry</span>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
