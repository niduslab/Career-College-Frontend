import { GraduationCap, UserCheck, Clock, Wallet } from "lucide-react";

export const STATS = [
  { label: "Total Instructors", value: "1,260", change: "+42 this month", icon: GraduationCap },
  { label: "Active", value: "1,184", change: "94% of total", icon: UserCheck },
  { label: "Pending Verification", value: "26", change: "8 submitted this week", icon: Clock },
  { label: "Total Payouts", value: "$412,900", change: "+9.2% vs last month", icon: Wallet },
];

export type InstructorStatus = "Active" | "Pending" | "Suspended";

export const STATUSES: InstructorStatus[] = ["Active", "Pending", "Suspended"];

export interface Instructor {
  id: string;
  name: string;
  initials: string;
  email: string;
  status: InstructorStatus;
  courses: number;
  students: number;
  rating: number;
  revenue: string;
  joined: string;
}

export const INSTRUCTORS: Instructor[] = [
  { id: "INS-4001", name: "Sarah Chen", initials: "SC", email: "sarah.chen@example.com", status: "Active", courses: 6, students: 18400, rating: 4.8, revenue: "$124,000", joined: "2025-02-14" },
  { id: "INS-4002", name: "James Okoro", initials: "JO", email: "james.okoro@example.com", status: "Active", courses: 4, students: 12900, rating: 4.6, revenue: "$98,600", joined: "2025-03-02" },
  { id: "INS-4003", name: "Priya Sharma", initials: "PS", email: "priya.sharma@example.com", status: "Active", courses: 5, students: 10200, rating: 4.9, revenue: "$76,300", joined: "2025-06-18" },
  { id: "INS-4004", name: "Michael Torres", initials: "MT", email: "michael.torres@example.com", status: "Active", courses: 3, students: 8100, rating: 4.4, revenue: "$54,900", joined: "2025-09-09" },
  { id: "INS-4005", name: "Emily Larsson", initials: "EL", email: "emily.larsson@example.com", status: "Active", courses: 2, students: 5600, rating: 4.7, revenue: "$31,200", joined: "2026-01-20" },
  { id: "INS-4006", name: "Daniel Roberts", initials: "DR", email: "daniel.roberts@example.com", status: "Suspended", courses: 2, students: 1900, rating: 3.6, revenue: "$8,200", joined: "2025-04-23" },
  { id: "INS-4007", name: "Olivia Bennett", initials: "OB", email: "olivia.bennett@example.com", status: "Pending", courses: 0, students: 0, rating: 0, revenue: "$0", joined: "2026-07-02" },
  { id: "INS-4008", name: "Marcus Lee", initials: "ML", email: "marcus.lee@example.com", status: "Pending", courses: 0, students: 0, rating: 0, revenue: "$0", joined: "2026-07-05" },
  { id: "INS-4009", name: "Hannah Kim", initials: "HK", email: "hannah.kim@example.com", status: "Active", courses: 1, students: 2400, rating: 4.5, revenue: "$12,800", joined: "2026-02-27" },
  { id: "INS-4010", name: "Kevin Park", initials: "KP", email: "kevin.park@example.com", status: "Suspended", courses: 1, students: 540, rating: 2.9, revenue: "$3,600", joined: "2025-11-30" },
];
