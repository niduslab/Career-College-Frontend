import { Wallet, Handshake, TrendingUp, FileText } from "lucide-react";
import avatar1 from "@/assets/images/instructors/instructor1.webp";
import avatar2 from "@/assets/images/instructors/instructor2.webp";
import avatar3 from "@/assets/images/instructors/instructor3.webp";
import avatar4 from "@/assets/images/instructors/instructor4.webp";
import avatar5 from "@/assets/images/instructors/instructor5.webp";
import { StaticImageData } from "next/image";

export const STATS = [
  { label: "Total Revenue", value: "$38,540", change: "+18.3% vs last month", icon: Wallet },
  { label: "Active Partners", value: "24", change: "+3 new this month", icon: Handshake },
  { label: "Proposal Win Rate", value: "62%", change: "+7% vs last quarter", icon: TrendingUp },
  { label: "Open Proposals", value: "9", change: "3 expiring this week", icon: FileText },
];

export const PROPOSAL_FUNNEL = [
  { label: "Sent", count: 42, color: "bg-(--primary-600)", pct: 100 },
  { label: "Reviewed", count: 31, color: "bg-blue-500", pct: 74 },
  { label: "Approved", count: 26, color: "bg-emerald-500", pct: 62 },
  { label: "Rejected", count: 5, color: "bg-red-400", pct: 12 },
];

export interface TopPartner {
  name: string;
  avatar: StaticImageData;
  revenue: string;
  revenueNum: number;
  deals: number;
  change: string;
  up: boolean;
}

export const TOP_PARTNERS: TopPartner[] = [
  { name: "TechCorp International", avatar: avatar1, revenue: "$12,400", revenueNum: 12400, deals: 4, change: "+22%", up: true },
  { name: "Greenfield University", avatar: avatar2, revenue: "$9,800", revenueNum: 9800, deals: 3, change: "+15%", up: true },
  { name: "Apex Solutions", avatar: avatar3, revenue: "$7,200", revenueNum: 7200, deals: 2, change: "-4%", up: false },
  { name: "NovaTech Partners", avatar: avatar4, revenue: "$5,600", revenueNum: 5600, deals: 2, change: "+9%", up: true },
  { name: "Bright Future NGO", avatar: avatar5, revenue: "$3,540", revenueNum: 3540, deals: 1, change: "+31%", up: true },
];

export const COURSE_PERFORMANCE = [
  { title: "Full-Stack Web Development", enrolled: 1240, completion: 88, revenue: "$8,200" },
  { title: "Machine Learning Fundamentals", enrolled: 870, completion: 76, revenue: "$6,400" },
  { title: "UI/UX Design Mastery", enrolled: 640, completion: 91, revenue: "$4,100" },
  { title: "DevOps & Cloud Infrastructure", enrolled: 420, completion: 82, revenue: "$3,800" },
  { title: "Clinical Data Management", enrolled: 310, completion: 95, revenue: "$2,900" },
];

export const PERIOD_COMPARISON = [
  { metric: "Revenue", thisMonth: "$38,540", lastMonth: "$32,580", change: "+18.3%", up: true },
  { metric: "New Partners", thisMonth: "3", lastMonth: "2", change: "+50%", up: true },
  { metric: "Proposals Sent", thisMonth: "12", lastMonth: "10", change: "+20%", up: true },
  { metric: "Win Rate", thisMonth: "62%", lastMonth: "55%", change: "+7pp", up: true },
  { metric: "Avg. Deal Value", thisMonth: "$4,280", lastMonth: "$3,960", change: "+8.1%", up: true },
  { metric: "Webinar Attendance", thisMonth: "78%", lastMonth: "71%", change: "+7pp", up: true },
];
