import { apiGet } from "./api";

export interface PartnerCourseCounts {
  total: number;
  published: number;
  draft: number;
  status_breakdown: Record<string, number>;
  avg_rating: number;
  total_reviews: number;
}

export interface PartnerEnrollmentGrowth {
  current: number;
  previous: number;
  growth_pct: number | null;
  window_days: number;
}

export interface PartnerEnrollments {
  active: number;
  all_time: number;
  growth: PartnerEnrollmentGrowth;
  active_learners: number;
  completion_rate: number;
  avg_progress: number;
}

export interface PartnerCertificates {
  total: number;
  this_month: number;
}

export interface PartnerWebinars {
  total: number;
  published: number;
  draft: number;
  archived: number;
  upcoming: number;
  live: number;
  completed: number;
  registrations: number;
  attendance_rate: number;
  attendance_tracking_enabled: boolean;
}

export interface PartnerRoster {
  experts_active: number;
  experts_total: number;
}

export interface PartnerRevenue {
  enabled: boolean;
  estimated_gross: number | null;
}

export interface PartnerEngagementScore {
  composite: number;
  components: {
    completion: number;
    active_ratio: number;
    rating: number;
    attendance: number;
  };
}

export interface PartnerAnalyticsSummary {
  courses: PartnerCourseCounts;
  enrollments: PartnerEnrollments;
  certificates: PartnerCertificates;
  webinars: PartnerWebinars;
  roster: PartnerRoster;
  revenue: PartnerRevenue;
  engagement_score: PartnerEngagementScore;
}

export interface PartnerTopCourse {
  id: number;
  title: string;
  slug: string;
  status: string;
  enrollments: number;
  completion_rate: number;
  avg_rating: number;
  review_count: number;
}

export type TrendGranularity = "monthly" | "weekly";

export interface TrendPoint {
  period: string;
  count: number;
}

export interface TrendResponse {
  granularity: TrendGranularity;
  periods: number;
  series: TrendPoint[];
}

export interface PartnerExpertPerformance {
  id: number;
  full_name: string;
  email: string;
  courses_credited: number;
  content_authored: number;
  avg_rating: number;
  enrollments: number;
  completion_rate: number;
  certificates: number;
  webinars_hosted: number;
  last_active_at: string | null;
}

export async function getPartnerAnalyticsSummary(): Promise<PartnerAnalyticsSummary> {
  const res = await apiGet<PartnerAnalyticsSummary>(
    "/analytics/partner/summary/",
  );
  return res.data as PartnerAnalyticsSummary;
}

export async function getPartnerEnrollmentTrend(
  granularity: TrendGranularity = "monthly",
  periods = 12,
): Promise<TrendResponse> {
  const res = await apiGet<TrendResponse>(
    `/analytics/partner/enrollments/trend/?granularity=${granularity}&periods=${periods}`,
  );
  return res.data as TrendResponse;
}

export async function getPartnerTopCourses(
  sort: "enrollments" | "rating" | "completion" = "enrollments",
  limit = 5,
): Promise<PartnerTopCourse[]> {
  const res = await apiGet<PartnerTopCourse[]>(
    `/analytics/partner/top-courses/?sort=${sort}&limit=${limit}`,
  );
  return res.data as PartnerTopCourse[];
}

export async function getPartnerExpertPerformance(): Promise<{
  attribution: string;
  experts: PartnerExpertPerformance[];
}> {
  const res = await apiGet<{
    attribution: string;
    experts: PartnerExpertPerformance[];
  }>("/analytics/partner/experts/performance/");
  return res.data as {
    attribution: string;
    experts: PartnerExpertPerformance[];
  };
}
