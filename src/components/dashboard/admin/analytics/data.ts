import { Users, GraduationCap, Wallet, BookOpen } from "lucide-react";

export const STATS = [
  {
    label: "Total Users",
    value: "48,920",
    change: "+1,240 this month",
    icon: Users,
  },
  {
    label: "Total Enrollments",
    value: "126,480",
    change: "+8.4% vs last month",
    icon: GraduationCap,
  },
  {
    label: "Platform Revenue",
    value: "$842,300",
    change: "+12.7% vs last month",
    icon: Wallet,
  },
  {
    label: "Active Courses",
    value: "3,184",
    change: "+96 published this month",
    icon: BookOpen,
  },
];

export const ENROLLMENT_FUNNEL = [
  {
    label: "Visited Course Page",
    count: 84500,
    color: "bg-(--primary-600)",
    pct: 100,
  },
  {
    label: "Started Enrollment",
    count: 52300,
    color: "bg-(--primary-600)",
    pct: 62,
  },
  {
    label: "Completed Payment",
    count: 38200,
    color: "bg-(--primary-600)",
    pct: 45,
  },
  { label: "Dropped Off", count: 14100, color: "bg-(--primary-600)", pct: 17 },
];

export interface TopCourse {
  title: string;
  category: string;
  enrolled: number;
  completion: number;
  revenue: string;
}

export const TOP_COURSES: TopCourse[] = [
  {
    title: "Full-Stack Web Development",
    category: "Development",
    enrolled: 12400,
    completion: 88,
    revenue: "$82,200",
  },
  {
    title: "Machine Learning Fundamentals",
    category: "Data Science",
    enrolled: 8700,
    completion: 76,
    revenue: "$64,400",
  },
  {
    title: "UI/UX Design Mastery",
    category: "Design",
    enrolled: 6400,
    completion: 91,
    revenue: "$41,100",
  },
  {
    title: "DevOps & Cloud Infrastructure",
    category: "IT & Ops",
    enrolled: 4200,
    completion: 82,
    revenue: "$38,800",
  },
  {
    title: "Clinical Data Management",
    category: "Healthcare",
    enrolled: 3100,
    completion: 95,
    revenue: "$29,900",
  },
];

export interface TopInstructor {
  name: string;
  initials: string;
  courses: number;
  students: number;
  revenue: string;
  revenueNum: number;
  change: string;
  up: boolean;
}

export const TOP_INSTRUCTORS: TopInstructor[] = [
  {
    name: "Dr. Sarah Chen",
    initials: "SC",
    courses: 6,
    students: 18400,
    revenue: "$124,000",
    revenueNum: 124000,
    change: "+22%",
    up: true,
  },
  {
    name: "James Okoro",
    initials: "JO",
    courses: 4,
    students: 12900,
    revenue: "$98,600",
    revenueNum: 98600,
    change: "+15%",
    up: true,
  },
  {
    name: "Priya Sharma",
    initials: "PS",
    courses: 5,
    students: 10200,
    revenue: "$76,300",
    revenueNum: 76300,
    change: "-4%",
    up: false,
  },
  {
    name: "Michael Torres",
    initials: "MT",
    courses: 3,
    students: 8100,
    revenue: "$54,900",
    revenueNum: 54900,
    change: "+9%",
    up: true,
  },
  {
    name: "Emily Larsson",
    initials: "EL",
    courses: 2,
    students: 5600,
    revenue: "$31,200",
    revenueNum: 31200,
    change: "+31%",
    up: true,
  },
  {
    name: "Liam O'Connor",
    initials: "LO",
    courses: 2,
    students: 5600,
    revenue: "$31,200",
    revenueNum: 31200,
    change: "+31%",
    up: true,
  },
  {
    name: "Hannah Kim",
    initials: "HK",
    courses: 2,
    students: 5600,
    revenue: "$31,200",
    revenueNum: 31200,
    change: "+31%",
    up: true,
  },
];

export const PERIOD_COMPARISON = [
  {
    metric: "Revenue",
    thisMonth: "$842,300",
    lastMonth: "$747,200",
    change: "+12.7%",
    up: true,
    pct: 12.7,
  },
  {
    metric: "New Users",
    thisMonth: "1,240",
    lastMonth: "980",
    change: "+26.5%",
    up: true,
    pct: 26.5,
  },
  {
    metric: "New Enrollments",
    thisMonth: "9,840",
    lastMonth: "9,080",
    change: "+8.4%",
    up: true,
    pct: 8.4,
  },
  {
    metric: "Course Completion",
    thisMonth: "84%",
    lastMonth: "81%",
    change: "+3pp",
    up: true,
    pct: 3,
  },
  {
    metric: "Avg. Order Value",
    thisMonth: "$68",
    lastMonth: "$71",
    change: "-4.2%",
    up: false,
    pct: 4.2,
  },
  {
    metric: "Active Instructors",
    thisMonth: "1,260",
    lastMonth: "1,204",
    change: "+4.6%",
    up: true,
    pct: 4.6,
  },
];
