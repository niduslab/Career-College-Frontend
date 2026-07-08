import { Users, UserCheck, UserPlus, UserX } from "lucide-react";

export const STATS = [
  { label: "Total Users", value: "48,920", change: "+1,240 this month", icon: Users },
  { label: "Active Users", value: "44,180", change: "90.3% of total", icon: UserCheck },
  { label: "New Signups", value: "1,240", change: "+18.6% vs last month", icon: UserPlus },
  { label: "Suspended", value: "86", change: "0.17% of total", icon: UserX },
];

export type UserRole = "Student" | "Instructor" | "Admin";
export type UserStatus = "Active" | "Inactive" | "Suspended";

export interface PlatformUser {
  id: string;
  name: string;
  initials: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  joined: string;
  lastActive: string;
  courses: number;
}

export const ROLES: UserRole[] = ["Student", "Instructor", "Admin"];
export const STATUSES: UserStatus[] = ["Active", "Inactive", "Suspended"];

export const USERS: PlatformUser[] = [
  { id: "USR-1001", name: "Sarah Chen", initials: "SC", email: "sarah.chen@example.com", role: "Instructor", status: "Active", joined: "2025-02-14", lastActive: "2026-07-07", courses: 6 },
  { id: "USR-1002", name: "James Okoro", initials: "JO", email: "james.okoro@example.com", role: "Instructor", status: "Active", joined: "2025-03-02", lastActive: "2026-07-06", courses: 4 },
  { id: "USR-1003", name: "Emily Larsson", initials: "EL", email: "emily.larsson@example.com", role: "Student", status: "Active", joined: "2026-01-20", lastActive: "2026-07-08", courses: 3 },
  { id: "USR-1004", name: "Michael Torres", initials: "MT", email: "michael.torres@example.com", role: "Student", status: "Inactive", joined: "2025-11-11", lastActive: "2026-05-02", courses: 1 },
  { id: "USR-1005", name: "Priya Sharma", initials: "PS", email: "priya.sharma@example.com", role: "Instructor", status: "Active", joined: "2025-06-18", lastActive: "2026-07-05", courses: 5 },
  { id: "USR-1006", name: "Liam O'Connor", initials: "LO", email: "liam.oconnor@example.com", role: "Student", status: "Suspended", joined: "2025-09-09", lastActive: "2026-06-01", courses: 2 },
  { id: "USR-1007", name: "Hannah Kim", initials: "HK", email: "hannah.kim@example.com", role: "Student", status: "Active", joined: "2026-02-27", lastActive: "2026-07-08", courses: 4 },
  { id: "USR-1008", name: "Al Amin", initials: "AA", email: "alamin@niduslab.com", role: "Admin", status: "Active", joined: "2024-08-01", lastActive: "2026-07-08", courses: 0 },
  { id: "USR-1009", name: "Daniel Roberts", initials: "DR", email: "daniel.roberts@example.com", role: "Instructor", status: "Inactive", joined: "2025-04-23", lastActive: "2026-04-14", courses: 2 },
  { id: "USR-1010", name: "Olivia Bennett", initials: "OB", email: "olivia.bennett@example.com", role: "Student", status: "Active", joined: "2026-03-05", lastActive: "2026-07-07", courses: 2 },
];
