import { Building2, HandCoins, Clock, Wallet } from "lucide-react";

export const STATS = [
  { label: "Total Partners", value: "32", change: "+4 this quarter", icon: Building2 },
  { label: "Active Partnerships", value: "26", change: "81% of total", icon: HandCoins },
  { label: "Pending Applications", value: "5", change: "2 submitted this week", icon: Clock },
  { label: "Revenue Generated", value: "$486,200", change: "+11.4% vs last quarter", icon: Wallet },
];

export type PartnerStatus = "Active" | "Pending" | "Inactive";
export type PartnerType = "University" | "Corporate" | "NGO";

export const STATUSES: PartnerStatus[] = ["Active", "Pending", "Inactive"];
export const TYPES: PartnerType[] = ["University", "Corporate", "NGO"];

export interface Partner {
  id: string;
  name: string;
  initials: string;
  contact: string;
  type: PartnerType;
  status: PartnerStatus;
  programs: number;
  students: number;
  revenue: string;
  joined: string;
}

export const PARTNERS: Partner[] = [
  { id: "PTR-5001", name: "TechCorp International", initials: "TC", contact: "Rachel Adams", type: "Corporate", status: "Active", programs: 4, students: 3200, revenue: "$124,000", joined: "2025-02-14" },
  { id: "PTR-5002", name: "Greenfield University", initials: "GU", contact: "Prof. David Nguyen", type: "University", status: "Active", programs: 6, students: 5400, revenue: "$98,600", joined: "2025-03-02" },
  { id: "PTR-5003", name: "Apex Solutions", initials: "AS", contact: "Laura Kim", type: "Corporate", status: "Active", programs: 3, students: 1800, revenue: "$76,300", joined: "2025-06-18" },
  { id: "PTR-5004", name: "NovaTech Partners", initials: "NT", contact: "Chris Walker", type: "Corporate", status: "Inactive", programs: 1, students: 420, revenue: "$14,900", joined: "2025-09-09" },
  { id: "PTR-5005", name: "Bright Future NGO", initials: "BF", contact: "Amara Obi", type: "NGO", status: "Active", programs: 2, students: 980, revenue: "$31,200", joined: "2026-01-20" },
  { id: "PTR-5006", name: "Summit State College", initials: "SS", contact: "Dr. Elaine Wu", type: "University", status: "Pending", programs: 0, students: 0, revenue: "$0", joined: "2026-07-02" },
  { id: "PTR-5007", name: "Skyline Analytics", initials: "SA", contact: "Tom Bradley", type: "Corporate", status: "Pending", programs: 0, students: 0, revenue: "$0", joined: "2026-07-05" },
  { id: "PTR-5008", name: "Horizon Youth Trust", initials: "HY", contact: "Fatima Noor", type: "NGO", status: "Active", programs: 1, students: 650, revenue: "$9,800", joined: "2026-02-27" },
  { id: "PTR-5009", name: "Cascade Institute", initials: "CI", contact: "Prof. Mark Ellison", type: "University", status: "Inactive", programs: 1, students: 210, revenue: "$3,600", joined: "2025-11-30" },
  { id: "PTR-5010", name: "Vertex Manufacturing", initials: "VM", contact: "Nina Torres", type: "Corporate", status: "Active", programs: 2, students: 1120, revenue: "$27,800", joined: "2025-08-14" },
];
