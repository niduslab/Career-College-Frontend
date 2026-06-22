import { StaticImageData } from "next/image";

export type CohortStatus = "Active" | "Upcoming" | "Completed" | "Cancelled";
export type CohortMode = "Online" | "Hybrid" | "In-Person";
export type CohortDepartment =
  | "Engineering"
  | "Design"
  | "Business"
  | "Data Science"
  | "Marketing"
  | "Healthcare";

export interface Cohort {
  id: string;
  name: string;
  course: string;
  courseThumbnail: StaticImageData;
  instructor: string;
  instructorAvatar: StaticImageData;
  department: CohortDepartment;
  mode: CohortMode;
  enrolled: number;
  capacity: number;
  startDate: string;
  endDate: string;
  status: CohortStatus;
}
