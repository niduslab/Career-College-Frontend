import { BookOpen, CheckCircle2, Clock, Flag } from "lucide-react";

export const STATS = [
  { label: "Total Courses", value: "3,184", change: "+96 published this month", icon: BookOpen },
  { label: "Published", value: "2,860", change: "89.8% of total", icon: CheckCircle2 },
  { label: "Pending Review", value: "236", change: "42 submitted this week", icon: Clock },
  { label: "Flagged", value: "18", change: "Needs manual decision", icon: Flag },
];

export type CourseStatus = "Published" | "Draft" | "Pending" | "Flagged";
export type CourseCategory =
  | "Development"
  | "Data Science"
  | "Design"
  | "IT & Ops"
  | "Healthcare"
  | "Business";

export const CATEGORIES: CourseCategory[] = [
  "Development",
  "Data Science",
  "Design",
  "IT & Ops",
  "Healthcare",
  "Business",
];

export const STATUSES: CourseStatus[] = ["Published", "Draft", "Pending", "Flagged"];

export interface Course {
  id: string;
  title: string;
  initials: string;
  instructor: string;
  category: CourseCategory;
  status: CourseStatus;
  enrolled: number;
  rating: number;
  revenue: string;
  created: string;
}

export const COURSES: Course[] = [
  { id: "CRS-2001", title: "Full-Stack Web Development", initials: "FW", instructor: "Sarah Chen", category: "Development", status: "Published", enrolled: 12400, rating: 4.8, revenue: "$82,200", created: "2025-02-14" },
  { id: "CRS-2002", title: "Machine Learning Fundamentals", initials: "ML", instructor: "James Okoro", category: "Data Science", status: "Published", enrolled: 8700, rating: 4.6, revenue: "$64,400", created: "2025-03-02" },
  { id: "CRS-2003", title: "UI/UX Design Mastery", initials: "UX", instructor: "Priya Sharma", category: "Design", status: "Published", enrolled: 6400, rating: 4.9, revenue: "$41,100", created: "2025-06-18" },
  { id: "CRS-2004", title: "DevOps & Cloud Infrastructure", initials: "DC", instructor: "Michael Torres", category: "IT & Ops", status: "Pending", enrolled: 0, rating: 0, revenue: "$0", created: "2026-06-30" },
  { id: "CRS-2005", title: "Clinical Data Management", initials: "CD", instructor: "Emily Larsson", category: "Healthcare", status: "Published", enrolled: 3100, rating: 4.7, revenue: "$29,900", created: "2025-09-09" },
  { id: "CRS-2006", title: "Crypto Trading Bootcamp", initials: "CT", instructor: "Olivia Bennett", category: "Business", status: "Flagged", enrolled: 540, rating: 3.2, revenue: "$8,600", created: "2026-01-11" },
  { id: "CRS-2007", title: "Mastering System Design", initials: "SD", instructor: "Daniel Roberts", category: "Development", status: "Flagged", enrolled: 210, rating: 3.8, revenue: "$4,200", created: "2026-02-27" },
  { id: "CRS-2008", title: "Quick Excel Hacks", initials: "QE", instructor: "Marcus Lee", category: "Business", status: "Pending", enrolled: 0, rating: 0, revenue: "$0", created: "2026-07-01" },
  { id: "CRS-2009", title: "Intro to Data Structures", initials: "DS", instructor: "Hannah Kim", category: "Development", status: "Draft", enrolled: 0, rating: 0, revenue: "$0", created: "2026-06-20" },
  { id: "CRS-2010", title: "Digital Marketing Essentials", initials: "DM", instructor: "Liam O'Connor", category: "Business", status: "Published", enrolled: 5600, rating: 4.4, revenue: "$31,200", created: "2025-09-09" },
];
