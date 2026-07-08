import { CheckCircle2, AlertTriangle, Clock, XCircle } from "lucide-react";

export const STATS = [
  { label: "Auto-approved", value: "142", change: "This month", icon: CheckCircle2 },
  { label: "Flagged for Review", value: "18", change: "Needs manual decision", icon: AlertTriangle },
  { label: "Pending Submission", value: "9", change: "Awaiting AI scoring", icon: Clock },
  { label: "Rejected", value: "6", change: "This month", icon: XCircle },
];

export type ApprovalStatus = "Auto-approved" | "Flagged" | "Pending" | "Rejected";

export const STATUSES: ApprovalStatus[] = ["Auto-approved", "Flagged", "Pending", "Rejected"];

export interface Approval {
  id: string;
  course: string;
  initials: string;
  instructor: string;
  score: number;
  issue: string;
  status: ApprovalStatus;
  submitted: string;
}

export const APPROVALS: Approval[] = [
  { id: "APR-3001", course: "Mastering System Design", initials: "SD", instructor: "Daniel Roberts", score: 68, issue: "Readability below threshold", status: "Flagged", submitted: "2026-07-05" },
  { id: "APR-3002", course: "Crypto Trading Bootcamp", initials: "CT", instructor: "Olivia Bennett", score: 54, issue: "Copyright detection", status: "Flagged", submitted: "2026-07-04" },
  { id: "APR-3003", course: "Quick Excel Hacks", initials: "QE", instructor: "Marcus Lee", score: 61, issue: "Incomplete content", status: "Flagged", submitted: "2026-07-06" },
  { id: "APR-3004", course: "Full-Stack Web Development", initials: "FW", instructor: "Sarah Chen", score: 92, issue: "—", status: "Auto-approved", submitted: "2026-07-01" },
  { id: "APR-3005", course: "Machine Learning Fundamentals", initials: "ML", instructor: "James Okoro", score: 88, issue: "—", status: "Auto-approved", submitted: "2026-06-29" },
  { id: "APR-3006", course: "DevOps & Cloud Infrastructure", initials: "DC", instructor: "Michael Torres", score: 0, issue: "Awaiting AI scoring", status: "Pending", submitted: "2026-07-07" },
  { id: "APR-3007", course: "Intro to Data Structures", initials: "DS", instructor: "Hannah Kim", score: 0, issue: "Awaiting AI scoring", status: "Pending", submitted: "2026-07-08" },
  { id: "APR-3008", course: "Get Rich Quick Trading Secrets", initials: "GR", instructor: "Kevin Park", score: 31, issue: "Misleading claims", status: "Rejected", submitted: "2026-06-20" },
  { id: "APR-3009", course: "UI/UX Design Mastery", initials: "UX", instructor: "Priya Sharma", score: 95, issue: "—", status: "Auto-approved", submitted: "2026-06-18" },
  { id: "APR-3010", course: "Clinical Data Management", initials: "CD", instructor: "Emily Larsson", score: 90, issue: "—", status: "Auto-approved", submitted: "2026-06-15" },
];
