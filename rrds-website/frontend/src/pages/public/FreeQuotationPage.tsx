import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { PrimaryButton } from "../../components/public/PrimaryButton";
import { SectionTitle } from "../../components/public/SectionTitle";
import { quotationSteps } from "../../data/publicData";

const inputClass =
  "mt-2 w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-700 focus:ring-2 focus:ring-blue-700/20";

export function FreeQuotationPage() {
  return (
    <main>
      <section className="bg-white px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <SectionTitle
            description="Frontend-only visual layout for a future quotation flow. This phase does not submit, store, or calculate quotation data."
            eyebrow="Free Quotation"
            title="Request an Initial Service Estimate"
          />

          <div className="mt-10 grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
            <aside className="rounded-lg border border-slate-200 bg-slate-50 p-6">
              <h2 className="text-lg font-bold text-slate-950">Quotation Steps</h2>
              <ol className="mt-6 space-y-4">
                {quotationSteps.map((step, index) => (
                  <li className="flex gap-4" key={step}>
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                        index === 0
                          ? "bg-blue-700 text-white"
                          : "bg-white text-blue-800 ring-1 ring-slate-200"
                      }`}
                    >
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-bold text-slate-950">{step}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        Placeholder step for the future quotation workflow.
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </aside>

            <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                <div className="flex gap-3">
                  <AlertTriangle aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
                  <p className="text-sm font-semibold leading-6 text-amber-900">
                    This tool provides an initial estimate only. Final pricing is subject to
                    inspection and official RRDS approval.
                  </p>
                </div>
              </div>

              <form className="mt-8" onSubmit={(event) => event.preventDefault()}>
                <div className="grid gap-5 md:grid-cols-2">
                  <label className="text-sm font-semibold text-slate-800">
                    Full name
                    <input className={inputClass} name="fullName" placeholder="Enter full name" type="text" />
                  </label>
                  <label className="text-sm font-semibold text-slate-800">
                    Email
                    <input className={inputClass} name="email" placeholder="Enter email address" type="email" />
                  </label>
                  <label className="text-sm font-semibold text-slate-800">
                    Mobile number
                    <input className={inputClass} name="mobileNumber" placeholder="Enter mobile number" type="tel" />
                  </label>
                  <label className="text-sm font-semibold text-slate-800">
                    Property type
                    <select className={inputClass} defaultValue="" name="propertyType">
                      <option disabled value="">
                        Select property type
                      </option>
                      <option>Residential</option>
                      <option>Commercial</option>
                      <option>Other</option>
                    </select>
                  </label>
                  <label className="text-sm font-semibold text-slate-800 md:col-span-2">
                    Service address
                    <textarea
                      className={`${inputClass} min-h-28 resize-y`}
                      name="serviceAddress"
                      placeholder="Enter service address"
                    />
                  </label>
                </div>

                <div className="mt-8 rounded-lg border border-slate-200 bg-slate-50 p-5">
                  <div className="flex gap-3">
                    <CheckCircle2 aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" />
                    <p className="text-sm leading-6 text-slate-700">
                      Additional aircon details, review screens, file uploads, pricing logic, and
                      backend submission are intentionally excluded from Phase 2.
                    </p>
                  </div>
                </div>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <PrimaryButton disabled className="disabled:cursor-not-allowed disabled:bg-slate-400">
                    Continue to Aircon Information
                  </PrimaryButton>
                </div>
              </form>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
