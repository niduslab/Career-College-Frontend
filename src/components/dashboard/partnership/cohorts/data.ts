import { Users, CalendarDays, CheckCircle2, TrendingUp } from "lucide-react";
import avatar1 from "@/assets/images/instructors/instructor1.webp";
import avatar2 from "@/assets/images/instructors/instructor2.webp";
import avatar3 from "@/assets/images/instructors/instructor3.webp";
import avatar4 from "@/assets/images/instructors/instructor4.webp";
import avatar5 from "@/assets/images/instructors/instructor5.webp";
import avatar6 from "@/assets/images/instructors/instructor6.webp";
import image1 from "@/assets/images/instructors/image1.webp";
import image2 from "@/assets/images/instructors/image2.webp";
import image3 from "@/assets/images/instructors/image3.webp";
import image4 from "@/assets/images/instructors/image4.webp";
import { Cohort, CohortDepartment, CohortMode, CohortStatus } from "./types";

export const COHORTS: Cohort[] = [
  {
    id: "co1",
    name: "Web Dev Batch 2026-A",
    course: "Full-Stack Web Development Bootcamp",
    courseThumbnail: image1,
    instructor: "Sarah Kim",
    instructorAvatar: avatar1,
    department: "Engineering",
    mode: "Online",
    enrolled: 28,
    capacity: 30,
    startDate: "Jan 10, 2026",
    endDate: "Mar 20, 2026",
    status: "Completed",
  },
  {
    id: "co2",
    name: "ML Cohort Spring 2026",
    course: "Machine Learning Fundamentals",
    courseThumbnail: image2,
    instructor: "Dr. Alan Torres",
    instructorAvatar: avatar2,
    department: "Data Science",
    mode: "Hybrid",
    enrolled: 22,
    capacity: 25,
    startDate: "Mar 1, 2026",
    endDate: "May 15, 2026",
    status: "Active",
  },
  {
    id: "co3",
    name: "UX Design — June Intake",
    course: "UI/UX Design Mastery",
    courseThumbnail: image3,
    instructor: "Mark Patel",
    instructorAvatar: avatar6,
    department: "Design",
    mode: "Online",
    enrolled: 18,
    capacity: 20,
    startDate: "Jun 5, 2026",
    endDate: "Aug 10, 2026",
    status: "Upcoming",
  },
  {
    id: "co4",
    name: "Finance Modelling — Q2",
    course: "Financial Modelling & Analysis",
    courseThumbnail: image4,
    instructor: "Lena Müller",
    instructorAvatar: avatar4,
    department: "Business",
    mode: "In-Person",
    enrolled: 15,
    capacity: 15,
    startDate: "Apr 14, 2026",
    endDate: "Jun 20, 2026",
    status: "Active",
  },
  {
    id: "co5",
    name: "DevOps Cloud — May Run",
    course: "DevOps & Cloud Infrastructure",
    courseThumbnail: image1,
    instructor: "Nina Kovac",
    instructorAvatar: avatar5,
    department: "Engineering",
    mode: "Online",
    enrolled: 0,
    capacity: 20,
    startDate: "Jul 1, 2026",
    endDate: "Sep 15, 2026",
    status: "Upcoming",
  },
  {
    id: "co6",
    name: "Digital Marketing — Batch 3",
    course: "Digital Marketing Strategy 2026",
    courseThumbnail: image2,
    instructor: "Carlos Mendez",
    instructorAvatar: avatar3,
    department: "Marketing",
    mode: "Hybrid",
    enrolled: 12,
    capacity: 20,
    startDate: "Feb 20, 2026",
    endDate: "Apr 5, 2026",
    status: "Completed",
  },
  {
    id: "co7",
    name: "Clinical Data — Healthcare A",
    course: "Clinical Data Management",
    courseThumbnail: image3,
    instructor: "Dr. Priya Singh",
    instructorAvatar: avatar5,
    department: "Healthcare",
    mode: "Online",
    enrolled: 8,
    capacity: 15,
    startDate: "May 10, 2026",
    endDate: "Jul 20, 2026",
    status: "Active",
  },
  {
    id: "co8",
    name: "Product Mgmt — Cohort 1",
    course: "Product Management Essentials",
    courseThumbnail: image4,
    instructor: "Wei Liang",
    instructorAvatar: avatar2,
    department: "Business",
    mode: "In-Person",
    enrolled: 0,
    capacity: 18,
    startDate: "Aug 1, 2026",
    endDate: "Oct 10, 2026",
    status: "Cancelled",
  },
];

export const STATS = [
  { label: "Total Cohorts", value: "8", change: "+2 this month", icon: CalendarDays },
  { label: "Active Cohorts", value: "3", change: "Running now", icon: Users },
  { label: "Completion Rate", value: "94%", change: "+2% vs last batch", icon: CheckCircle2 },
  { label: "Total Learners", value: "103", change: "+18 this month", icon: TrendingUp },
];

export const DEPT_BREAKDOWN: { label: CohortDepartment; count: number; color: string }[] = [
  { label: "Engineering", count: 2, color: "bg-(--primary-600)" },
  { label: "Business", count: 2, color: "bg-blue-500" },
  { label: "Data Science", count: 1, color: "bg-purple-500" },
  { label: "Design", count: 1, color: "bg-pink-500" },
  { label: "Marketing", count: 1, color: "bg-orange-400" },
  { label: "Healthcare", count: 1, color: "bg-emerald-500" },
];

export const TIPS = [
  { color: "text-blue-500", text: "Keep cohort sizes under 30 for better instructor engagement." },
  { color: "text-green-500", text: "Send reminders 1 week before start to reduce no-shows." },
  { color: "text-orange-500", text: "Hybrid cohorts see 15% higher completion than online-only." },
];

export const DEPARTMENTS: ("All" | CohortDepartment)[] = [
  "All", "Engineering", "Design", "Business", "Data Science", "Marketing", "Healthcare",
];
export const MODES: ("All" | CohortMode)[] = ["All", "Online", "Hybrid", "In-Person"];
export const STATUSES: ("All" | CohortStatus)[] = ["All", "Active", "Upcoming", "Completed", "Cancelled"];
