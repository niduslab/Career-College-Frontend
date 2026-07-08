import { Wallet, Clock, CalendarClock, AlertTriangle } from "lucide-react";
import { Payout, PayoutMethod, PayoutRecipientType, PayoutStatus } from "./types";

export const STATS = [
  { label: "Total Paid Out", value: "$412,900", change: "+9.2% vs last month", icon: Wallet },
  { label: "Pending Payouts", value: "$28,600", change: "14 recipients", icon: Clock },
  { label: "Next Payout Run", value: "Jul 15, 2026", change: "$34,200 scheduled", icon: CalendarClock },
  { label: "Failed / On Hold", value: "$4,100", change: "3 need attention", icon: AlertTriangle },
];

export const TYPES: PayoutRecipientType[] = ["Instructor", "Partner"];
export const METHODS: PayoutMethod[] = ["Bank Transfer", "PayPal", "Wallet"];
export const STATUSES: PayoutStatus[] = ["Paid", "Pending", "Failed", "On Hold"];

export const PAYOUTS: Payout[] = [
  { id: "PYT-8001", recipient: "Sarah Chen", initials: "SC", type: "Instructor", amount: "$12,400", method: "Bank Transfer", status: "Paid", scheduled: "2026-07-01" },
  { id: "PYT-8002", recipient: "James Okoro", initials: "JO", type: "Instructor", amount: "$9,860", method: "PayPal", status: "Paid", scheduled: "2026-07-01" },
  { id: "PYT-8003", recipient: "TechCorp International", initials: "TC", type: "Partner", amount: "$18,200", method: "Bank Transfer", status: "Pending", scheduled: "2026-07-15" },
  { id: "PYT-8004", recipient: "Priya Sharma", initials: "PS", type: "Instructor", amount: "$7,630", method: "Wallet", status: "Pending", scheduled: "2026-07-15" },
  { id: "PYT-8005", recipient: "Greenfield University", initials: "GU", type: "Partner", amount: "$9,860", method: "Bank Transfer", status: "Paid", scheduled: "2026-07-01" },
  { id: "PYT-8006", recipient: "Kevin Park", initials: "KP", type: "Instructor", amount: "$360", method: "PayPal", status: "Failed", scheduled: "2026-07-01" },
  { id: "PYT-8007", recipient: "Michael Torres", initials: "MT", type: "Instructor", amount: "$5,490", method: "Bank Transfer", status: "Paid", scheduled: "2026-06-15" },
  { id: "PYT-8008", recipient: "Daniel Roberts", initials: "DR", type: "Instructor", amount: "$820", method: "Wallet", status: "On Hold", scheduled: "2026-07-01" },
  { id: "PYT-8009", recipient: "Bright Future NGO", initials: "BF", type: "Partner", amount: "$3,120", method: "Bank Transfer", status: "Pending", scheduled: "2026-07-15" },
  { id: "PYT-8010", recipient: "Emily Larsson", initials: "EL", type: "Instructor", amount: "$3,120", method: "PayPal", status: "Paid", scheduled: "2026-06-15" },
];
