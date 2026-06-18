import type Image from "next/image";

export type SessionType = "All" | "Video Call" | "Chat" | "Phone";
export type Specialty = "All" | "AI & ML" | "Data Science" | "Web Dev" | "Design" | "Career";
export type SortOption = "Recommended" | "Top Rated" | "Price: Low–High" | "Price: High–Low" | "Most Booked";
export type BookingStatus = "upcoming" | "completed" | "cancelled";

export interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
}

export interface Consultant {
  id: number;
  name: string;
  avatar: Parameters<typeof Image>[0]["src"];
  title: string;
  specialty: Specialty;
  bio: string;
  rating: number;
  reviewCount: number;
  sessionTypes: SessionType[];
  pricePerHour: number;
  totalSessions: number;
  responseTime: string;
  languages: string[];
  tags: string[];
  availableToday: boolean;
  slots: TimeSlot[];
}

export interface Booking {
  id: number;
  consultantId: number;
  consultantName: string;
  consultantAvatar: Parameters<typeof Image>[0]["src"];
  date: string;
  time: string;
  sessionType: SessionType;
  topic: string;
  status: BookingStatus;
  duration: number;
}
