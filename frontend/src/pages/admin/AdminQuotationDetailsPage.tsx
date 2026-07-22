import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Copy,
  Download,
  Eye,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState, type MouseEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getSafeApiErrorMessage } from "../../services/apiError";
import {
  createAdminQuotation,
  duplicateAdminQuotation,
  fetchAdminQuotationPdf,
  getAdminQuotationCustomers,
  getAdminQuotationDefaults,
  getAdminQuotationDetails,
  updateAdminQuotation,
  updateAdminQuotationStatus,
} from "../../services/adminQuotationService";
import type {
  QuotationCustomerOption,
  QuotationDetails,
  QuotationItemType,
  QuotationPayload,
  QuotationUpdatePayload,
} from "../../types/quotation";

const itemTypes: QuotationItemType[] = [
  "PRODUCT",
  "SERVICE",
  "LABOR",
  "MATERIAL",
  "TRANSPORTATION",
  "OTHER",
];

type ItemForm = {
  id?: string;
  localId: string;
  itemType: QuotationItemType;
  description: string;
  quantity: string;
  unit: string;
  unitPrice: string;
  discount: string;
};

type EditorForm = {
  customerMode: "existing" | "new";
  customerId: string;
  updateMasterCustomer: boolean;
  fullName: string;
  companyName: string;
  email: string;
  mobileNumber: string;
  billingAddress: string;
  serviceAddress: string;
  city: string;
  province: string;
  projectTitle: string;
  quotationDate: string;
  validUntil: string;
  discount: string;
  additionalFees: string;
  taxRate: string;
  scopeOfWork: string;
  exclusions: string;
  paymentTerms: string;
  warrantyTerms: string;
  notes: string;
  items: ItemForm[];
};

const emptyItem = (): ItemForm => ({
  localId: crypto.randomUUID(),
  itemType: "SERVICE",
  description: "",
  quantity: "1",
  unit: "service",
  unitPrice: "0.00",
  discount: "0.00",
});

const defaultForm: EditorForm = {
  customerMode: "new",
  customerId: "",
  updateMasterCustomer: false,
  fullName: "",
  companyName: "",
  email: "",
  mobileNumber: "",
  billingAddress: "",
  serviceAddress: "",
  city: "",
  province: "",
  projectTitle: "",
  quotationDate: new Date().toISOString().slice(0, 10),
  validUntil: new Date().toISOString().slice(0, 10),
  discount: "0.00",
  additionalFees: "0.00",
  taxRate: "0.00",
  scopeOfWork: "",
  exclusions: "",
  paymentTerms: "",
  warrantyTerms: "",
  notes: "",
  items: [emptyItem()],
};

function formatDateInput(value: string) {
  return value ? new Date(value).toISOString().slice(0, 10) : "";
}

function formatMoney(value: string | number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(Number(value));
}

function getQuotationPdfFilename(quotation: QuotationDetails) {
  const safeNumber = quotation.quotationNumber.replace(/[^A-Za-z0-9-]/g, "") || "QTN";

  if (quotation.status === "DRAFT") {
    return `RRDS-Draft-Quotation-${safeNumber}.pdf`;
  }

  if (quotation.status === "CANCELLED") {
    return `RRDS-Cancelled-Quotation-${safeNumber}.pdf`;
  }

  return `RRDS-Quotation-${safeNumber}.pdf`;
}

function getPdfStatusBanner(status: QuotationDetails["status"] | undefined) {
  if (status === "READY") {
    return "READY — PDF MAY BE PRESENTED TO THE CLIENT";
  }

  if (status === "CANCELLED") {
    return "CANCELLED — THIS QUOTATION IS NO LONGER VALID";
  }

  return "DRAFT — PDF WILL CONTAIN A DRAFT WATERMARK";
}

function toNumber(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function buildFormFromQuotation(quotation: QuotationDetails): EditorForm {
  return {
    customerMode: "existing",
    customerId: quotation.customer.id,
    updateMasterCustomer: false,
    fullName: quotation.customerFullName,
    companyName: quotation.customerCompanyName ?? "",
    email: quotation.customerEmail,
    mobileNumber: quotation.customerMobileNumber,
    billingAddress: quotation.billingAddress,
    serviceAddress: quotation.serviceAddress,
    city: quotation.customer.city,
    province: quotation.customer.province,
    projectTitle: quotation.projectTitle,
    quotationDate: formatDateInput(quotation.quotationDate),
    validUntil: formatDateInput(quotation.validUntil),
    discount: quotation.discount,
    additionalFees: quotation.additionalFees,
    taxRate: quotation.taxRate,
    scopeOfWork: quotation.scopeOfWork,
    exclusions: quotation.exclusions,
    paymentTerms: quotation.paymentTerms,
    warrantyTerms: quotation.warrantyTerms,
    notes: quotation.notes,
    items: quotation.items.map((item) => ({
      id: item.id,
      localId: item.id,
      itemType: item.itemType,
      description: item.description,
      quantity: item.quantity,
      unit: item.unit,
      unitPrice: item.unitPrice,
      discount: item.discount,
    })),
  };
}

function calculatePreview(form: EditorForm) {
  const itemRows = form.items.map((item) => {
    const gross = toNumber(item.quantity) * toNumber(item.unitPrice);
    const amount = Math.max(gross - toNumber(item.discount), 0);
    return { gross, amount };
  });
  const itemsSubtotal = itemRows.reduce((total, item) => total + item.amount, 0);
  const taxableSubtotal = Math.max(
    itemsSubtotal - toNumber(form.discount) + toNumber(form.additionalFees),
    0,
  );
  const taxAmount = taxableSubtotal * (toNumber(form.taxRate) / 100);

  return {
    itemRows,
    itemsSubtotal,
    taxableSubtotal,
    taxAmount,
    grandTotal: taxableSubtotal + taxAmount,
  };
}

export function AdminQuotationDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const isNew = id === "new";
  const navigate = useNavigate();
  const [quotation, setQuotation] = useState<QuotationDetails | null>(null);
  const [customers, setCustomers] = useState<QuotationCustomerOption[]>([]);
  const [form, setForm] = useState<EditorForm>(defaultForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const [isPdfLoading, setIsPdfLoading] = useState(false);

  const preview = useMemo(() => calculatePreview(form), [form]);
  const isCancelled = quotation?.status === "CANCELLED";
  const canSave = isNew || quotation?.status === "DRAFT" || quotation?.status === "READY";

  const loadEditor = useCallback(async () => {
    setIsLoading(true);

    try {
      const [customerOptions, defaults] = await Promise.all([
        getAdminQuotationCustomers(),
        getAdminQuotationDefaults(),
      ]);
      setCustomers(customerOptions);

      if (isNew) {
        setQuotation(null);
        setForm({
          ...defaultForm,
          quotationDate: formatDateInput(defaults.quotationDate),
          validUntil: formatDateInput(defaults.validUntil),
          taxRate: defaults.taxRate,
          scopeOfWork: defaults.scopeOfWork,
          exclusions: defaults.exclusions,
          paymentTerms: defaults.paymentTerms,
          warrantyTerms: defaults.warrantyTerms,
          notes: defaults.notes,
          items: [emptyItem()],
        });
      } else if (id) {
        const result = await getAdminQuotationDetails(id);
        setQuotation(result);
        setForm(buildFormFromQuotation(result));
      }

      setErrorMessage("");
      setIsDirty(false);
    } catch (error) {
      setErrorMessage(getSafeApiErrorMessage(error, "Unable to load quotation editor."));
    } finally {
      setIsLoading(false);
    }
  }, [id, isNew]);

  useEffect(() => {
    void loadEditor();
  }, [loadEditor]);

  useEffect(() => {
    function warnBeforeUnload(event: BeforeUnloadEvent) {
      if (!isDirty) {
        return;
      }

      event.preventDefault();
      event.returnValue = "";
    }

    window.addEventListener("beforeunload", warnBeforeUnload);
    return () => window.removeEventListener("beforeunload", warnBeforeUnload);
  }, [isDirty]);

  function updateField<K extends keyof EditorForm>(key: K, value: EditorForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setIsDirty(true);
  }

  function updateItem(localId: string, patch: Partial<ItemForm>) {
    setForm((current) => ({
      ...current,
      items: current.items.map((item) =>
        item.localId === localId ? { ...item, ...patch } : item,
      ),
    }));
    setIsDirty(true);
  }

  function selectCustomer(customerId: string) {
    const customer = customers.find((item) => item.id === customerId);
    updateField("customerId", customerId);

    if (customer) {
      setForm((current) => ({
        ...current,
        customerMode: "existing",
        customerId,
        fullName: customer.fullName,
        companyName: customer.companyName ?? "",
        email: customer.email,
        mobileNumber: customer.mobileNumber,
        billingAddress: customer.address,
        serviceAddress: current.serviceAddress || customer.address,
        city: customer.city,
        province: customer.province,
      }));
      setIsDirty(true);
    }
  }

  function addItem() {
    updateField("items", [...form.items, emptyItem()]);
  }

  function duplicateItem(localId: string) {
    const item = form.items.find((current) => current.localId === localId);
    if (!item) return;
    updateField("items", [
      ...form.items,
      { ...item, id: undefined, localId: crypto.randomUUID() },
    ]);
  }

  function removeItem(localId: string) {
    if (form.items.length <= 1 || !window.confirm("Remove this quotation item?")) {
      return;
    }
    updateField("items", form.items.filter((item) => item.localId !== localId));
  }

  function moveItem(localId: string, direction: -1 | 1) {
    const index = form.items.findIndex((item) => item.localId === localId);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= form.items.length) return;
    const nextItems = [...form.items];
    const [item] = nextItems.splice(index, 1);
    nextItems.splice(target, 0, item);
    updateField("items", nextItems);
  }

  function buildPayload(): QuotationPayload {
    return {
      customer: {
        mode: form.customerMode,
        customerId: form.customerMode === "existing" ? form.customerId : undefined,
        updateMasterCustomer: form.updateMasterCustomer,
        fullName: form.fullName,
        companyName: form.companyName || undefined,
        email: form.email,
        mobileNumber: form.mobileNumber,
        billingAddress: form.billingAddress,
        serviceAddress: form.serviceAddress,
        city: form.city || undefined,
        province: form.province || undefined,
      },
      projectTitle: form.projectTitle,
      quotationDate: form.quotationDate,
      validUntil: form.validUntil,
      approvedById: null,
      discount: toNumber(form.discount),
      additionalFees: toNumber(form.additionalFees),
      taxRate: toNumber(form.taxRate),
      scopeOfWork: form.scopeOfWork,
      exclusions: form.exclusions,
      paymentTerms: form.paymentTerms,
      warrantyTerms: form.warrantyTerms,
      notes: form.notes,
      items: form.items.map((item, index) => ({
        id: item.id,
        itemType: item.itemType,
        description: item.description,
        quantity: toNumber(item.quantity),
        unit: item.unit,
        unitPrice: toNumber(item.unitPrice),
        discount: toNumber(item.discount),
        sortOrder: index + 1,
      })),
    };
  }

  async function handleSave() {
    if (!canSave || isCancelled) {
      return;
    }

    setIsSaving(true);
    setFeedback("");

    try {
      if (isNew) {
        const created = await createAdminQuotation(buildPayload());
        setIsDirty(false);
        navigate(`/admin/quotations/${created.id}`);
        return;
      }

      if (!quotation || !id) {
        return;
      }

      const payload: QuotationUpdatePayload = {
        ...buildPayload(),
        updatedAt: quotation.updatedAt,
      };
      const saved = await updateAdminQuotation(id, payload);
      setQuotation(saved);
      setForm(buildFormFromQuotation(saved));
      setIsDirty(false);
      setFeedback("Draft saved.");
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(getSafeApiErrorMessage(error, "Unable to save quotation."));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleStatus(status: "DRAFT" | "READY" | "CANCELLED") {
    if (!quotation || !id) {
      return;
    }

    if (status === "CANCELLED" && !window.confirm("Cancel this quotation?")) {
      return;
    }

    setIsSaving(true);
    setFeedback("");

    try {
      await updateAdminQuotationStatus(id, status, quotation.updatedAt);
      await loadEditor();
      setFeedback(`Quotation status changed to ${status}.`);
    } catch (error) {
      setErrorMessage(getSafeApiErrorMessage(error, "Unable to update quotation status."));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDuplicate() {
    if (!quotation || !id) {
      return;
    }

    setIsSaving(true);
    setFeedback("");

    try {
      const duplicate = await duplicateAdminQuotation(id);
      setIsDirty(false);
      navigate(`/admin/quotations/${duplicate.id}`);
    } catch (error) {
      setErrorMessage(getSafeApiErrorMessage(error, "Unable to duplicate quotation."));
    } finally {
      setIsSaving(false);
    }
  }

  async function handlePdf(mode: "inline" | "download") {
    if (!quotation || !id || isNew) {
      return;
    }

    if (isDirty) {
      setErrorMessage("Save quotation before generating PDF. The PDF uses the last saved version.");
      return;
    }

    setIsPdfLoading(true);
    setFeedback("");

    try {
      const blob = await fetchAdminQuotationPdf(id, mode);
      const url = URL.createObjectURL(blob);

      if (mode === "inline") {
        window.open(url, "_blank", "noopener,noreferrer");
        window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
      } else {
        const link = document.createElement("a");
        link.href = url;
        link.download = getQuotationPdfFilename(quotation);
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
      }

      setErrorMessage("");
      setFeedback(mode === "inline" ? "PDF preview opened." : "PDF download started.");
    } catch (error) {
      setErrorMessage(getSafeApiErrorMessage(error, "Unable to generate quotation PDF."));
    } finally {
      setIsPdfLoading(false);
    }
  }

  function confirmBack(event: MouseEvent<HTMLAnchorElement>) {
    if (!isDirty) return;
    if (!window.confirm("You have unsaved changes. Leave this quotation?")) {
      event.preventDefault();
    }
  }

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

  return (
    <div className="space-y-5 pb-24">
      <Link
        className="inline-flex items-center gap-2 text-sm font-bold text-blue-800 hover:text-blue-900"
        onClick={confirmBack}
        to="/admin/quotations"
      >
        <ArrowLeft aria-hidden="true" className="h-4 w-4" />
        Back to quotations
      </Link>

      {errorMessage ? (
        <section className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">
          {errorMessage}
        </section>
      ) : null}

      {feedback ? (
        <section className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800">
          {feedback}
        </section>
      ) : null}

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-sm font-bold text-blue-700">
              {isNew ? "New quotation" : quotation?.quotationNumber}
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-950">
              {form.projectTitle || "Quotation Editor"}
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Status: {quotation?.status ?? "DRAFT"}{" "}
              {quotation?.estimateRequest ? `- Reference ${quotation.estimateRequest.estimateNumber}` : ""}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-blue-700 px-4 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              disabled={isSaving || isCancelled || !canSave}
              onClick={() => void handleSave()}
              type="button"
            >
              <Save aria-hidden="true" className="h-4 w-4" />
              Save Draft
            </button>
            {!isNew ? (
              <>
                <button
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
                  disabled={isSaving || isPdfLoading}
                  onClick={() => void handlePdf("inline")}
                  type="button"
                >
                  <Eye aria-hidden="true" className="h-4 w-4" />
                  Preview PDF
                </button>
                <button
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
                  disabled={isSaving || isPdfLoading}
                  onClick={() => void handlePdf("download")}
                  type="button"
                >
                  <Download aria-hidden="true" className="h-4 w-4" />
                  Download PDF
                </button>
              </>
            ) : null}
            {!isNew && quotation?.status === "DRAFT" ? (
              <button
                className="rounded-md border border-emerald-600 px-4 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:text-slate-400"
                disabled={isSaving}
                onClick={() => void handleStatus("READY")}
                type="button"
              >
                Mark Ready
              </button>
            ) : null}
            {!isNew && quotation?.status === "READY" ? (
              <button
                className="rounded-md border border-blue-700 px-4 text-sm font-semibold text-blue-800 hover:bg-blue-50 disabled:cursor-not-allowed disabled:text-slate-400"
                disabled={isSaving}
                onClick={() => void handleStatus("DRAFT")}
                type="button"
              >
                Return to Draft
              </button>
            ) : null}
            {!isNew ? (
              <button
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
                disabled={isSaving || isCancelled}
                onClick={() => void handleDuplicate()}
                type="button"
              >
                <Copy aria-hidden="true" className="h-4 w-4" />
                Duplicate
              </button>
            ) : null}
            {!isNew && quotation?.status !== "CANCELLED" ? (
              <button
                className="rounded-md border border-red-300 px-4 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:text-slate-400"
                disabled={isSaving}
                onClick={() => void handleStatus("CANCELLED")}
                type="button"
              >
                Cancel Quotation
              </button>
            ) : null}
          </div>
        </div>
      </section>

      {!isNew ? (
        <section
          className={`rounded-lg border p-4 text-sm font-bold ${
            quotation?.status === "READY"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : quotation?.status === "CANCELLED"
                ? "border-red-200 bg-red-50 text-red-800"
                : "border-amber-200 bg-amber-50 text-amber-900"
          }`}
        >
          {getPdfStatusBanner(quotation?.status)}
        </section>
      ) : null}

      <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-5">
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-bold text-slate-950">Customer information</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-semibold text-slate-800">
                Customer mode
                <select
                  className="mt-2 min-h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
                  disabled={isSaving || isCancelled}
                  onChange={(event) => updateField("customerMode", event.target.value as "existing" | "new")}
                  value={form.customerMode}
                >
                  <option value="existing">Existing customer</option>
                  <option value="new">New customer</option>
                </select>
              </label>
              {form.customerMode === "existing" ? (
                <label className="text-sm font-semibold text-slate-800">
                  Select customer
                  <select
                    className="mt-2 min-h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
                    disabled={isSaving || isCancelled}
                    onChange={(event) => selectCustomer(event.target.value)}
                    value={form.customerId}
                  >
                    <option value="">Select customer</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.fullName} - {customer.email}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}
              {[
                ["fullName", "Full name"],
                ["companyName", "Company name"],
                ["email", "Email"],
                ["mobileNumber", "Mobile number"],
                ["billingAddress", "Billing address"],
                ["serviceAddress", "Service address"],
                ["city", "City"],
                ["province", "Province"],
              ].map(([key, label]) => (
                <label className="text-sm font-semibold text-slate-800" key={key}>
                  {label}
                  <input
                    className="mt-2 min-h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
                    disabled={isSaving || isCancelled}
                    onChange={(event) =>
                      updateField(key as keyof EditorForm, event.target.value as never)
                    }
                    value={String(form[key as keyof EditorForm] ?? "")}
                  />
                </label>
              ))}
              {form.customerMode === "existing" ? (
                <label className="flex items-center gap-3 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm font-semibold text-slate-800 sm:col-span-2">
                  <input
                    checked={form.updateMasterCustomer}
                    disabled={isSaving || isCancelled}
                    onChange={(event) => updateField("updateMasterCustomer", event.target.checked)}
                    type="checkbox"
                  />
                  Also update the master customer record
                </label>
              ) : null}
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-bold text-slate-950">Quotation information</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-semibold text-slate-800">
                Project title
                <input
                  className="mt-2 min-h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
                  disabled={isSaving || isCancelled}
                  onChange={(event) => updateField("projectTitle", event.target.value)}
                  value={form.projectTitle}
                />
              </label>
              <label className="text-sm font-semibold text-slate-800">
                Quotation date
                <input
                  className="mt-2 min-h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
                  disabled={isSaving || isCancelled}
                  onChange={(event) => updateField("quotationDate", event.target.value)}
                  type="date"
                  value={form.quotationDate}
                />
              </label>
              <label className="text-sm font-semibold text-slate-800">
                Valid until
                <input
                  className="mt-2 min-h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
                  disabled={isSaving || isCancelled}
                  onChange={(event) => updateField("validUntil", event.target.value)}
                  type="date"
                  value={form.validUntil}
                />
              </label>
              <div className="text-sm font-semibold text-slate-800">
                Prepared by
                <p className="mt-2 rounded-md bg-slate-50 px-3 py-2 text-slate-700">
                  {quotation?.preparedBy.fullName ?? "Current admin"}
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-bold text-slate-950">Quotation items</h2>
              <button
                className="inline-flex min-h-10 items-center gap-2 rounded-md bg-blue-700 px-4 text-sm font-semibold text-white hover:bg-blue-800"
                disabled={isSaving || isCancelled}
                onClick={addItem}
                type="button"
              >
                <Plus aria-hidden="true" className="h-4 w-4" />
                Add item
              </button>
            </div>
            <div className="mt-4 space-y-4">
              {form.items.map((item, index) => (
                <div key={item.localId} className="rounded-md border border-slate-200 p-4">
                  <div className="grid gap-3 lg:grid-cols-[140px_1fr_90px_90px_120px_110px_120px]">
                    <select
                      className="min-h-10 rounded-md border border-slate-300 px-2 text-sm"
                      disabled={isSaving || isCancelled}
                      onChange={(event) => updateItem(item.localId, { itemType: event.target.value as QuotationItemType })}
                      value={item.itemType}
                    >
                      {itemTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                    <input
                      className="min-h-10 rounded-md border border-slate-300 px-3 text-sm"
                      disabled={isSaving || isCancelled}
                      onChange={(event) => updateItem(item.localId, { description: event.target.value })}
                      placeholder="Description"
                      value={item.description}
                    />
                    <input
                      className="min-h-10 rounded-md border border-slate-300 px-3 text-sm"
                      disabled={isSaving || isCancelled}
                      min={0}
                      onChange={(event) => updateItem(item.localId, { quantity: event.target.value })}
                      step="0.01"
                      type="number"
                      value={item.quantity}
                    />
                    <input
                      className="min-h-10 rounded-md border border-slate-300 px-3 text-sm"
                      disabled={isSaving || isCancelled}
                      onChange={(event) => updateItem(item.localId, { unit: event.target.value })}
                      value={item.unit}
                    />
                    <input
                      className="min-h-10 rounded-md border border-slate-300 px-3 text-sm"
                      disabled={isSaving || isCancelled}
                      min={0}
                      onChange={(event) => updateItem(item.localId, { unitPrice: event.target.value })}
                      step="0.01"
                      type="number"
                      value={item.unitPrice}
                    />
                    <input
                      className="min-h-10 rounded-md border border-slate-300 px-3 text-sm"
                      disabled={isSaving || isCancelled}
                      min={0}
                      onChange={(event) => updateItem(item.localId, { discount: event.target.value })}
                      step="0.01"
                      type="number"
                      value={item.discount}
                    />
                    <div className="flex items-center justify-between gap-2 rounded-md bg-slate-50 px-3 text-sm font-bold text-slate-950">
                      {formatMoney(preview.itemRows[index]?.amount ?? 0)}
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button className="rounded-md border px-2 py-1 text-xs font-semibold" disabled={index === 0 || isCancelled} onClick={() => moveItem(item.localId, -1)} type="button">
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button className="rounded-md border px-2 py-1 text-xs font-semibold" disabled={index === form.items.length - 1 || isCancelled} onClick={() => moveItem(item.localId, 1)} type="button">
                      <ArrowDown className="h-4 w-4" />
                    </button>
                    <button className="rounded-md border px-2 py-1 text-xs font-semibold" disabled={isCancelled} onClick={() => duplicateItem(item.localId)} type="button">
                      Duplicate
                    </button>
                    <button className="rounded-md border border-red-300 px-2 py-1 text-xs font-semibold text-red-700" disabled={form.items.length <= 1 || isCancelled} onClick={() => removeItem(item.localId)} type="button">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-bold text-slate-950">Scope and terms</h2>
            <div className="mt-4 grid gap-4">
              {[
                ["scopeOfWork", "Scope of work"],
                ["exclusions", "Exclusions"],
                ["paymentTerms", "Payment terms"],
                ["warrantyTerms", "Warranty terms"],
                ["notes", "Additional notes"],
              ].map(([key, label]) => (
                <label className="text-sm font-semibold text-slate-800" key={key}>
                  {label}
                  <textarea
                    className="mt-2 min-h-28 w-full rounded-md border border-slate-300 px-3 py-3 text-sm"
                    disabled={isSaving || isCancelled}
                    onChange={(event) =>
                      updateField(key as keyof EditorForm, event.target.value as never)
                    }
                    value={String(form[key as keyof EditorForm] ?? "")}
                  />
                </label>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-5">
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-bold text-slate-950">Totals</h2>
            <div className="mt-4 grid gap-4">
              <label className="text-sm font-semibold text-slate-800">
                Quotation discount
                <input className="mt-2 min-h-10 w-full rounded-md border border-slate-300 px-3 text-sm" disabled={isSaving || isCancelled} min={0} onChange={(event) => updateField("discount", event.target.value)} step="0.01" type="number" value={form.discount} />
              </label>
              <label className="text-sm font-semibold text-slate-800">
                Additional fees
                <input className="mt-2 min-h-10 w-full rounded-md border border-slate-300 px-3 text-sm" disabled={isSaving || isCancelled} min={0} onChange={(event) => updateField("additionalFees", event.target.value)} step="0.01" type="number" value={form.additionalFees} />
              </label>
              <label className="text-sm font-semibold text-slate-800">
                Tax rate
                <input className="mt-2 min-h-10 w-full rounded-md border border-slate-300 px-3 text-sm" disabled={isSaving || isCancelled} min={0} onChange={(event) => updateField("taxRate", event.target.value)} step="0.01" type="number" value={form.taxRate} />
              </label>
            </div>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="font-medium text-slate-600">Items subtotal</dt>
                <dd className="font-bold text-slate-950">{formatMoney(preview.itemsSubtotal)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="font-medium text-slate-600">Taxable subtotal</dt>
                <dd className="font-bold text-slate-950">{formatMoney(preview.taxableSubtotal)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="font-medium text-slate-600">Tax amount</dt>
                <dd className="font-bold text-slate-950">{formatMoney(preview.taxAmount)}</dd>
              </div>
              <div className="border-t border-slate-200 pt-3">
                <div className="flex justify-between gap-4">
                  <dt className="font-bold text-slate-950">Grand total</dt>
                  <dd className="text-xl font-bold text-blue-800">{formatMoney(preview.grandTotal)}</dd>
                </div>
              </div>
            </dl>
          </section>
        </aside>
      </section>
    </div>
  );
}
