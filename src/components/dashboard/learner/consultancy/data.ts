import { Video, MessageSquare, Phone } from "lucide-react";
import type { SessionType, Specialty, SortOption, BookingStatus, Consultant, Booking } from "./types";

import instructor1 from "@/assets/images/instructors/instructor1.webp";
import instructor2 from "@/assets/images/instructors/instructor2.webp";
import instructor3 from "@/assets/images/instructors/instructor3.webp";
import instructor4 from "@/assets/images/instructors/instructor4.webp";
import instructor5 from "@/assets/images/instructors/instructor5.webp";
import instructor6 from "@/assets/images/instructors/instructor6.webp";

export const CONSULTANTS: Consultant[] = [
  {
    id: 1,
    name: "Dr. Lena Park",
    avatar: instructor1,
    title: "Senior AI Research Scientist",
    specialty: "AI & ML",
    bio: "PhD from Stanford, 8+ years building LLM-powered systems at scale. I help learners break into AI research and navigate the ML landscape with confidence.",
    rating: 4.9,
    reviewCount: 214,
    sessionTypes: ["Video Call", "Chat"],
    pricePerHour: 120,
    totalSessions: 512,
    responseTime: "< 1 hour",
    languages: ["English", "Korean"],
    tags: ["LLMs", "PyTorch", "Research", "Career"],
    availableToday: true,
    slots: [
      { id: "s1", time: "9:00 AM", available: true },
      { id: "s2", time: "11:00 AM", available: true },
      { id: "s3", time: "2:00 PM", available: false },
      { id: "s4", time: "4:00 PM", available: true },
    ],
  },
  {
    id: 2,
    name: "Marcus Webb",
    avatar: instructor2,
    title: "Full-Stack Engineering Lead",
    specialty: "Web Dev",
    bio: "10 years building high-traffic products at FAANG companies. Specialise in React, Node.js, system design, and preparing engineers for senior-level interviews.",
    rating: 4.8,
    reviewCount: 187,
    sessionTypes: ["Video Call", "Phone", "Chat"],
    pricePerHour: 95,
    totalSessions: 380,
    responseTime: "< 2 hours",
    languages: ["English"],
    tags: ["React", "Node.js", "System Design", "Interviews"],
    availableToday: true,
    slots: [
      { id: "s1", time: "10:00 AM", available: false },
      { id: "s2", time: "1:00 PM", available: true },
      { id: "s3", time: "3:00 PM", available: true },
      { id: "s4", time: "5:00 PM", available: true },
    ],
  },
  {
    id: 3,
    name: "Dr. Omar Said",
    avatar: instructor3,
    title: "Principal Data Scientist",
    specialty: "Data Science",
    bio: "Former Head of Data Science at a Fortune 500. I guide learners through real-world analytics projects, statistics, and building ML pipelines that actually ship.",
    rating: 4.7,
    reviewCount: 143,
    sessionTypes: ["Video Call", "Chat"],
    pricePerHour: 110,
    totalSessions: 299,
    responseTime: "< 3 hours",
    languages: ["English", "Arabic"],
    tags: ["Python", "Pandas", "Statistics", "MLOps"],
    availableToday: false,
    slots: [
      { id: "s1", time: "8:00 AM", available: true },
      { id: "s2", time: "12:00 PM", available: true },
      { id: "s3", time: "6:00 PM", available: false },
    ],
  },
  {
    id: 4,
    name: "Sara Kim",
    avatar: instructor4,
    title: "UX Lead & Design Systems Architect",
    specialty: "Design",
    bio: "Led design at multiple Series B startups. Expert in Figma, design systems, user research, and crafting product portfolios that land design roles at top companies.",
    rating: 4.9,
    reviewCount: 98,
    sessionTypes: ["Video Call", "Chat"],
    pricePerHour: 85,
    totalSessions: 210,
    responseTime: "< 1 hour",
    languages: ["English", "Korean"],
    tags: ["Figma", "UX Research", "Portfolio", "Design Systems"],
    availableToday: true,
    slots: [
      { id: "s1", time: "9:30 AM", available: true },
      { id: "s2", time: "11:30 AM", available: true },
      { id: "s3", time: "2:30 PM", available: true },
      { id: "s4", time: "4:30 PM", available: false },
    ],
  },
  {
    id: 5,
    name: "James Carter",
    avatar: instructor5,
    title: "Career Coach & Tech Recruiter",
    specialty: "Career",
    bio: "Ex-recruiter at Google and Amazon turned career coach. I've helped 400+ engineers land offers. I review CVs, do mock interviews, and craft job-search strategies.",
    rating: 4.8,
    reviewCount: 322,
    sessionTypes: ["Video Call", "Phone", "Chat"],
    pricePerHour: 75,
    totalSessions: 640,
    responseTime: "< 30 mins",
    languages: ["English"],
    tags: ["CV Review", "Mock Interviews", "Negotiation", "LinkedIn"],
    availableToday: true,
    slots: [
      { id: "s1", time: "8:30 AM", available: true },
      { id: "s2", time: "10:30 AM", available: true },
      { id: "s3", time: "1:30 PM", available: false },
      { id: "s4", time: "3:30 PM", available: true },
      { id: "s5", time: "5:30 PM", available: true },
    ],
  },
  {
    id: 6,
    name: "Amara Okafor",
    avatar: instructor6,
    title: "Cloud & DevOps Architect",
    specialty: "Web Dev",
    bio: "AWS Solutions Architect with 7 years in DevOps. I help teams move to the cloud, build CI/CD pipelines, and prepare engineers for cloud certification exams.",
    rating: 4.6,
    reviewCount: 76,
    sessionTypes: ["Video Call", "Chat"],
    pricePerHour: 100,
    totalSessions: 158,
    responseTime: "< 4 hours",
    languages: ["English", "Yoruba"],
    tags: ["AWS", "Kubernetes", "Docker", "Terraform"],
    availableToday: false,
    slots: [
      { id: "s1", time: "7:00 AM", available: true },
      { id: "s2", time: "3:00 PM", available: true },
      { id: "s3", time: "7:00 PM", available: true },
    ],
  },
];

export const MY_BOOKINGS: Booking[] = [
  {
    id: 1,
    consultantId: 1,
    consultantName: "Dr. Lena Park",
    consultantAvatar: instructor1,
    date: "Jun 18, 2026",
    time: "11:00 AM",
    sessionType: "Video Call",
    topic: "LLM fine-tuning strategies",
    status: "upcoming",
    duration: 60,
  },
  {
    id: 2,
    consultantId: 5,
    consultantName: "James Carter",
    consultantAvatar: instructor5,
    date: "Jun 10, 2026",
    time: "8:30 AM",
    sessionType: "Video Call",
    topic: "Mock interview & resume review",
    status: "completed",
    duration: 60,
  },
];

export const SPECIALTIES: Specialty[] = ["All", "AI & ML", "Data Science", "Web Dev", "Design", "Career"];
export const SESSION_TYPES: SessionType[] = ["All", "Video Call", "Chat", "Phone"];
export const SORT_OPTIONS: SortOption[] = ["Recommended", "Top Rated", "Price: Low–High", "Price: High–Low", "Most Booked"];

export const SESSION_ICON: Record<SessionType, typeof Video> = {
  "All":        Video,
  "Video Call": Video,
  "Chat":       MessageSquare,
  "Phone":      Phone,
};

export const STATUS_STYLE: Record<BookingStatus, string> = {
  upcoming:  "bg-(--primary-50) text-(--primary-600) border border-(--primary-200)",
  completed: "bg-emerald-50 text-emerald-600 border border-emerald-200",
  cancelled: "bg-(--gray-100) text-(--gray-500) border border-(--gray-200)",
};
