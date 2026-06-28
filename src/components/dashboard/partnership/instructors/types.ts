import { StaticImageData } from "next/image";

export type InstructorStatus = "Active" | "Pending" | "Inactive";
export type Department =
  | "Engineering"
  | "Design"
  | "Business"
  | "Data Science"
  | "Marketing"
  | "Healthcare";
export type Specialization =
  | "Frontend"
  | "Backend"
  | "UI/UX"
  | "Product"
  | "ML/AI"
  | "DevOps"
  | "Finance"
  | "Growth"
  | "Clinical";

export interface Instructor {
  id: string;
  name: string;
  avatar: StaticImageData;
  email: string;
  department: Department;
  specialization: Specialization;
  courses: number;
  rating: number;
  joinedDate: string;
  status: InstructorStatus;
}
