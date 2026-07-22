export type AdminRole = "SUPER_ADMIN" | "ADMIN" | "STAFF";

export type AuthenticatedAdmin = {
  id: string;
  fullName: string;
  email: string;
  role: AdminRole;
  lastLoginAt?: string | null;
};

export type AdminLoginResponse = {
  admin: AuthenticatedAdmin;
  accessToken: string;
};

export type RecentInquiry = {
  id: string;
  referenceNumber: string;
  fullName: string;
  subject: string;
  status: string;
  source: string;
  createdAt: string;
};

export type RecentEstimateRequest = {
  id: string;
  estimateNumber: string;
  selectedService: string;
  status: string;
  createdAt: string;
  customer: {
    fullName: string;
  };
};

export type RecentQuotation = {
  id: string;
  quotationNumber: string;
  status: string;
  grandTotal: string;
  createdAt: string;
  customer: {
    fullName: string;
  };
};

export type AdminDashboardSummary = {
  totalCustomers: number;
  totalInquiries: number;
  pendingEstimates: number;
  pendingEstimateReviews: number;
  convertedEstimates: number;
  draftQuotations: number;
  readyQuotations: number;
  cancelledQuotations: number;
  sentQuotations: number;
  acceptedQuotations: number;
  recentInquiries: RecentInquiry[];
  recentEstimateRequests: RecentEstimateRequest[];
  recentQuotations: RecentQuotation[];
};
