export type QuotationStatus =
  | "DRAFT"
  | "READY"
  | "SENT"
  | "VIEWED"
  | "ACCEPTED"
  | "REJECTED"
  | "EXPIRED"
  | "CANCELLED";

export type QuotationListFilters = {
  page: number;
  limit: number;
  search?: string;
  status?: QuotationStatus | "";
  sort?: "latest" | "oldest";
};

export type QuotationListItem = {
  id: string;
  quotationNumber: string;
  grandTotal: string;
  status: QuotationStatus;
  createdAt: string;
  validUntil: string;
  customer: {
    fullName: string;
    companyName: string | null;
    email: string;
    mobileNumber: string;
  };
  estimateRequest: {
    estimateNumber: string;
  } | null;
  preparedBy: {
    fullName: string;
    email: string;
  };
};

export type QuotationListResponse = {
  records: QuotationListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type QuotationDetails = {
  id: string;
  quotationNumber: string;
  quotationDate: string;
  validUntil: string;
  subtotal: string;
  discount: string;
  taxRate: string;
  taxAmount: string;
  additionalFees: string;
  grandTotal: string;
  scopeOfWork: string;
  exclusions: string;
  paymentTerms: string;
  warrantyTerms: string;
  notes: string;
  status: QuotationStatus;
  createdAt: string;
  updatedAt: string;
  customer: {
    fullName: string;
    companyName: string | null;
    email: string;
    mobileNumber: string;
    address: string;
    city: string;
    province: string;
  };
  estimateRequest: {
    estimateNumber: string;
    serviceAddress: string;
    selectedService: string;
  } | null;
  preparedBy: {
    fullName: string;
    email: string;
  };
  items: Array<{
    id: string;
    itemType: string;
    description: string;
    quantity: string;
    unit: string;
    unitPrice: string;
    amount: string;
    sortOrder: number;
  }>;
};
