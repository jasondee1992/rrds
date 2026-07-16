import {
  BadgeDollarSign,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  Fan,
  HeartHandshake,
  Home,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Snowflake,
  Sparkles,
  ThermometerSun,
  Wrench,
  type LucideIcon,
} from "lucide-react";

export type NavigationLink = {
  label: string;
  path: string;
};

export type Benefit = {
  title: string;
  description: string;
  Icon: LucideIcon;
};

export type Service = {
  id: string;
  name: string;
  summary: string;
  description: string;
  Icon: LucideIcon;
};

export type Project = {
  id: string;
  title: string;
  serviceType: string;
  location: string;
  summary: string;
  isSample: boolean;
};

export type Testimonial = {
  id: string;
  name: string;
  role: string;
  quote: string;
  isPlaceholder: boolean;
};

export const navigationLinks: NavigationLink[] = [
  { label: "Home", path: "/" },
  { label: "About Us", path: "/about" },
  { label: "Services", path: "/services" },
  { label: "Projects", path: "/projects" },
  { label: "Free Quotation", path: "/free-quotation" },
  { label: "Contact Us", path: "/contact" },
];

export const benefits: Benefit[] = [
  {
    title: "Quality Service",
    description:
      "Careful workmanship and dependable service standards for every air-conditioning job.",
    Icon: ShieldCheck,
  },
  {
    title: "Expert Technicians",
    description:
      "Skilled technicians ready to inspect, maintain, clean, repair, and install aircon units.",
    Icon: Wrench,
  },
  {
    title: "Fair Pricing",
    description:
      "Clear service recommendations and practical pricing for residential and commercial needs.",
    Icon: BadgeDollarSign,
  },
  {
    title: "Customer Satisfaction",
    description:
      "Responsive support focused on comfort, reliability, and long-term customer confidence.",
    Icon: HeartHandshake,
  },
];

export const services: Service[] = [
  {
    id: "aircon-installation",
    name: "Aircon Installation",
    summary: "Professional installation for new residential and commercial air-conditioning units.",
    description:
      "Placeholder service details for site editing later. Use this section to describe RRDS installation checks, unit placement, drainage planning, and basic handover process.",
    Icon: Fan,
  },
  {
    id: "preventive-maintenance",
    name: "Preventive Maintenance",
    summary: "Routine inspection and care to help keep aircon systems running efficiently.",
    description:
      "Placeholder service details for site editing later. Use this section to outline scheduled inspection, cleaning, performance checks, and maintenance recommendations.",
    Icon: ClipboardCheck,
  },
  {
    id: "aircon-repair",
    name: "Aircon Repair",
    summary: "Frontend placeholder for repair support covering common cooling and unit issues.",
    description:
      "Placeholder service details for site editing later. Use this section to describe diagnosis, repair recommendations, replacement parts, and post-service checks.",
    Icon: Wrench,
  },
  {
    id: "aircon-cleaning",
    name: "Aircon Cleaning",
    summary: "Cleaning services for improved airflow, cleaner operation, and better comfort.",
    description:
      "Placeholder service details for site editing later. Use this section to describe filter cleaning, coil cleaning, drainage checks, and general unit care.",
    Icon: Sparkles,
  },
  {
    id: "troubleshooting",
    name: "Troubleshooting",
    summary: "Inspection support for leaks, noise, weak cooling, and other aircon concerns.",
    description:
      "Placeholder service details for site editing later. Use this section to describe inspection steps and how RRDS communicates practical next actions.",
    Icon: ThermometerSun,
  },
  {
    id: "supply-and-replacement",
    name: "Supply and Replacement",
    summary: "Frontend placeholder for unit supply, replacement, and practical upgrade guidance.",
    description:
      "Placeholder service details for site editing later. Use this section to describe replacement planning, unit recommendations, and basic installation coordination.",
    Icon: Building2,
  },
];

export const projects: Project[] = [
  {
    id: "sample-home-installation",
    title: "Sample Residential Installation",
    serviceType: "Aircon Installation",
    location: "Location placeholder",
    summary: "Sample project content for later replacement with real RRDS project details.",
    isSample: true,
  },
  {
    id: "sample-office-maintenance",
    title: "Sample Office Maintenance",
    serviceType: "Preventive Maintenance",
    location: "Location placeholder",
    summary: "Sample project content for later replacement with real RRDS project details.",
    isSample: true,
  },
  {
    id: "sample-cleaning-service",
    title: "Sample Deep Cleaning Service",
    serviceType: "Aircon Cleaning",
    location: "Location placeholder",
    summary: "Sample project content for later replacement with real RRDS project details.",
    isSample: true,
  },
  {
    id: "sample-repair-work",
    title: "Sample Unit Repair",
    serviceType: "Aircon Repair",
    location: "Location placeholder",
    summary: "Sample project content for later replacement with real RRDS project details.",
    isSample: true,
  },
  {
    id: "sample-replacement-work",
    title: "Sample Unit Replacement",
    serviceType: "Supply and Replacement",
    location: "Location placeholder",
    summary: "Sample project content for later replacement with real RRDS project details.",
    isSample: true,
  },
  {
    id: "sample-commercial-check",
    title: "Sample Commercial Checkup",
    serviceType: "Troubleshooting",
    location: "Location placeholder",
    summary: "Sample project content for later replacement with real RRDS project details.",
    isSample: true,
  },
];

// Placeholder testimonial content for later replacement with verified RRDS customer feedback.
export const testimonials: Testimonial[] = [
  {
    id: "placeholder-testimonial-1",
    name: "Sample Customer",
    role: "Residential client",
    quote:
      "RRDS provided clear communication and reliable service from inspection to completion.",
    isPlaceholder: true,
  },
  {
    id: "placeholder-testimonial-2",
    name: "Sample Business Client",
    role: "Commercial client",
    quote:
      "The team handled our air-conditioning service request professionally and efficiently.",
    isPlaceholder: true,
  },
  {
    id: "placeholder-testimonial-3",
    name: "Sample Property Contact",
    role: "Property support",
    quote:
      "Scheduling was easy, and the service recommendations were practical and easy to understand.",
    isPlaceholder: true,
  },
];

export const contactDetails = [
  { label: "Phone", value: "Phone placeholder", Icon: Phone },
  { label: "Email", value: "Email placeholder", Icon: MessageCircle },
  { label: "Address", value: "Address placeholder", Icon: MapPin },
  { label: "Business Hours", value: "Business hours placeholder", Icon: BriefcaseBusiness },
];

export const quotationSteps = [
  "Project Details",
  "Aircon Information",
  "Additional Details",
  "Review and Submit",
];

export const heroStats = [
  { label: "Residential Support", value: "Homes" },
  { label: "Commercial Support", value: "Businesses" },
  { label: "Service Focus", value: "Cooling Comfort" },
];

export const heroVisualItems = [
  { label: "Installation", Icon: Snowflake },
  { label: "Maintenance", Icon: CheckCircle2 },
  { label: "Home and business", Icon: Home },
];
