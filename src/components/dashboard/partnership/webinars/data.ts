import { Video, Users, PlayCircle, TrendingUp } from "lucide-react";
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
import { Webinar, WebinarTopic, WebinarStatus } from "./types";

export const WEBINARS: Webinar[] = [
  {
    id: "w1",
    title: "Building Scalable APIs with Node.js",
    thumbnail: image1,
    host: "Sarah Kim",
    hostAvatar: avatar1,
    topic: "Engineering",
    date: "Jun 18, 2026",
    time: "3:00 PM",
    duration: "90 min",
    registered: 320,
    attended: 280,
    status: "Recorded",
  },
  {
    id: "w2",
    title: "Intro to Machine Learning for Business",
    thumbnail: image2,
    host: "Dr. Alan Torres",
    hostAvatar: avatar2,
    topic: "Data Science",
    date: "Jul 2, 2026",
    time: "2:00 PM",
    duration: "60 min",
    registered: 415,
    attended: 0,
    status: "Upcoming",
  },
  {
    id: "w3",
    title: "UX Research Methods in Practice",
    thumbnail: image3,
    host: "Mark Patel",
    hostAvatar: avatar6,
    topic: "Design",
    date: "Jun 22, 2026",
    time: "11:00 AM",
    duration: "75 min",
    registered: 210,
    attended: 198,
    status: "Live",
  },
  {
    id: "w4",
    title: "Financial Literacy for Tech Teams",
    thumbnail: image4,
    host: "Lena Müller",
    hostAvatar: avatar4,
    topic: "Business",
    date: "May 30, 2026",
    time: "4:00 PM",
    duration: "60 min",
    registered: 180,
    attended: 155,
    status: "Recorded",
  },
  {
    id: "w5",
    title: "DevOps Best Practices 2026",
    thumbnail: image1,
    host: "Nina Kovac",
    hostAvatar: avatar5,
    topic: "Engineering",
    date: "Jul 10, 2026",
    time: "1:00 PM",
    duration: "90 min",
    registered: 290,
    attended: 0,
    status: "Upcoming",
  },
  {
    id: "w6",
    title: "Growth Marketing Fundamentals",
    thumbnail: image2,
    host: "Carlos Mendez",
    hostAvatar: avatar3,
    topic: "Marketing",
    date: "Jun 5, 2026",
    time: "10:00 AM",
    duration: "45 min",
    registered: 140,
    attended: 0,
    status: "Cancelled",
  },
  {
    id: "w7",
    title: "Clinical Trials Data & Compliance",
    thumbnail: image3,
    host: "Dr. Priya Singh",
    hostAvatar: avatar5,
    topic: "Healthcare",
    date: "Jul 18, 2026",
    time: "9:00 AM",
    duration: "60 min",
    registered: 95,
    attended: 0,
    status: "Upcoming",
  },
  {
    id: "w8",
    title: "Product Roadmap Planning Workshop",
    thumbnail: image4,
    host: "Wei Liang",
    hostAvatar: avatar2,
    topic: "Business",
    date: "Jun 12, 2026",
    time: "3:30 PM",
    duration: "120 min",
    registered: 260,
    attended: 234,
    status: "Recorded",
  },
];

export const STATS = [
  { label: "Total Webinars", value: "12", change: "+3 this month", icon: Video },
  { label: "Total Registered", value: "1.9k", change: "+420 this week", icon: Users },
  { label: "Avg. Attendance", value: "78%", change: "+5% vs last month", icon: PlayCircle },
  { label: "Upcoming", value: "3", change: "Next: Jul 2", icon: TrendingUp },
];

export const TOPIC_BREAKDOWN: { label: WebinarTopic; count: number; color: string }[] = [
  { label: "Engineering", count: 2, color: "bg-(--primary-600)" },
  { label: "Business", count: 2, color: "bg-blue-500" },
  { label: "Data Science", count: 1, color: "bg-purple-500" },
  { label: "Design", count: 1, color: "bg-pink-500" },
  { label: "Marketing", count: 1, color: "bg-orange-400" },
  { label: "Healthcare", count: 1, color: "bg-emerald-500" },
];

export const TIPS = [
  { color: "text-blue-500", text: "Send reminder emails 24h and 1h before the webinar starts." },
  { color: "text-green-500", text: "Record all sessions — replays typically get 2× the live views." },
  { color: "text-orange-500", text: "Keep live Q&A to the last 15 minutes for best engagement." },
];

export const TOPICS: ("All" | WebinarTopic)[] = [
  "All", "Engineering", "Design", "Business", "Data Science", "Marketing", "Healthcare",
];
export const STATUSES: ("All" | WebinarStatus)[] = ["All", "Live", "Upcoming", "Recorded", "Cancelled"];
