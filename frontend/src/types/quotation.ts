export type QuotationStatus =
  | "DRAFT"
  | "READY"
  | "SENT"
  | "VIEWED"
  | "ACCEPTED"
  | "REJECTED"
  | "EXPIRED"
  | "CANCELLED";

export type QuotationItemType =
  | "PRODUCT"
  | "SERVICE"
  | "LABOR"
  | "MATERIAL"
  | "TRANSPORTATION"
  | "OTHER";

export type QuotationListFilters = {
  page: number;
  limit: number;
  search?: string;
  status?: QuotationStatus | "";
  dateFrom?: string;
  dateTo?: string;
  sort?: "latest" | "oldest";
};

export type QuotationListItem = {
  id: string;
  quotationNumber: string;
  projectTitle: string;
  customerFullName: string | null;
  grandTotal: string;
  status: QuotationStatus;
  createdAt: string;
  updatedAt: string;
  validUntil: string;
  customer: {
    id: string;
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
  projectTitle: string;
  customerFullName: string;
  customerCompanyName: string | null;
  customerEmail: string;
  customerMobileNumber: string;
  billingAddress: string;
  serviceAddress: string;
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
    id: string;
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
    id: string;
    fullName: string;
    email: string;
  };
  approvedBy: {
    id: string;
    fullName: string;
    email: string;
  } | null;
  items: Array<{
    id: string;
    itemType: QuotationItemType;
    description: string;
    quantity: string;
    unit: string;
    unitPrice: string;
    discount: string;
    amount: string;
    sortOrder: number;
  }>;
};

export type QuotationCustomerOption = {
  id: string;
  fullName: string;
  companyName: string | null;
  email: string;
  mobileNumber: string;
  address: string;
  city: string;
  province: string;
};

export type QuotationDefaults = {
  quotationDate: string;
  validUntil: string;
  taxRate: string;
  scopeOfWork: string;
  exclusions: string;
  paymentTerms: string;
  warrantyTerms: string;
  notes: string;
};

export type QuotationPayload = {
  customer: {
    mode: "existing" | "new";
    customerId?: string;
    updateMasterCustomer: boolean;
    fullName: string;
    companyName?: string;
    email: string;
    mobileNumber: string;
    billingAddress: string;
    serviceAddress: string;
    city?: string;
    province?: string;
  };
  projectTitle: string;
  quotationDate: string;
  validUntil: string;
  approvedById?: string | null;
  discount: number;
  additionalFees: number;
  taxRate: number;
  scopeOfWork: string;
  exclusions: string;
  paymentTerms: string;
  warrantyTerms: string;
  notes: string;
  items: Array<{
    id?: string;
    itemType: QuotationItemType;
    description: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    discount: number;
    sortOrder: number;
  }>;
};

export type QuotationUpdatePayload = QuotationPayload & {
  updatedAt: string;
};
