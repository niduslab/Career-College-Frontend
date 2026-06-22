import { BookOpen, Users, Star, TrendingUp } from "lucide-react";
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
import { Course, CourseCategory, CourseLevel, CourseStatus } from "./types";

export const COURSES: Course[] = [
  {
    id: "c1",
    title: "Full-Stack Web Development Bootcamp",
    thumbnail: image1,
    instructor: "Sarah Kim",
    instructorAvatar: avatar1,
    category: "Engineering",
    level: "Intermediate",
    enrolled: 1240,
    duration: "48h",
    rating: 4.9,
    price: "$199",
    publishedDate: "Jan 15, 2026",
    status: "Published",
  },
  {
    id: "c2",
    title: "Machine Learning Fundamentals",
    thumbnail: image2,
    instructor: "Dr. Alan Torres",
    instructorAvatar: avatar2,
    category: "Data Science",
    level: "Advanced",
    enrolled: 870,
    duration: "36h",
    rating: 4.8,
    price: "$249",
    publishedDate: "Feb 10, 2026",
    status: "Published",
  },
  {
    id: "c3",
    title: "UI/UX Design Mastery",
    thumbnail: image3,
    instructor: "Mark Patel",
    instructorAvatar: avatar6,
    category: "Design",
    level: "Beginner",
    enrolled: 640,
    duration: "24h",
    rating: 4.9,
    price: "$149",
    publishedDate: "Mar 5, 2026",
    status: "Published",
  },
  {
    id: "c4",
    title: "Financial Modelling & Analysis",
    thumbnail: image4,
    instructor: "Lena Müller",
    instructorAvatar: avatar4,
    category: "Business",
    level: "Intermediate",
    enrolled: 0,
    duration: "20h",
    rating: 0,
    price: "$179",
    publishedDate: "—",
    status: "Draft",
  },
  {
    id: "c5",
    title: "DevOps & Cloud Infrastructure",
    thumbnail: image1,
    instructor: "Nina Kovac",
    instructorAvatar: avatar5,
    category: "Engineering",
    level: "Advanced",
    enrolled: 420,
    duration: "30h",
    rating: 4.6,
    price: "$219",
    publishedDate: "Mar 20, 2026",
    status: "Published",
  },
  {
    id: "c6",
    title: "Digital Marketing Strategy 2026",
    thumbnail: image2,
    instructor: "Carlos Mendez",
    instructorAvatar: avatar3,
    category: "Marketing",
    level: "Beginner",
    enrolled: 0,
    duration: "16h",
    rating: 0,
    price: "$99",
    publishedDate: "—",
    status: "Under Review",
  },
  {
    id: "c7",
    title: "Clinical Data Management",
    thumbnail: image3,
    instructor: "Dr. Priya Singh",
    instructorAvatar: avatar5,
    category: "Healthcare",
    level: "Intermediate",
    enrolled: 310,
    duration: "22h",
    rating: 4.7,
    price: "$189",
    publishedDate: "Mar 18, 2026",
    status: "Published",
  },
  {
    id: "c8",
    title: "Product Management Essentials",
    thumbnail: image4,
    instructor: "Wei Liang",
    instructorAvatar: avatar2,
    category: "Business",
    level: "Beginner",
    enrolled: 0,
    duration: "18h",
    rating: 0,
    price: "$129",
    publishedDate: "—",
    status: "Draft",
  },
];

export const STATS = [
  { label: "Total Courses", value: "56", change: "+8 this month", icon: BookOpen },
  { label: "Total Enrolled", value: "3.4k", change: "+320 this week", icon: Users },
  { label: "Avg. Rating", value: "4.8", change: "+0.1 vs last month", icon: Star },
  { label: "Revenue", value: "$28.6k", change: "+14.2% growth", icon: TrendingUp },
];

export const TOP_COURSES = COURSES.filter((c) => c.enrolled > 0)
  .sort((a, b) => b.enrolled - a.enrolled)
  .slice(0, 5);

export const TIPS = [
  { color: "text-blue-500", text: "Courses with intro videos see 3× higher enrollment rates." },
  { color: "text-green-500", text: "Break content into modules under 10 minutes for best completion." },
  { color: "text-orange-500", text: "Add quizzes to boost learner engagement by up to 40%." },
];

export const CATEGORIES: ("All" | CourseCategory)[] = [
  "All", "Engineering", "Design", "Business", "Data Science", "Marketing", "Healthcare",
];
export const LEVELS: ("All" | CourseLevel)[] = ["All", "Beginner", "Intermediate", "Advanced"];
export const STATUSES: ("All" | CourseStatus)[] = ["All", "Published", "Draft", "Under Review", "Archived"];
