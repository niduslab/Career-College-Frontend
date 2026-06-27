import { Wallet, TrendingUp, Clock, DollarSign } from "lucide-react";

export const REVENUE_STATS = [
  { label: "Total Revenue", value: "$128,540", change: "+18.3% vs last month", icon: Wallet },
  { label: "Commission Earned", value: "$19,281", change: "+14.7% vs last month", icon: TrendingUp },
  { label: "Pending Payouts", value: "$6,420", change: "3 partners awaiting", icon: Clock },
  { label: "Avg. Deal Value", value: "$4,280", change: "+8.1% vs last month", icon: DollarSign },
];

export const REVENUE_CHART = [
  { month: "Jan", revenue: 14200, commission: 2130 },
  { month: "Feb", revenue: 16800, commission: 2520 },
  { month: "Mar", revenue: 15400, commission: 2310 },
  { month: "Apr", revenue: 19600, commission: 2940 },
  { month: "May", revenue: 22300, commission: 3345 },
  { month: "Jun", revenue: 26800, commission: 4020 },
];

export const REVENUE_BY_PARTNER = [
  { id: "rp1", name: "TechCorp International", initials: "TC", revenue: 38540, deals: 8, pct: 30, trend: "+22%" },
  { id: "rp2", name: "Greenfield University", initials: "GU", revenue: 24300, deals: 5, pct: 19, trend: "+11%" },
  { id: "rp3", name: "NovaTech Partners", initials: "NT", revenue: 19800, deals: 6, pct: 15, trend: "+8%" },
  { id: "rp4", name: "Apex Solutions", initials: "AP", revenue: 16400, deals: 4, pct: 13, trend: "-3%" },
  { id: "rp5", name: "Elevate Corp", initials: "EC", revenue: 12600, deals: 3, pct: 10, trend: "+17%" },
];

export type TxStatus = "Paid" | "Pending" | "Processing";

export interface Transaction {
  id: string;
  date: string;
  partner: string;
  partnerInitials: string;
  course: string;
  amount: number;
  commission: number;
  status: TxStatus;
}

export const TRANSACTIONS: Transaction[] = [
  { id: "tx1",  date: "Jun 24, 2026", partner: "TechCorp International",  partnerInitials: "TC", course: "Enterprise Data Analytics",      amount: 9800,  commission: 1470, status: "Paid" },
  { id: "tx2",  date: "Jun 22, 2026", partner: "Greenfield University",   partnerInitials: "GU", course: "Full-Stack Web Dev Bootcamp",    amount: 6200,  commission: 930,  status: "Paid" },
  { id: "tx3",  date: "Jun 20, 2026", partner: "NovaTech Partners",       partnerInitials: "NT", course: "FinTech Leadership Dev",         amount: 5400,  commission: 810,  status: "Processing" },
  { id: "tx4",  date: "Jun 18, 2026", partner: "Apex Solutions",          partnerInitials: "AP", course: "Product Management Fundamentals",amount: 4100,  commission: 615,  status: "Pending" },
  { id: "tx5",  date: "Jun 15, 2026", partner: "Elevate Corp",            partnerInitials: "EC", course: "UX Design Mastery",              amount: 3800,  commission: 570,  status: "Paid" },
  { id: "tx6",  date: "Jun 12, 2026", partner: "TechCorp International",  partnerInitials: "TC", course: "Cloud Infrastructure Essentials", amount: 7200, commission: 1080, status: "Paid" },
  { id: "tx7",  date: "Jun 10, 2026", partner: "Bright Future NGO",       partnerInitials: "BF", course: "Clinical Data Management",       amount: 2900,  commission: 435,  status: "Pending" },
  { id: "tx8",  date: "Jun 08, 2026", partner: "Greenfield University",   partnerInitials: "GU", course: "Data Science & ML Foundations",  amount: 8100,  commission: 1215, status: "Paid" },
  { id: "tx9",  date: "Jun 05, 2026", partner: "NovaTech Partners",       partnerInitials: "NT", course: "Cybersecurity Fundamentals",     amount: 4600,  commission: 690,  status: "Processing" },
  { id: "tx10", date: "Jun 02, 2026", partner: "Apex Solutions",          partnerInitials: "AP", course: "Agile Project Management",       amount: 3200,  commission: 480,  status: "Pending" },
];
