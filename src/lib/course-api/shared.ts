import { apiGet, type ApiEnvelope } from "../api";
import { config } from "../config";

export interface WithMessage<T> {
  data: T;
  message?: string;
}

export function withMessage<T>(res: ApiEnvelope<T>): WithMessage<T> {
  return {
    data: res.data as T,
    message: typeof res.message === "string" ? res.message : undefined,
  };
}

export type CourseLevel = "beginner" | "intermediate" | "advanced";
export type CourseStatus =
  | "draft"
  | "under_review"
  | "institution_review"
  | "published"
  | "rejected"
  | "archived";
export type DeliveryMode = "self_paced" | "scheduled";

export interface CourseCategory {
  id: number;
  name: string;
  slug: string;
  children: CourseCategory[];
}

export interface CourseBrief {
  id: number;
  full_name: string;
  email: string;
}

/** Fetch active course categories (public, no auth required). Follows
 *  pagination so every category is returned, not just the first page. */
export async function getCourseCategories(): Promise<CourseCategory[]> {
  const all: CourseCategory[] = [];
  let path: string | null = "/courses/categories/";
  while (path) {
    const res = await apiGet<{
      results: CourseCategory[];
      next: string | null;
    }>(path);
    const data = res.data as unknown as {
      results?: CourseCategory[];
      next?: string | null;
    };
    all.push(...(data?.results ?? []));
    // `next` is an absolute URL from DRF; reduce it to a path relative to the
    // API base so apiGet can re-prepend the base. Null = no more pages.
    const next = data?.next ?? null;
    if (next) {
      const nextUrl = new URL(next);
      const basePath = new URL(config.apiBaseUrl).pathname;
      path = nextUrl.pathname.replace(basePath, "") + nextUrl.search;
    } else {
      path = null;
    }
  }
  return all;
}

// Public catalog

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export function hlsAssetUrl(path: string): string {
  const origin = config.apiBaseUrl.replace(/\/api\/v1\/?$/, "");
  return `${origin}/media/${path}`;
}

export type CodingLanguage = "python" | "javascript" | "cpp" | "java";
export type LectureType = "video" | "article";
export type SectionItemType = "lecture" | "quiz" | "coding" | "assignment";
export type CurriculumItemType = "lecture" | "quiz" | "coding" | "assignment";
