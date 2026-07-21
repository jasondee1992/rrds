export type EstimateRequestStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "ESTIMATE_READY"
  | "CONVERTED_TO_QUOTATION"
  | "CANCELLED";

export type AdminEstimateStatus =
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "ESTIMATE_READY"
  | "CANCELLED";

export type EstimateOptions = {
  propertyTypes: string[];
  airconTypes: string[];
  airconCapacities: string[];
  services: Array<{
    label: string;
    sampleBasePrice: string;
  }>;
  urgencyLevels: string[];
  unitConditions: string[];
  pricingNotice: string;
  disclaimer: string;
};

export type PublicEstimatePayload = {
  fullName: string;
  email: string;
  mobileNumber: string;
  companyName?: string;
  propertyType: string;
  serviceAddress: string;
  city: string;
  province: string;
  airconType: string;
  airconCapacity: string;
  quantity: number;
  brand?: string;
  unitCondition: string;
  indoorUnitLocation?: string;
  outdoorUnitLocation?: string;
  selectedService: string;
  preferredDate?: string;
  notes: string;
  urgencyLevel: string;
  disclaimerAccepted: boolean;
  website?: string;
};

export type PublicEstimateResult = {
  estimateNumber: string;
  publicAccessToken: string;
  status: EstimateRequestStatus;
  selectedService: string;
  estimatedSubtotal: string;
  estimatedAdditionalFees: string;
  estimatedTax: string;
  estimatedTotal: string;
  disclaimer: string;
  generatedDate: string;
  validUntil: string;
};

export type PublicEstimateDocument = {
  estimateNumber: string;
  propertyType: string;
  serviceAddress: string;
  airconType: string;
  airconCapacity: string;
  quantity: number;
  brand: string | null;
  unitCondition: string;
  indoorUnitLocation: string | null;
  outdoorUnitLocation: string | null;
  selectedService: string;
  preferredDate: string | null;
  notes: string;
  urgencyLevel: string;
  estimatedSubtotal: string;
  estimatedAdditionalFees: string;
  estimatedTax: string;
  estimatedTotal: string;
  status: EstimateRequestStatus;
  generatedDate: string;
  validUntil: string;
  disclaimer: string;
  requiredDisclaimer: string;
  company: {
    name: string;
    address: string;
    phone: string;
    email: string;
  };
  customer: {
    fullName: string;
    companyName: string | null;
    email: string;
    mobileNumber: string;
    address: string;
    city: string;
    province: string;
  };
};

export type EstimatePublicAccess = {
  enabled: boolean;
  createdAt: string | null;
  expiresAt: string | null;
  lastAccessedAt: string | null;
  disabledAt: string | null;
  publicUrl: string | null;
};

export type EstimateListFilters = {
  page: number;
  limit: number;
  search?: string;
  status?: AdminEstimateStatus | "";
  service?: string;
  dateFrom?: string;
  dateTo?: string;
  sort?: "latest" | "oldest";
};

export type EstimateListItem = {
  id: string;
  estimateNumber: string;
  selectedService: string;
  airconType: string;
  airconCapacity: string;
  quantity: number;
  estimatedTotal: string;
  status: EstimateRequestStatus;
  createdAt: string;
  customer: {
    fullName: string;
    email: string;
    mobileNumber: string;
  };
};

export type EstimateDetails = {
  id: string;
  estimateNumber: string;
  propertyType: string;
  serviceAddress: string;
  airconType: string;
  airconCapacity: string;
  quantity: number;
  brand: string | null;
  unitCondition: string;
  indoorUnitLocation: string | null;
  outdoorUnitLocation: string | null;
  selectedService: string;
  preferredDate: string | null;
  notes: string;
  urgencyLevel: string;
  estimatedSubtotal: string;
  estimatedAdditionalFees: string;
  estimatedTax: string;
  estimatedTotal: string;
  internalNotes: string | null;
  status: EstimateRequestStatus;
  createdAt: string;
  updatedAt: string;
  disclaimer: string;
  publicAccess: EstimatePublicAccess;
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
};

export type EstimateListResponse = {
  records: EstimateListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};
