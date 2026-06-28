import { StaticImageData } from "next/image";

export type CourseStatus = "Published" | "Draft" | "Under Review" | "Archived";
export type CourseLevel = "Beginner" | "Intermediate" | "Advanced";
export type CourseCategory =
  | "Engineering"
  | "Design"
  | "Business"
  | "Data Science"
  | "Marketing"
  | "Healthcare";

export interface Course {
  id: string;
  title: string;
  thumbnail: StaticImageData;
  instructor: string;
  instructorAvatar: StaticImageData;
  category: CourseCategory;
  level: CourseLevel;
  enrolled: number;
  duration: string;
  rating: number;
  price: string;
  publishedDate: string;
  status: CourseStatus;
}
