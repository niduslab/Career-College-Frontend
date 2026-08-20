import { apiGet } from "./api";

// Instructor dashboard summary — see backend
// docs/architecture/29-instructor-dashboard-analytics.md. No watch-time
// trend, traffic-source breakdown, or AI insights — none of that is
// derivable from real data (see the doc for why each was dropped).

export interface InstructorRevenue {
  gross: string;
  currency: string;
  paid_orders: number;
  growth_pct: number | null;
}

export interface InstructorStudents {
  total: number;
  active: number;
  growth_pct: number | null;
}

export interface InstructorCourseCounts {
  total: number;
  published: number;
  draft: number;
  by_status: Record<string, number>;
}

export interface InstructorRating {
  avg_rating: number;
  review_count: number;
}

export interface InstructorFunnel {
  enrolled: number;
  started: number;
  completed: number;
}

export interface InstructorTopCourse {
  id: number;
  title: string;
  slug: string;
  enrollments: number;
  avg_rating: number;
  revenue: string;
}

export interface InstructorAnalyticsSummary {
  revenue: InstructorRevenue;
  students: InstructorStudents;
  courses: InstructorCourseCounts;
  rating: InstructorRating;
  funnel: InstructorFunnel;
  top_courses: InstructorTopCourse[];
}

export async function getInstructorAnalyticsSummary(): Promise<InstructorAnalyticsSummary> {
  const res = await apiGet<InstructorAnalyticsSummary>("/analytics/instructor/summary/");
  return res.data as InstructorAnalyticsSummary;
}
