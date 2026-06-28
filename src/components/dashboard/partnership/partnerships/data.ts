import { Handshake, TrendingUp, Building2, BadgePercent } from "lucide-react";
import avatar1 from "@/assets/images/instructors/instructor1.webp";
import avatar2 from "@/assets/images/instructors/instructor2.webp";
import avatar3 from "@/assets/images/instructors/instructor3.webp";
import avatar4 from "@/assets/images/instructors/instructor4.webp";
import avatar5 from "@/assets/images/instructors/instructor5.webp";
import avatar6 from "@/assets/images/instructors/instructor6.webp";
import { Partner, PartnerStatus, PartnerType } from "./types";

export const PARTNERS: Partner[] = [
  { id: "p1", name: "TechCorp International", contact: "sarah.kim@techcorp.com", avatar: avatar1, type: "Enterprise", revenue: "$14,200", dealsClosed: 8, joinedDate: "2026-01-10", status: "Active" },
  { id: "p2", name: "Greenfield University", contact: "admin@greenfield.edu", avatar: avatar2, type: "Academic", revenue: "$9,650", dealsClosed: 5, joinedDate: "2026-02-14", status: "Active" },
  { id: "p3", name: "Apex Solutions", contact: "hello@apexsol.com", avatar: avatar3, type: "SMB", revenue: "$0.00", dealsClosed: 0, joinedDate: "2026-04-01", status: "Pending" },
  { id: "p4", name: "NovaTech Partners", contact: "partner@novatech.io", avatar: avatar4, type: "Enterprise", revenue: "$7,840", dealsClosed: 6, joinedDate: "2026-01-30", status: "Active" },
  { id: "p5", name: "Bright Future NGO", contact: "info@brightfuture.org", avatar: avatar5, type: "Non-profit", revenue: "$1,200", dealsClosed: 2, joinedDate: "2025-12-01", status: "Inactive" },
  { id: "p6", name: "Orion Enterprises", contact: "bd@orion.com", avatar: avatar6, type: "Enterprise", revenue: "$5,450", dealsClosed: 4, joinedDate: "2026-03-05", status: "Active" },
];

export const STATS = [
  { label: "Total Partners", value: "24", change: "+3 this month", icon: Handshake },
  { label: "Active Deals", value: "18", change: "+5 vs last month", icon: TrendingUp },
  { label: "Organizations", value: "12", change: "+2 this quarter", icon: Building2 },
  { label: "Avg. Commission", value: "14%", change: "+1.2% vs last month", icon: BadgePercent },
];

export const TOP_PARTNERS = [
  { name: "TechCorp International", revenue: "$14,200" },
  { name: "Greenfield University", revenue: "$9,650" },
  { name: "NovaTech Partners", revenue: "$7,840" },
  { name: "Orion Enterprises", revenue: "$5,450" },
  { name: "Bright Future NGO", revenue: "$1,200" },
];

export const TIPS = [
  { color: "text-blue-500", text: "Follow up with Pending partners within 48 hours to increase close rate." },
  { color: "text-green-500", text: "Enterprise partners generate 3× more revenue on average." },
  { color: "text-orange-500", text: "Offer co-branded certificates to boost Academic partner engagement." },
];

export const TYPES: ("All" | PartnerType)[] = ["All", "Enterprise", "Academic", "SMB", "Non-profit"];
export const STATUSES: ("All" | PartnerStatus)[] = ["All", "Active", "Pending", "Inactive"];
