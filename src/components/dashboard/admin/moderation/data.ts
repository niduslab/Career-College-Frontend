import { Flag, CheckCircle2, Clock, UserX } from "lucide-react";
import { Report, ReportContentType, ReportReason, ReportStatus } from "./types";

export const STATS = [
  { label: "Open Reports", value: "18", change: "6 new today", icon: Flag },
  { label: "Resolved Today", value: "9", change: "+3 vs yesterday", icon: CheckCircle2 },
  { label: "Under Investigation", value: "5", change: "Avg. 2.3 days open", icon: Clock },
  { label: "Repeat Offenders", value: "4", change: "3+ reports this month", icon: UserX },
];

export const CONTENT_TYPES: ("All" | ReportContentType)[] = [
  "All",
  "Course Review",
  "Comment",
  "Forum Post",
  "Message",
];

export const REASONS: ("All" | ReportReason)[] = [
  "All",
  "Spam",
  "Harassment",
  "Copyright",
  "Inappropriate",
  "Misinformation",
];

export const STATUSES: ("All" | ReportStatus)[] = ["All", "Open", "Resolved", "Dismissed"];

export const REPORTS: Report[] = [
  { id: "RPT-6001", content: "\"This course is a total scam, don't waste your money...\"", contentType: "Course Review", reportedUser: "Kevin Park", reporter: "Sarah Chen", reason: "Harassment", status: "Open", reported: "2026-07-07" },
  { id: "RPT-6002", content: "Link spam posted across 12 different course comment sections", contentType: "Comment", reportedUser: "cryptoguru99", reporter: "System (AI)", reason: "Spam", status: "Open", reported: "2026-07-06" },
  { id: "RPT-6003", content: "Uploaded lecture slides copied verbatim from a paid textbook", contentType: "Forum Post", reportedUser: "Daniel Roberts", reporter: "James Okoro", reason: "Copyright", status: "Open", reported: "2026-07-05" },
  { id: "RPT-6004", content: "Direct message containing explicit content sent to a student", contentType: "Message", reportedUser: "Marcus Lee", reporter: "Hannah Kim", reason: "Inappropriate", status: "Open", reported: "2026-07-08" },
  { id: "RPT-6005", content: "\"Great course, learned a lot about React hooks!\"", contentType: "Course Review", reportedUser: "Olivia Bennett", reporter: "Michael Torres", reason: "Spam", status: "Dismissed", reported: "2026-06-28" },
  { id: "RPT-6006", content: "Forum post claiming the platform issues fake certificates", contentType: "Forum Post", reportedUser: "anon_user42", reporter: "Priya Sharma", reason: "Misinformation", status: "Resolved", reported: "2026-06-25" },
  { id: "RPT-6007", content: "Repeated insults directed at an instructor in course Q&A", contentType: "Comment", reportedUser: "Kevin Park", reporter: "Emily Larsson", reason: "Harassment", status: "Resolved", reported: "2026-06-20" },
  { id: "RPT-6008", content: "Promotional link for an unrelated crypto trading service", contentType: "Comment", reportedUser: "cryptoguru99", reporter: "System (AI)", reason: "Spam", status: "Open", reported: "2026-07-08" },
  { id: "RPT-6009", content: "Screenshot of paid course content shared publicly without license", contentType: "Forum Post", reportedUser: "Liam O'Connor", reporter: "Sarah Chen", reason: "Copyright", status: "Resolved", reported: "2026-06-15" },
  { id: "RPT-6010", content: "Message soliciting students for an off-platform paid tutoring scheme", contentType: "Message", reportedUser: "Kevin Park", reporter: "Hannah Kim", reason: "Inappropriate", status: "Open", reported: "2026-07-04" },
];
