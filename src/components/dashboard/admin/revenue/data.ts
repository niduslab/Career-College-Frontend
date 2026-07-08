import { Wallet, TrendingUp, RotateCcw, DollarSign } from "lucide-react";
import { Transaction, TransactionStatus, PaymentMethod } from "./types";

export const STATS = [
  { label: "Total Revenue", value: "$842,300", change: "+12.7% vs last month", icon: Wallet },
  { label: "This Month", value: "$96,400", change: "+8.2% vs last month", icon: TrendingUp },
  { label: "Refunds", value: "$8,120", change: "0.96% of total revenue", icon: RotateCcw },
  { label: "Net Revenue", value: "$834,180", change: "+12.4% vs last month", icon: DollarSign },
];

export const REVENUE_BREAKDOWN = [
  { label: "Course Sales", amount: "$612,400", pct: 73, color: "bg-(--primary-600)" },
  { label: "Subscriptions", amount: "$148,900", pct: 18, color: "bg-blue-500" },
  { label: "Partner Programs", amount: "$62,100", pct: 7, color: "bg-emerald-500" },
  { label: "Certificates", amount: "$18,900", pct: 2, color: "bg-orange-400" },
];

export const TOP_REVENUE_COURSES = [
  { title: "Full-Stack Web Development", category: "Development", revenue: "$82,200", revenueNum: 82200 },
  { title: "Machine Learning Fundamentals", category: "Data Science", revenue: "$64,400", revenueNum: 64400 },
  { title: "UI/UX Design Mastery", category: "Design", revenue: "$41,100", revenueNum: 41100 },
  { title: "DevOps & Cloud Infrastructure", category: "IT & Ops", revenue: "$38,800", revenueNum: 38800 },
  { title: "Clinical Data Management", category: "Healthcare", revenue: "$29,900", revenueNum: 29900 },
];

export const METHODS: PaymentMethod[] = ["Credit Card", "PayPal", "Bank Transfer", "Wallet"];
export const STATUSES: TransactionStatus[] = ["Completed", "Pending", "Refunded", "Failed"];

export const TRANSACTIONS: Transaction[] = [
  { id: "TXN-7001", student: "Hannah Kim", course: "Full-Stack Web Development", amount: "$249.00", method: "Credit Card", status: "Completed", date: "2026-07-08" },
  { id: "TXN-7002", student: "Liam O'Connor", course: "UI/UX Design Mastery", amount: "$189.00", method: "PayPal", status: "Completed", date: "2026-07-08" },
  { id: "TXN-7003", student: "Olivia Bennett", course: "Machine Learning Fundamentals", amount: "$299.00", method: "Credit Card", status: "Pending", date: "2026-07-07" },
  { id: "TXN-7004", student: "Michael Torres", course: "DevOps & Cloud Infrastructure", amount: "$219.00", method: "Bank Transfer", status: "Completed", date: "2026-07-07" },
  { id: "TXN-7005", student: "Emily Larsson", course: "Clinical Data Management", amount: "$179.00", method: "Wallet", status: "Refunded", date: "2026-07-06" },
  { id: "TXN-7006", student: "Kevin Park", course: "Crypto Trading Bootcamp", amount: "$99.00", method: "Credit Card", status: "Failed", date: "2026-07-06" },
  { id: "TXN-7007", student: "Priya Sharma", course: "UI/UX Design Mastery", amount: "$189.00", method: "PayPal", status: "Completed", date: "2026-07-05" },
  { id: "TXN-7008", student: "Daniel Roberts", course: "Full-Stack Web Development", amount: "$249.00", method: "Credit Card", status: "Completed", date: "2026-07-05" },
  { id: "TXN-7009", student: "Sarah Chen", course: "Machine Learning Fundamentals", amount: "$299.00", method: "Bank Transfer", status: "Completed", date: "2026-07-04" },
  { id: "TXN-7010", student: "James Okoro", course: "Digital Marketing Essentials", amount: "$149.00", method: "Wallet", status: "Pending", date: "2026-07-04" },
];
