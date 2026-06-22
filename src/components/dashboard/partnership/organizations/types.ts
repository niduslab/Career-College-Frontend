import { StaticImageData } from "next/image";

export type OrgStatus = "Active" | "Pending" | "Inactive";
export type OrgIndustry = "Technology" | "Education" | "Healthcare" | "Finance" | "Non-profit" | "Government";
export type OrgSize = "1-50" | "51-200" | "201-1000" | "1000+";

export interface Organization {
  id: string;
  name: string;
  logo: StaticImageData;
  industry: OrgIndustry;
  size: OrgSize;
  country: string;
  contact: string;
  email: string;
  activePartners: number;
  totalRevenue: string;
  joinedDate: string;
  status: OrgStatus;
}
