import { AlertTriangle, ArrowLeft } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getSafeApiErrorMessage } from "../../services/apiError";
import { getAdminQuotationDetails } from "../../services/adminQuotationService";
import type { QuotationDetails } from "../../types/quotation";

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

function DetailItem({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div>
      <dt className="text-xs font-bold uppercase text-slate-500">{label}</dt>
      <dd className="mt-1 break-words text-sm font-medium text-slate-900">
        {value || "Not provided"}
      </dd>
    </div>
  );
}

export function AdminQuotationDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [quotation, setQuotation] = useState<QuotationDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadQuotation = useCallback(async () => {
    if (!id) {
      setErrorMessage("Invalid quotation ID.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const result = await getAdminQuotationDetails(id);
      setQuotation(result);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(getSafeApiErrorMessage(error, "Unable to load quotation details."));
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadQuotation();
  }, [loadQuotation]);

  if (isLoading) {
    return (
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-4">
          {Array.from({ length: 8 }, (_, index) => (
            <div key={index} className="h-12 animate-pulse rounded-md bg-slate-100" />
          ))}
        </div>
      </section>
    );
  }

  if (errorMessage || !quotation) {
    return (
      <section className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-800">
        <h2 className="text-lg font-bold">Quotation unavailable</h2>
        <p className="mt-2 text-sm font-medium">
          {errorMessage || "Unable to load quotation details."}
        </p>
        <Link className="mt-5 inline-flex text-sm font-bold text-red-900 underline" to="/admin/quotations">
          Back to quotations
        </Link>
      </section>
    );
  }

  return (
    <div className="space-y-5">
      <Link
        className="inline-flex items-center gap-2 text-sm font-bold text-blue-800 hover:text-blue-900"
        to="/admin/quotations"
      >
        <ArrowLeft aria-hidden="true" className="h-4 w-4" />
        Back to quotations
      </Link>

      <section className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-950">
        <div className="flex gap-3">
          <AlertTriangle aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
          <p className="text-sm font-bold">
            DRAFT - NOT YET AN OFFICIAL OR APPROVED QUOTATION
          </p>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-bold text-blue-700">{quotation.quotationNumber}</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-950">
              Draft Quotation
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Created {formatDate(quotation.createdAt)}. Valid until {formatDate(quotation.validUntil)}.
            </p>
          </div>
          <span className="rounded-md bg-blue-50 px-3 py-2 text-sm font-bold text-blue-700">
            {quotation.status}
          </span>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1fr_0.8fr]">
        <div className="space-y-5">
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-bold text-slate-950">Customer and reference</h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <DetailItem label="Customer" value={quotation.customer.fullName} />
              <DetailItem label="Company" value={quotation.customer.companyName} />
              <DetailItem label="Email" value={quotation.customer.email} />
              <DetailItem label="Mobile" value={quotation.customer.mobileNumber} />
              <DetailItem label="Billing address" value={quotation.customer.address} />
              <DetailItem label="Service address" value={quotation.estimateRequest?.serviceAddress} />
              <DetailItem label="Reference estimate" value={quotation.estimateRequest?.estimateNumber} />
              <DetailItem label="Selected service" value={quotation.estimateRequest?.selectedService} />
              <DetailItem label="Prepared by" value={quotation.preparedBy.fullName} />
              <DetailItem label="Quotation date" value={formatDate(quotation.quotationDate)} />
            </dl>
          </section>

          <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-5">
              <h2 className="text-base font-bold text-slate-950">Quotation items</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-left text-xs font-bold uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Qty</th>
                    <th className="px-4 py-3">Unit price</th>
                    <th className="px-4 py-3">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {quotation.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3 font-medium text-slate-950">{item.description}</td>
                      <td className="px-4 py-3 text-slate-700">{item.itemType}</td>
                      <td className="px-4 py-3 text-slate-700">
                        {Number(item.quantity).toLocaleString()} {item.unit}
                      </td>
                      <td className="px-4 py-3 text-slate-700">{formatMoney(item.unitPrice)}</td>
                      <td className="px-4 py-3 font-semibold text-slate-950">
                        {formatMoney(item.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-bold text-slate-950">Scope and terms</h2>
            <div className="mt-4 space-y-4">
              <DetailItem label="Scope of work" value={quotation.scopeOfWork} />
              <DetailItem label="Payment terms" value={quotation.paymentTerms} />
              <DetailItem label="Warranty terms" value={quotation.warrantyTerms} />
              <DetailItem label="Exclusions" value={quotation.exclusions} />
              <DetailItem label="Notes" value={quotation.notes} />
            </div>
          </section>
        </div>

        <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-bold text-slate-950">Pricing</h2>
          <dl className="mt-4 space-y-3">
            <div className="flex justify-between gap-4 text-sm">
              <dt className="font-medium text-slate-600">Subtotal</dt>
              <dd className="font-bold text-slate-950">{formatMoney(quotation.subtotal)}</dd>
            </div>
            <div className="flex justify-between gap-4 text-sm">
              <dt className="font-medium text-slate-600">Discount</dt>
              <dd className="font-bold text-slate-950">{formatMoney(quotation.discount)}</dd>
            </div>
            <div className="flex justify-between gap-4 text-sm">
              <dt className="font-medium text-slate-600">Tax ({Number(quotation.taxRate)}%)</dt>
              <dd className="font-bold text-slate-950">{formatMoney(quotation.taxAmount)}</dd>
            </div>
            <div className="flex justify-between gap-4 text-sm">
              <dt className="font-medium text-slate-600">Additional fees</dt>
              <dd className="font-bold text-slate-950">{formatMoney(quotation.additionalFees)}</dd>
            </div>
            <div className="border-t border-slate-200 pt-3">
              <div className="flex justify-between gap-4">
                <dt className="font-bold text-slate-950">Grand total</dt>
                <dd className="text-xl font-bold text-blue-800">
                  {formatMoney(quotation.grandTotal)}
                </dd>
              </div>
            </div>
          </dl>
        </aside>
      </section>
    </div>
  );
}
