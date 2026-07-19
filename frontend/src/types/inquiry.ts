export type InquiryStatus = "NEW" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";

export type InquirySource = "CONTACT_FORM" | "CHATBOT" | "PHONE" | "EMAIL" | "MANUAL";

export type PublicContactPayload = {
  fullName: string;
  email: string;
  mobileNumber: string;
  subject: string;
  message: string;
  website?: string;
};

export type PublicContactResponse = {
  referenceNumber: string;
};

export type InquiryListFilters = {
  page: number;
  limit: number;
  search?: string;
  status?: InquiryStatus | "";
  source?: InquirySource | "";
  dateFrom?: string;
  dateTo?: string;
  sort?: "latest" | "oldest";
};

export type InquiryListItem = {
  id: string;
  referenceNumber: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  subject: string;
  status: InquiryStatus;
  source: InquirySource;
  createdAt: string;
  updatedAt: string;
  customerId: string | null;
};

export type CustomerSummary = {
  id: string;
  fullName: string;
  companyName: string | null;
  email: string;
  mobileNumber: string;
  address: string;
  city: string;
  province: string;
  createdAt: string;
  updatedAt?: string;
};

export type InquiryDetails = {
  id: string;
  referenceNumber: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  subject: string;
  message: string;
  status: InquiryStatus;
  source: InquirySource;
  internalNotes: string | null;
  createdAt: string;
  updatedAt: string;
  customer: CustomerSummary | null;
};

export type InquiryListResponse = {
  records: InquiryListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};
