import { AlertTriangle, Download, Home, Phone } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getSafeApiErrorMessage } from "../../services/apiError";
import {
  getPublicEstimateAccess,
  getPublicEstimatePdfUrl,
} from "../../services/publicEstimateService";
import type { PublicEstimateDocument } from "../../types/estimate";

function formatDate(value: string | null, includeTime = false) {
  if (!value) {
    return "Not provided";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: includeTime ? "numeric" : undefined,
    minute: includeTime ? "2-digit" : undefined,
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
      <dd className="mt-1 break-words text-sm font-semibold text-slate-950">
        {value || "Not provided"}
      </dd>
    </div>
  );
}

export function PublicEstimatePage() {
  const { token } = useParams<{ token: string }>();
  const [estimate, setEstimate] = useState<PublicEstimateDocument | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadEstimate() {
      if (!token) {
        setErrorMessage("This estimate is unavailable or the access link is invalid.");
        setIsLoading(false);
        return;
      }

      try {
        const result = await getPublicEstimateAccess(token);

        if (isMounted) {
          setEstimate(result);
          setErrorMessage("");
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(
            getSafeApiErrorMessage(
              error,
              "This estimate is unavailable or the access link is invalid.",
            ),
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadEstimate();

    return () => {
      isMounted = false;
    };
  }, [token]);

  if (isLoading) {
    return (
      <main>
        <section className="bg-white px-6 py-16">
          <div className="mx-auto max-w-5xl space-y-4">
            {Array.from({ length: 8 }, (_, index) => (
              <div key={index} className="h-12 animate-pulse rounded-md bg-slate-100" />
            ))}
          </div>
        </section>
      </main>
    );
  }

  if (errorMessage || !estimate || !token) {
    return (
      <main>
        <section className="bg-white px-6 py-16">
          <div className="mx-auto max-w-3xl rounded-lg border border-amber-200 bg-amber-50 p-6">
            <div className="flex gap-3">
              <AlertTriangle aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-amber-700" />
              <div>
                <h1 className="text-xl font-bold text-amber-950">Estimate unavailable</h1>
                <p className="mt-2 text-sm font-medium leading-6 text-amber-900">
                  {errorMessage || "This estimate is unavailable or the access link is invalid."}
                </p>
                <Link className="mt-5 inline-flex text-sm font-bold text-amber-950 underline" to="/">
                  Return to Home
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main>
      <section className="bg-white px-6 py-10 sm:py-14">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col gap-6 border-b border-slate-200 pb-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase text-blue-700">RRDS Airconditioning Services</p>
              <h1 className="mt-2 text-3xl font-bold text-slate-950">Preliminary Cost Estimate</h1>
              <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-slate-600">
                This read-only estimate preview is generated from the saved RRDS estimate request.
              </p>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
              <p className="font-bold text-slate-950">{estimate.estimateNumber}</p>
              <p className="mt-1 text-slate-600">Generated {formatDate(estimate.generatedDate, true)}</p>
            </div>
          </div>

          <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
            <div className="flex gap-3">
              <AlertTriangle aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
              <p className="text-sm font-bold leading-6 text-amber-950">
                This is a Preliminary Cost Estimate only and is not an official quotation, invoice,
                purchase order, contract, or billing document.
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.8fr]">
            <section className="space-y-6">
              <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-base font-bold text-slate-950">Estimate information</h2>
                <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                  <DetailItem label="Estimate number" value={estimate.estimateNumber} />
                  <DetailItem label="Generated date" value={formatDate(estimate.generatedDate, true)} />
                  <DetailItem label="Valid until" value={formatDate(estimate.validUntil)} />
                  <DetailItem label="Current status" value={estimate.status.replaceAll("_", " ")} />
                </dl>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-base font-bold text-slate-950">Customer and property</h2>
                <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                  <DetailItem label="Customer name" value={estimate.customer.fullName} />
                  <DetailItem label="Company name" value={estimate.customer.companyName} />
                  <DetailItem label="Service address" value={estimate.serviceAddress} />
                  <DetailItem label="Property type" value={estimate.propertyType} />
                </dl>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-base font-bold text-slate-950">Service details</h2>
                <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                  <DetailItem label="Selected service" value={estimate.selectedService} />
                  <DetailItem label="Aircon type" value={estimate.airconType} />
                  <DetailItem label="Aircon capacity" value={estimate.airconCapacity} />
                  <DetailItem label="Quantity" value={estimate.quantity} />
                  <DetailItem label="Brand" value={estimate.brand} />
                  <DetailItem label="Existing or new unit" value={estimate.unitCondition} />
                  <DetailItem label="Indoor unit location" value={estimate.indoorUnitLocation} />
                  <DetailItem label="Outdoor unit location" value={estimate.outdoorUnitLocation} />
                  <DetailItem label="Preferred service date" value={formatDate(estimate.preferredDate)} />
                  <DetailItem label="Urgency" value={estimate.urgencyLevel} />
                </dl>
                <div className="mt-5">
                  <p className="text-xs font-bold uppercase text-slate-500">Notes</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                    {estimate.notes || "Not provided"}
                  </p>
                </div>
              </div>
            </section>

            <aside className="space-y-6">
              <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-base font-bold text-slate-950">Estimated cost breakdown</h2>
                <dl className="mt-4 space-y-3">
                  <div className="flex items-center justify-between gap-4 text-sm">
                    <dt className="font-medium text-slate-600">Estimated additional fees</dt>
                    <dd className="font-bold text-slate-950">
                      {formatMoney(estimate.estimatedAdditionalFees)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4 text-sm">
                    <dt className="font-medium text-slate-600">Estimated subtotal</dt>
                    <dd className="font-bold text-slate-950">{formatMoney(estimate.estimatedSubtotal)}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4 text-sm">
                    <dt className="font-medium text-slate-600">Estimated tax</dt>
                    <dd className="font-bold text-slate-950">{formatMoney(estimate.estimatedTax)}</dd>
                  </div>
                  <div className="border-t border-slate-200 pt-3">
                    <div className="flex items-center justify-between gap-4">
                      <dt className="font-bold text-slate-950">Estimated total</dt>
                      <dd className="text-xl font-bold text-blue-800">
                        {formatMoney(estimate.estimatedTotal)}
                      </dd>
                    </div>
                  </div>
                </dl>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-base font-bold text-slate-950">Actions</h2>
                <div className="mt-4 flex flex-col gap-3">
                  <a
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-blue-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2"
                    href={getPublicEstimatePdfUrl(token)}
                  >
                    <Download aria-hidden="true" className="h-4 w-4" />
                    Download PDF
                  </a>
                  <Link
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-blue-700 bg-white px-5 py-3 text-sm font-semibold text-blue-800 transition hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2"
                    to="/contact"
                  >
                    <Phone aria-hidden="true" className="h-4 w-4" />
                    Contact RRDS
                  </Link>
                  <Link
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
                    to="/"
                  >
                    <Home aria-hidden="true" className="h-4 w-4" />
                    Return to Home
                  </Link>
                </div>
              </div>
            </aside>
          </div>

          <section className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm font-medium leading-6 text-amber-950">
            <p className="whitespace-pre-wrap font-bold">{estimate.requiredDisclaimer}</p>
            <p className="mt-4">{estimate.disclaimer}</p>
            <p className="mt-4">
              Prices may change after inspection. No authorized signature or approval stamp is
              included. Reference: {estimate.estimateNumber}.
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}
