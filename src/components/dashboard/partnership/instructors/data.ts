import { GraduationCap, Star, BookOpen, Users } from "lucide-react";
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
import {
  Instructor,
  Department,
  Specialization,
  InstructorStatus,
} from "./types";

export const INSTRUCTORS: Instructor[] = [
  {
    id: "i1",
    name: "Sarah Kim",
    avatar: avatar1,
    email: "sarah.kim@techcorp.com",
    department: "Engineering",
    specialization: "Frontend",
    courses: 6,
    rating: 4.9,
    joinedDate: "Jan 10, 2026",
    status: "Active",
  },
  {
    id: "i2",
    name: "Dr. Alan Torres",
    avatar: avatar2,
    email: "alan.torres@greenfield.edu",
    department: "Data Science",
    specialization: "ML/AI",
    courses: 4,
    rating: 4.8,
    joinedDate: "Feb 14, 2026",
    status: "Active",
  },
  {
    id: "i3",
    name: "James Reed",
    avatar: avatar3,
    email: "james.reed@apexsol.com",
    department: "Engineering",
    specialization: "Backend",
    courses: 0,
    rating: 0,
    joinedDate: "Apr 1, 2026",
    status: "Pending",
  },
  {
    id: "i4",
    name: "Lena Müller",
    avatar: avatar4,
    email: "lena.muller@novatech.io",
    department: "Business",
    specialization: "Finance",
    courses: 5,
    rating: 4.7,
    joinedDate: "Jan 30, 2026",
    status: "Active",
  },
  {
    id: "i5",
    name: "Amara Osei",
    avatar: avatar5,
    email: "amara.osei@brightfuture.org",
    department: "Healthcare",
    specialization: "Clinical",
    courses: 2,
    rating: 4.5,
    joinedDate: "Dec 1, 2025",
    status: "Inactive",
  },
  {
    id: "i6",
    name: "Mark Patel",
    avatar: avatar6,
    email: "mark.patel@orion.com",
    department: "Design",
    specialization: "UI/UX",
    courses: 7,
    rating: 4.9,
    joinedDate: "Mar 5, 2026",
    status: "Active",
  },
  {
    id: "i7",
    name: "Dr. Priya Singh",
    avatar: image1,
    email: "priya.singh@medbridge.au",
    department: "Healthcare",
    specialization: "Clinical",
    courses: 3,
    rating: 4.6,
    joinedDate: "Mar 18, 2026",
    status: "Active",
  },
  {
    id: "i8",
    name: "Wei Liang",
    avatar: image2,
    email: "wei.liang@civicnet.gov.sg",
    department: "Business",
    specialization: "Product",
    courses: 0,
    rating: 0,
    joinedDate: "Feb 28, 2026",
    status: "Pending",
  },
  {
    id: "i9",
    name: "Carlos Mendez",
    avatar: image3,
    email: "carlos.m@growthlab.io",
    department: "Marketing",
    specialization: "Growth",
    courses: 4,
    rating: 4.7,
    joinedDate: "Mar 22, 2026",
    status: "Active",
  },
  {
    id: "i10",
    name: "Nina Kovac",
    avatar: image4,
    email: "nina.kovac@devops.eu",
    department: "Engineering",
    specialization: "DevOps",
    courses: 3,
    rating: 4.6,
    joinedDate: "Apr 5, 2026",
    status: "Active",
  },
];

export const STATS = [
  {
    label: "Total Instructors",
    value: "42",
    change: "+6 this quarter",
    icon: GraduationCap,
  },
  { label: "Active", value: "34", change: "81% active rate", icon: Users },
  {
    label: "Avg. Rating",
    value: "4.7",
    change: "+0.2 vs last month",
    icon: Star,
  },
  {
    label: "Total Courses",
    value: "128",
    change: "+14 this month",
    icon: BookOpen,
  },
];

export const DEPT_BREAKDOWN: {
  label: Department;
  count: number;
  color: string;
}[] = [
  { label: "Engineering", count: 3, color: "bg-blue-500" },
  { label: "Design", count: 1, color: "bg-purple-500" },
  { label: "Business", count: 2, color: "bg-orange-400" },
  { label: "Data Science", count: 1, color: "bg-green-500" },
  { label: "Marketing", count: 1, color: "bg-pink-500" },
  { label: "Healthcare", count: 2, color: "bg-teal-500" },
];

export const SPECIALIZATION_TAGS: { label: Specialization; color: string }[] = [
  { label: "Frontend", color: "bg-blue-50 text-blue-600" },
  { label: "Backend", color: "bg-indigo-50 text-indigo-600" },
  { label: "UI/UX", color: "bg-purple-50 text-purple-600" },
  { label: "Product", color: "bg-orange-50 text-orange-600" },
  { label: "ML/AI", color: "bg-green-50 text-green-600" },
  { label: "DevOps", color: "bg-gray-100 text-gray-600" },
  { label: "Finance", color: "bg-yellow-50 text-yellow-700" },
  { label: "Growth", color: "bg-pink-50 text-pink-600" },
  { label: "Clinical", color: "bg-teal-50 text-teal-600" },
];

export const TIPS = [
  {
    color: "text-blue-500",
    text: "Instructors with 4.8+ ratings drive 2× more course completions.",
  },
  {
    color: "text-green-500",
    text: "Invite instructors via email to onboard them without manual setup.",
  },
  {
    color: "text-orange-500",
    text: "Use Bulk Add with a CSV to onboard partner teams quickly.",
  },
];

export const DEPARTMENTS: ("All" | Department)[] = [
  "All",
  "Engineering",
  "Design",
  "Business",
  "Data Science",
  "Marketing",
  "Healthcare",
];
export const SPECIALIZATIONS: ("All" | Specialization)[] = [
  "All",
  "Frontend",
  "Backend",
  "UI/UX",
  "Product",
  "ML/AI",
  "DevOps",
  "Finance",
  "Growth",
  "Clinical",
];
export const STATUSES: ("All" | InstructorStatus)[] = [
  "All",
  "Active",
  "Pending",
  "Inactive",
];
