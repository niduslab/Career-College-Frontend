import { Building2, Globe, Users, TrendingUp } from "lucide-react";
import avatar1 from "@/assets/images/instructors/instructor1.webp";
import avatar2 from "@/assets/images/instructors/instructor2.webp";
import avatar3 from "@/assets/images/instructors/instructor3.webp";
import avatar4 from "@/assets/images/instructors/instructor4.webp";
import avatar5 from "@/assets/images/instructors/instructor5.webp";
import avatar6 from "@/assets/images/instructors/instructor6.webp";
import image1 from "@/assets/images/instructors/image1.webp";
import image2 from "@/assets/images/instructors/image2.webp";
import { Organization, OrgIndustry, OrgSize, OrgStatus } from "./types";

export const ORGANIZATIONS: Organization[] = [
  {
    id: "o1",
    name: "TechCorp International",
    logo: avatar1,
    industry: "Technology",
    size: "1000+",
    country: "USA",
    contact: "Sarah Kim",
    email: "sarah.kim@techcorp.com",
    activePartners: 8,
    totalRevenue: "$14,200",
    joinedDate: "Jan 10, 2026",
    status: "Active",
  },
  {
    id: "o2",
    name: "Greenfield University",
    logo: avatar2,
    industry: "Education",
    size: "201-1000",
    country: "Canada",
    contact: "Dr. Alan Torres",
    email: "admin@greenfield.edu",
    activePartners: 5,
    totalRevenue: "$9,650",
    joinedDate: "Feb 14, 2026",
    status: "Active",
  },
  {
    id: "o3",
    name: "Apex Solutions",
    logo: avatar3,
    industry: "Technology",
    size: "51-200",
    country: "UK",
    contact: "James Reed",
    email: "hello@apexsol.com",
    activePartners: 0,
    totalRevenue: "$0",
    joinedDate: "Apr 1, 2026",
    status: "Pending",
  },
  {
    id: "o4",
    name: "NovaTech Partners",
    logo: avatar4,
    industry: "Finance",
    size: "201-1000",
    country: "Germany",
    contact: "Lena Müller",
    email: "partner@novatech.io",
    activePartners: 6,
    totalRevenue: "$7,840",
    joinedDate: "Jan 30, 2026",
    status: "Active",
  },
  {
    id: "o5",
    name: "Bright Future NGO",
    logo: avatar5,
    industry: "Non-profit",
    size: "1-50",
    country: "Kenya",
    contact: "Amara Osei",
    email: "info@brightfuture.org",
    activePartners: 2,
    totalRevenue: "$1,200",
    joinedDate: "Dec 1, 2025",
    status: "Inactive",
  },
  {
    id: "o6",
    name: "Orion Enterprises",
    logo: avatar6,
    industry: "Technology",
    size: "1000+",
    country: "USA",
    contact: "Mark Patel",
    email: "bd@orion.com",
    activePartners: 4,
    totalRevenue: "$5,450",
    joinedDate: "Mar 5, 2026",
    status: "Active",
  },
  {
    id: "o7",
    name: "MedBridge Healthcare",
    logo: image1,
    industry: "Healthcare",
    size: "201-1000",
    country: "Australia",
    contact: "Dr. Priya Singh",
    email: "priya@medbridge.au",
    activePartners: 3,
    totalRevenue: "$4,100",
    joinedDate: "Mar 18, 2026",
    status: "Active",
  },
  {
    id: "o8",
    name: "CivicNet Government",
    logo: image2,
    industry: "Government",
    size: "1000+",
    country: "Singapore",
    contact: "Wei Liang",
    email: "contact@civicnet.gov.sg",
    activePartners: 1,
    totalRevenue: "$2,300",
    joinedDate: "Feb 28, 2026",
    status: "Pending",
  },
];

export const STATS = [
  { label: "Total Organizations", value: "32", change: "+4 this quarter", icon: Building2 },
  { label: "Countries Covered", value: "18", change: "+2 this month", icon: Globe },
  { label: "Active Partners", value: "29", change: "+6 vs last month", icon: Users },
  { label: "Total Revenue", value: "$44.6k", change: "+11.2% growth", icon: TrendingUp },
];

export const TOP_ORGS = ORGANIZATIONS.filter((o) => o.status === "Active")
  .sort((a, b) => parseFloat(b.totalRevenue.replace(/[$,]/g, "")) - parseFloat(a.totalRevenue.replace(/[$,]/g, "")))
  .slice(0, 5);

export const INDUSTRY_TIPS = [
  { color: "text-blue-500", text: "Technology orgs deliver 2× higher deal velocity than other sectors." },
  { color: "text-green-500", text: "Educational institutions have the highest long-term retention rates." },
  { color: "text-orange-500", text: "Follow up with Pending orgs within 72 hours to maximize conversion." },
];

export const INDUSTRIES: ("All" | OrgIndustry)[] = ["All", "Technology", "Education", "Healthcare", "Finance", "Non-profit", "Government"];
export const SIZES: ("All" | OrgSize)[] = ["All", "1-50", "51-200", "201-1000", "1000+"];
export const STATUSES: ("All" | OrgStatus)[] = ["All", "Active", "Pending", "Inactive"];
