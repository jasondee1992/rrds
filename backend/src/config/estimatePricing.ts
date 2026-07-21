export const estimateDisclaimer =
  "This is an automated preliminary estimate only. Final pricing is subject to site inspection, technical assessment, material availability, and official RRDS approval.";

export const samplePricingNotice =
  "Sample development pricing — replace with approved RRDS pricing.";

export const propertyTypes = [
  "Residential House",
  "Condominium",
  "Apartment",
  "Office",
  "Commercial Space",
  "Other",
] as const;

export const airconTypes = [
  "Window Type",
  "Split Type",
  "Floor Mounted",
  "Cassette Type",
  "Ceiling Concealed",
  "Package Type",
] as const;

export const airconCapacities = [
  { label: "0.5 HP", adjustment: "0.00" },
  { label: "1.0 HP", adjustment: "0.00" },
  { label: "1.5 HP", adjustment: "250.00" },
  { label: "2.0 HP", adjustment: "500.00" },
  { label: "2.5 HP", adjustment: "750.00" },
  { label: "3.0 HP", adjustment: "1000.00" },
  { label: "5 TR", adjustment: "2500.00" },
] as const;

export const estimateServices = [
  { label: "Aircon Installation", basePrice: "3500.00", additionalFees: "500.00" },
  { label: "Aircon Cleaning", basePrice: "900.00", additionalFees: "150.00" },
  { label: "Preventive Maintenance", basePrice: "1200.00", additionalFees: "200.00" },
  { label: "Aircon Repair", basePrice: "1500.00", additionalFees: "300.00" },
  { label: "Troubleshooting", basePrice: "800.00", additionalFees: "200.00" },
  { label: "Replacement", basePrice: "2500.00", additionalFees: "500.00" },
  { label: "Supply and Installation", basePrice: "8500.00", additionalFees: "1000.00" },
] as const;

export const urgencyLevels = [
  { label: "Standard", adjustment: "0.00" },
  { label: "Urgent", adjustment: "500.00" },
  { label: "Emergency", adjustment: "1500.00" },
] as const;

export const unitConditions = ["Existing Unit", "New Unit"] as const;
