import { AlertTriangle, ArrowLeft, ArrowRight, Home, Phone, RotateCcw, Send } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { EstimateFormField, estimateInputClass } from "../../components/public/estimate/EstimateFormField";
import { EstimateStepIndicator } from "../../components/public/estimate/EstimateStepIndicator";
import { PrimaryButton } from "../../components/public/PrimaryButton";
import { SecondaryButton } from "../../components/public/SecondaryButton";
import { SectionTitle } from "../../components/public/SectionTitle";
import { getSafeApiErrorMessage } from "../../services/apiError";
import {
  getPublicEstimateOptions,
  submitPublicEstimate,
} from "../../services/publicEstimateService";
import type {
  EstimateOptions,
  PublicEstimatePayload,
  PublicEstimateResult,
} from "../../types/estimate";

const estimateFormSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required.").max(120),
  email: z.string().trim().toLowerCase().email("Enter a valid email address.").max(160),
  mobileNumber: z.string().trim().min(1, "Mobile number is required.").max(40),
  companyName: z.string().trim().max(120).optional(),
  propertyType: z.string().trim().min(1, "Property type is required."),
  serviceAddress: z.string().trim().min(1, "Service address is required.").max(240),
  city: z.string().trim().min(1, "City is required.").max(120),
  province: z.string().trim().min(1, "Province is required.").max(120),
  airconType: z.string().trim().min(1, "Aircon type is required."),
  airconCapacity: z.string().trim().min(1, "Aircon capacity is required."),
  quantity: z.number().int().min(1, "Quantity must be at least 1.").max(50),
  brand: z.string().trim().max(80).optional(),
  unitCondition: z.string().trim().min(1, "Existing or new unit is required."),
  indoorUnitLocation: z.string().trim().max(160).optional(),
  outdoorUnitLocation: z.string().trim().max(160).optional(),
  selectedService: z.string().trim().min(1, "Primary service is required."),
  preferredDate: z.string().trim().optional(),
  notes: z.string().trim().max(3000).optional(),
  urgencyLevel: z.string().trim().min(1, "Urgency level is required."),
  disclaimerAccepted: z
    .boolean()
    .refine((value) => value, "You must accept the preliminary estimate disclaimer."),
  website: z.string().trim().optional(),
});

type EstimateFormValues = z.infer<typeof estimateFormSchema>;

const defaultValues: EstimateFormValues = {
  fullName: "",
  email: "",
  mobileNumber: "",
  companyName: "",
  propertyType: "",
  serviceAddress: "",
  city: "",
  province: "",
  airconType: "",
  airconCapacity: "",
  quantity: 1,
  brand: "",
  unitCondition: "",
  indoorUnitLocation: "",
  outdoorUnitLocation: "",
  selectedService: "",
  preferredDate: "",
  notes: "",
  urgencyLevel: "",
  disclaimerAccepted: false,
  website: "",
};

const steps = [
  "Customer Information",
  "Aircon Information",
  "Service Requirements",
  "Review and Estimate",
];

const stepFields: Array<Array<keyof EstimateFormValues>> = [
  [
    "fullName",
    "email",
    "mobileNumber",
    "companyName",
    "propertyType",
    "serviceAddress",
    "city",
    "province",
  ],
  [
    "airconType",
    "airconCapacity",
    "quantity",
    "brand",
    "unitCondition",
    "indoorUnitLocation",
    "outdoorUnitLocation",
  ],
  ["selectedService", "preferredDate", "notes", "urgencyLevel"],
  ["disclaimerAccepted"],
];

function SelectField({
  label,
  error,
  value,
  options,
  onChange,
}: {
  label: string;
  error?: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <EstimateFormField error={error} label={label}>
      <select className={estimateInputClass} onChange={(event) => onChange(event.target.value)} value={value}>
        <option value="">Select {label.toLowerCase()}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </EstimateFormField>
  );
}

function formatMoney(value: string) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(Number(value));
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function SummaryRow({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="rounded-md bg-slate-50 p-3">
      <p className="text-xs font-bold uppercase text-slate-500">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-slate-900">
        {value || "Not provided"}
      </p>
    </div>
  );
}

export function FreeQuotationPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [options, setOptions] = useState<EstimateOptions | null>(null);
  const [result, setResult] = useState<PublicEstimateResult | null>(null);
  const [isOptionsLoading, setIsOptionsLoading] = useState(true);
  const [optionsError, setOptionsError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    trigger,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<EstimateFormValues>({
    resolver: zodResolver(estimateFormSchema),
    defaultValues,
  });
  const watchedValues = watch();

  useEffect(() => {
    let isMounted = true;

    async function loadOptions() {
      try {
        const estimateOptions = await getPublicEstimateOptions();

        if (isMounted) {
          setOptions(estimateOptions);
          setOptionsError("");
        }
      } catch (error) {
        if (isMounted) {
          setOptionsError(
            getSafeApiErrorMessage(error, "Unable to load estimate form options."),
          );
        }
      } finally {
        if (isMounted) {
          setIsOptionsLoading(false);
        }
      }
    }

    void loadOptions();

    return () => {
      isMounted = false;
    };
  }, []);

  const selectedService = useMemo(
    () => options?.services.find((service) => service.label === watchedValues.selectedService),
    [options?.services, watchedValues.selectedService],
  );

  async function goNext() {
    const isValid = await trigger(stepFields[currentStep]);

    if (isValid) {
      setCurrentStep((step) => Math.min(step + 1, steps.length - 1));
      setSubmitError("");
    }
  }

  function goBack() {
    setCurrentStep((step) => Math.max(step - 1, 0));
    setSubmitError("");
  }

  async function onSubmit(values: EstimateFormValues) {
    setSubmitError("");

    try {
      const payload: PublicEstimatePayload = {
        ...values,
        notes: values.notes ?? "",
      };
      const estimate = await submitPublicEstimate(payload);
      setResult(estimate);
      reset(defaultValues);
      setCurrentStep(0);
    } catch (error) {
      setSubmitError(
        getSafeApiErrorMessage(
          error,
          "Unable to submit your estimate request right now. Please try again later.",
        ),
      );
    }
  }

  function submitAnother() {
    setResult(null);
    setSubmitError("");
    reset(defaultValues);
    setCurrentStep(0);
  }

  if (result) {
    return (
      <main>
        <section className="bg-white px-6 py-16 sm:py-20">
          <div className="mx-auto max-w-4xl">
            <p className="text-sm font-bold uppercase text-blue-700">RRDS Airconditioning Services</p>
            <h1 className="mt-3 text-3xl font-bold text-slate-950">Estimate Request Submitted</h1>
            <div className="mt-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                <div className="flex gap-3">
                  <AlertTriangle aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
                  <p className="text-sm font-bold leading-6 text-amber-900">
                    This is not an official quotation. RRDS will review your request before providing final pricing.
                  </p>
                </div>
              </div>

              <dl className="mt-6 grid gap-4 sm:grid-cols-2">
                <SummaryRow label="Estimate number" value={result.estimateNumber} />
                <SummaryRow label="Selected service" value={result.selectedService} />
                <SummaryRow label="Submission status" value={result.status.replace("_", " ")} />
                <SummaryRow label="Generated date" value={formatDate(result.generatedDate)} />
                <SummaryRow label="Estimated subtotal" value={formatMoney(result.estimatedSubtotal)} />
                <SummaryRow
                  label="Estimated additional fees"
                  value={formatMoney(result.estimatedAdditionalFees)}
                />
                <SummaryRow label="Estimated tax" value={formatMoney(result.estimatedTax)} />
                <SummaryRow label="Estimated total" value={formatMoney(result.estimatedTotal)} />
              </dl>

              <p className="mt-6 rounded-lg bg-slate-50 p-4 text-sm font-medium leading-6 text-slate-700">
                {result.disclaimer}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <SecondaryButton className="gap-2" onClick={submitAnother}>
                  <RotateCcw aria-hidden="true" className="h-4 w-4" />
                  Submit Another Estimate
                </SecondaryButton>
                <SecondaryButton className="gap-2" to="/contact">
                  <Phone aria-hidden="true" className="h-4 w-4" />
                  Contact RRDS
                </SecondaryButton>
                <PrimaryButton className="gap-2" to="/">
                  <Home aria-hidden="true" className="h-4 w-4" />
                  Return to Home
                </PrimaryButton>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main>
      <section className="bg-white px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <SectionTitle
            description="Request an automated preliminary estimate for airconditioning service. Final pricing still requires RRDS review and approval."
            eyebrow="Free Estimate"
            title="Request an Initial Service Estimate"
          />

          <div className="mt-10 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <aside className="space-y-5">
              <EstimateStepIndicator currentStep={currentStep} steps={steps} />
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                <div className="flex gap-3">
                  <AlertTriangle aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
                  <div>
                    <p className="text-sm font-bold leading-6 text-amber-900">
                      Automated preliminary estimate only.
                    </p>
                    <p className="mt-1 text-sm leading-6 text-amber-900">
                      {options?.pricingNotice ??
                        "Sample development pricing — replace with approved RRDS pricing."}
                    </p>
                  </div>
                </div>
              </div>
            </aside>

            <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              {isOptionsLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 6 }, (_, index) => (
                    <div key={index} className="h-12 animate-pulse rounded-md bg-slate-100" />
                  ))}
                </div>
              ) : null}

              {optionsError ? (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">
                  {optionsError}
                </div>
              ) : null}

              {options ? (
                <form onSubmit={(event) => void handleSubmit(onSubmit)(event)}>
                  <input
                    {...register("website")}
                    aria-hidden="true"
                    autoComplete="off"
                    className="hidden"
                    tabIndex={-1}
                    type="text"
                  />

                  {currentStep === 0 ? (
                    <div className="grid gap-5 md:grid-cols-2">
                      <EstimateFormField error={errors.fullName?.message} label="Full name">
                        <input className={estimateInputClass} {...register("fullName")} />
                      </EstimateFormField>
                      <EstimateFormField error={errors.email?.message} label="Email address">
                        <input className={estimateInputClass} type="email" {...register("email")} />
                      </EstimateFormField>
                      <EstimateFormField error={errors.mobileNumber?.message} label="Mobile number">
                        <input className={estimateInputClass} type="tel" {...register("mobileNumber")} />
                      </EstimateFormField>
                      <EstimateFormField error={errors.companyName?.message} label="Company name, optional">
                        <input className={estimateInputClass} {...register("companyName")} />
                      </EstimateFormField>
                      <SelectField
                        error={errors.propertyType?.message}
                        label="Property type"
                        onChange={(value) => setValue("propertyType", value, { shouldValidate: true })}
                        options={options.propertyTypes}
                        value={watchedValues.propertyType}
                      />
                      <EstimateFormField error={errors.city?.message} label="City">
                        <input className={estimateInputClass} {...register("city")} />
                      </EstimateFormField>
                      <EstimateFormField error={errors.province?.message} label="Province">
                        <input className={estimateInputClass} {...register("province")} />
                      </EstimateFormField>
                      <EstimateFormField
                        className="md:col-span-2"
                        error={errors.serviceAddress?.message}
                        label="Service address"
                      >
                        <textarea
                          className={`${estimateInputClass} min-h-28 resize-y`}
                          {...register("serviceAddress")}
                        />
                      </EstimateFormField>
                    </div>
                  ) : null}

                  {currentStep === 1 ? (
                    <div className="grid gap-5 md:grid-cols-2">
                      <SelectField
                        error={errors.airconType?.message}
                        label="Aircon type"
                        onChange={(value) => setValue("airconType", value, { shouldValidate: true })}
                        options={options.airconTypes}
                        value={watchedValues.airconType}
                      />
                      <SelectField
                        error={errors.airconCapacity?.message}
                        label="Aircon capacity"
                        onChange={(value) => setValue("airconCapacity", value, { shouldValidate: true })}
                        options={options.airconCapacities}
                        value={watchedValues.airconCapacity}
                      />
                      <EstimateFormField error={errors.quantity?.message} label="Quantity">
                        <input
                          className={estimateInputClass}
                          min={1}
                          type="number"
                          {...register("quantity", { valueAsNumber: true })}
                        />
                      </EstimateFormField>
                      <EstimateFormField error={errors.brand?.message} label="Brand, optional">
                        <input className={estimateInputClass} {...register("brand")} />
                      </EstimateFormField>
                      <SelectField
                        error={errors.unitCondition?.message}
                        label="Existing or new unit"
                        onChange={(value) => setValue("unitCondition", value, { shouldValidate: true })}
                        options={options.unitConditions}
                        value={watchedValues.unitCondition}
                      />
                      <EstimateFormField error={errors.indoorUnitLocation?.message} label="Indoor unit location, optional">
                        <input className={estimateInputClass} {...register("indoorUnitLocation")} />
                      </EstimateFormField>
                      <EstimateFormField
                        className="md:col-span-2"
                        error={errors.outdoorUnitLocation?.message}
                        label="Outdoor unit location, optional"
                      >
                        <input className={estimateInputClass} {...register("outdoorUnitLocation")} />
                      </EstimateFormField>
                    </div>
                  ) : null}

                  {currentStep === 2 ? (
                    <div className="grid gap-5 md:grid-cols-2">
                      <EstimateFormField
                        className="md:col-span-2"
                        error={errors.selectedService?.message}
                        label="Primary service"
                      >
                        <select
                          className={estimateInputClass}
                          onChange={(event) =>
                            setValue("selectedService", event.target.value, { shouldValidate: true })
                          }
                          value={watchedValues.selectedService}
                        >
                          <option value="">Select primary service</option>
                          {options.services.map((service) => (
                            <option key={service.label} value={service.label}>
                              {service.label} - sample base {formatMoney(service.sampleBasePrice)}
                            </option>
                          ))}
                        </select>
                        {selectedService ? (
                          <p className="mt-2 text-xs font-medium text-amber-700">
                            Sample development pricing — replace with approved RRDS pricing.
                          </p>
                        ) : null}
                      </EstimateFormField>
                      <EstimateFormField error={errors.preferredDate?.message} label="Preferred service date, optional">
                        <input className={estimateInputClass} type="date" {...register("preferredDate")} />
                      </EstimateFormField>
                      <SelectField
                        error={errors.urgencyLevel?.message}
                        label="Urgency level"
                        onChange={(value) => setValue("urgencyLevel", value, { shouldValidate: true })}
                        options={options.urgencyLevels}
                        value={watchedValues.urgencyLevel}
                      />
                      <EstimateFormField
                        className="md:col-span-2"
                        error={errors.notes?.message}
                        label="Problem description or service notes"
                      >
                        <textarea
                          className={`${estimateInputClass} min-h-32 resize-y`}
                          placeholder="Describe the service needed. Emergency requests are still subject to RRDS review and availability."
                          {...register("notes")}
                        />
                      </EstimateFormField>
                    </div>
                  ) : null}

                  {currentStep === 3 ? (
                    <div className="space-y-5">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <SummaryRow label="Full name" value={watchedValues.fullName} />
                        <SummaryRow label="Email" value={watchedValues.email} />
                        <SummaryRow label="Mobile number" value={watchedValues.mobileNumber} />
                        <SummaryRow label="Company" value={watchedValues.companyName} />
                        <SummaryRow label="Property type" value={watchedValues.propertyType} />
                        <SummaryRow label="Service address" value={watchedValues.serviceAddress} />
                        <SummaryRow label="City" value={watchedValues.city} />
                        <SummaryRow label="Province" value={watchedValues.province} />
                        <SummaryRow label="Aircon type" value={watchedValues.airconType} />
                        <SummaryRow label="Capacity" value={watchedValues.airconCapacity} />
                        <SummaryRow label="Quantity" value={watchedValues.quantity} />
                        <SummaryRow label="Brand" value={watchedValues.brand} />
                        <SummaryRow label="Unit" value={watchedValues.unitCondition} />
                        <SummaryRow label="Indoor location" value={watchedValues.indoorUnitLocation} />
                        <SummaryRow label="Outdoor location" value={watchedValues.outdoorUnitLocation} />
                        <SummaryRow label="Service" value={watchedValues.selectedService} />
                        <SummaryRow label="Preferred date" value={watchedValues.preferredDate} />
                        <SummaryRow label="Urgency" value={watchedValues.urgencyLevel} />
                      </div>
                      <SummaryRow label="Notes" value={watchedValues.notes} />
                      <label className="flex gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-800">
                        <input
                          className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-700"
                          type="checkbox"
                          {...register("disclaimerAccepted")}
                        />
                        <span>
                          {options.disclaimer}
                          {errors.disclaimerAccepted ? (
                            <span className="mt-2 block text-red-700">
                              {errors.disclaimerAccepted.message}
                            </span>
                          ) : null}
                        </span>
                      </label>
                    </div>
                  ) : null}

                  {submitError ? (
                    <div className="mt-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
                      {submitError}
                    </div>
                  ) : null}

                  <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
                    <SecondaryButton
                      className="gap-2 disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-slate-400"
                      disabled={currentStep === 0 || isSubmitting}
                      onClick={goBack}
                    >
                      <ArrowLeft aria-hidden="true" className="h-4 w-4" />
                      Back
                    </SecondaryButton>
                    {currentStep < steps.length - 1 ? (
                      <PrimaryButton className="gap-2" disabled={isSubmitting} onClick={() => void goNext()}>
                        Continue
                        <ArrowRight aria-hidden="true" className="h-4 w-4" />
                      </PrimaryButton>
                    ) : (
                      <PrimaryButton
                        className="gap-2 disabled:cursor-not-allowed disabled:bg-slate-400"
                        disabled={isSubmitting}
                        type="submit"
                      >
                        <Send aria-hidden="true" className="h-4 w-4" />
                        {isSubmitting ? "Submitting..." : "Submit Estimate Request"}
                      </PrimaryButton>
                    )}
                  </div>
                </form>
              ) : null}
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
