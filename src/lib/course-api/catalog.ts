import { apiGet, apiPost, apiPatch } from "../api";
import {
  type CourseLevel,
  type CourseStatus,
  type DeliveryMode,
  type CourseBrief,
  type PaginatedResponse,
  type WithMessage,
  withMessage,
} from "./shared";

export interface Course {
  id: number;
  title: string;
  slug: string;
  description: string;
  thumbnail: string | null;
  price: string;
  language: string;
  level: CourseLevel;
  duration_minutes: number | null;
  status: CourseStatus;
  is_published: boolean;
  rejection_reason: string;
  published_at: string | null;
  created_by: CourseBrief;
  instructors: CourseBrief[];
  partner_institution: { id: number; institution_name: string } | null;
  category: { id: number; name: string; slug: string } | null;
  learning_objectives: string;
  prerequisites: string;
  audiences: string;
  delivery_mode: DeliveryMode;
  course_outline: string;
  created_at: string;
  updated_at: string;
}

export interface CourseCreateInput {
  title: string;
  description: string;
  category: number;
  price?: string;
  language?: string;
  level?: CourseLevel;
  duration_minutes?: number;
  learning_objectives?: string;
  prerequisites?: string;
  audiences?: string;
  thumbnail?: File | null;
  delivery_mode?: DeliveryMode;
  course_outline?: string;
}

export type CourseUpdateInput = Partial<
  Omit<CourseCreateInput, "delivery_mode">
>;

export function buildCourseFormData(
  data: CourseCreateInput | CourseUpdateInput,
): FormData {
  const form = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined) return;
    if (key === "thumbnail") {
      if (value instanceof File) form.append("thumbnail", value);
      return;
    }
    form.append(key, String(value));
  });
  return form;
}

/** A course as returned by the public catalog (list view). */
export interface CatalogCourse {
  id: number;
  title: string;
  slug: string;
  description: string;
  thumbnail: string | null;
  price: string;
  language: string;
  level: CourseLevel;
  duration_minutes: number | null;
  instructors: CourseBrief[];
  category: { id: number; name: string; slug: string } | null;
  published_at: string | null;
  /** False for anonymous callers and inside nested cards (e.g. Enrollment) —
   *  see `get_wishlisted_course_ids` in the backend for the context mechanism. */
  is_wishlisted: boolean;
}

export interface CatalogCurriculumLecture {
  id: number;
  title: string;
  lecture_type: "video" | "article";
  is_preview: boolean;
  duration_seconds: number | null;
  /** Present only when is_preview && lecture_type === 'video'. */
  preview_video_url?: string;
  preview_renditions?: {
    name: string;
    playlist: string;
    resolution: string;
    bandwidth: number;
  }[];
}

export interface CatalogCurriculumQuiz {
  id: number;
  title: string;
}

export interface CatalogCurriculumCoding {
  id: number;
  title: string;
  language: string;
}

export interface CatalogCurriculumAssignment {
  id: number;
  title: string;
}

export interface CatalogCurriculumItem {
  id: number;
  item_type: "lecture" | "quiz" | "coding" | "assignment";
  position: number;
  object_id: number;
  content:
    | CatalogCurriculumLecture
    | CatalogCurriculumQuiz
    | CatalogCurriculumCoding
    | CatalogCurriculumAssignment
    | null;
}

export interface CatalogCurriculumSection {
  id: number;
  title: string;
  description: string;
  position: number;
  total_items: number;
  contents: CatalogCurriculumItem[];
}

/** Extra fields present only on the single-course catalog detail endpoint.
 *  Notably absent: avg_rating/review_count (fetch getReviewSummary instead)
 *  and is_enrolled (check getMyCourseDetail, which 403s when not enrolled). */
export interface CatalogCourseDetail extends CatalogCourse {
  partner_institution: { id: number; institution_name: string } | null;
  learning_objectives: string;
  prerequisites: string;
  audiences: string;
  course_outline: string;
  total_sections: number;
  total_content_items: number;
  sections: CatalogCurriculumSection[];
}

export type CatalogSort =
  | "relevance"
  | "newest"
  | "popularity"
  | "price_asc"
  | "price_desc"
  | "rating";

export interface CatalogFilterParams {
  category?: string;
  subcategory?: string;
  level?: CourseLevel[];
  language?: string[];
  price_type?: "free" | "paid";
  price_min?: number;
  price_max?: number;
  duration_min?: number;
  duration_max?: number;
  search?: string;
  rating_min?: number;
  min_reviews?: number;
  sort?: CatalogSort;
  page?: number;
  page_size?: number;
}

export function buildCatalogQuery(params: CatalogFilterParams): string {
  const qs = new URLSearchParams();
  const setCsv = (key: string, values?: string[]) => {
    if (values && values.length > 0) qs.set(key, values.join(","));
  };
  if (params.category) qs.set("category", params.category);
  if (params.subcategory) qs.set("subcategory", params.subcategory);
  setCsv("level", params.level);
  setCsv("language", params.language);
  if (params.price_type) qs.set("price_type", params.price_type);
  if (params.price_min !== undefined)
    qs.set("price_min", String(params.price_min));
  if (params.price_max !== undefined)
    qs.set("price_max", String(params.price_max));
  if (params.duration_min !== undefined)
    qs.set("duration_min", String(params.duration_min));
  if (params.duration_max !== undefined)
    qs.set("duration_max", String(params.duration_max));
  if (params.search) qs.set("search", params.search);
  if (params.rating_min !== undefined)
    qs.set("rating_min", String(params.rating_min));
  if (params.min_reviews !== undefined)
    qs.set("min_reviews", String(params.min_reviews));
  if (params.sort) qs.set("sort", params.sort);
  if (params.page) qs.set("page", String(params.page));
  if (params.page_size) qs.set("page_size", String(params.page_size));
  const s = qs.toString();
  return s ? `?${s}` : "";
}

/** Browse the public course catalog (no auth required). */
export async function getCourseCatalog(
  params: CatalogFilterParams = {},
): Promise<PaginatedResponse<CatalogCourse>> {
  const res = await apiGet<PaginatedResponse<CatalogCourse>>(
    `/courses/catalog/${buildCatalogQuery(params)}`,
  );
  return res.data ?? { count: 0, next: null, previous: null, results: [] };
}

/** Fetch a single published course's public catalog detail (no auth required). */
export async function getCatalogCourseDetail(
  slug: string,
): Promise<CatalogCourseDetail> {
  const res = await apiGet<CatalogCourseDetail>(`/courses/catalog/${slug}/`);
  return res.data as CatalogCourseDetail;
}

/** Create a new course. Uses multipart/form-data only when a thumbnail file is present. */
/** List courses where the caller is the owner or an assigned instructor. */
export async function listCourses(
  page = 1,
  pageSize = 8,
): Promise<PaginatedResponse<Course>> {
  const res = await apiGet<PaginatedResponse<Course>>(
    `/courses/?page=${page}&page_size=${pageSize}`,
  );
  return res.data ?? { count: 0, next: null, previous: null, results: [] };
}

export async function createCourse(
  input: CourseCreateInput,
): Promise<WithMessage<Course>> {
  const body = input.thumbnail
    ? buildCourseFormData(input)
    : {
        title: input.title,
        description: input.description,
        category: input.category,
        price: input.price,
        language: input.language,
        level: input.level,
        duration_minutes: input.duration_minutes,
        learning_objectives: input.learning_objectives,
        prerequisites: input.prerequisites,
        audiences: input.audiences,
        delivery_mode: input.delivery_mode,
        course_outline: input.course_outline,
      };
  const res = await apiPost<Course>("/courses/create/", body);
  return withMessage(res);
}

export async function getCourse(courseId: number): Promise<Course> {
  const res = await apiGet<Course>(`/courses/${courseId}/`);
  return res.data as Course;
}

/** Partial update. Uses multipart/form-data only when a thumbnail file is present. */
export async function updateCourse(
  courseId: number,
  input: CourseUpdateInput,
): Promise<WithMessage<Course>> {
  const body = input.thumbnail
    ? buildCourseFormData(input)
    : Object.fromEntries(
        Object.entries(input).filter(([k]) => k !== "thumbnail"),
      );
  const res = await apiPatch<Course>(`/courses/${courseId}/`, body);
  return withMessage(res);
}
