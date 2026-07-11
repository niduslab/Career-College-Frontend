import { apiGet, apiPost, apiPatch, apiDelete, type ApiEnvelope } from "./api";

/** An entity plus the backend's own success message, so callers can show it verbatim. */
export interface WithMessage<T> {
  data: T;
  message?: string;
}

function withMessage<T>(res: ApiEnvelope<T>): WithMessage<T> {
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
}

export type CourseUpdateInput = Partial<CourseCreateInput>;

function buildCourseFormData(
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

/** Fetch active course categories (public, no auth required). */
export async function getCourseCategories(): Promise<CourseCategory[]> {
  const res = await apiGet<{ results: CourseCategory[] }>(
    "/courses/categories/",
  );
  const data = res.data as unknown as { results?: CourseCategory[] };
  return data?.results ?? [];
}

/** Create a new course. Uses multipart/form-data only when a thumbnail file is present. */
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

// Sections

export interface CourseSection {
  id: number;
  title: string;
  description: string;
  position: number;
  created_at?: string;
  updated_at?: string;
}

export interface SectionCreateInput {
  title: string;
  description?: string;
  position?: number;
}

export async function createSection(
  courseId: number,
  input: SectionCreateInput,
): Promise<WithMessage<CourseSection>> {
  const res = await apiPost<CourseSection>(
    `/courses/${courseId}/sections/create/`,
    input,
  );
  return withMessage(res);
}

export async function listSections(
  courseId: number,
): Promise<CourseSection[]> {
  const res = await apiGet<CourseSection[]>(
    `/courses/${courseId}/sections/`,
  );
  return (res.data ?? []) as CourseSection[];
}

export async function updateSection(
  sectionId: number,
  input: Partial<SectionCreateInput>,
): Promise<WithMessage<CourseSection>> {
  const res = await apiPatch<CourseSection>(
    `/courses/sections/${sectionId}/`,
    input,
  );
  return withMessage(res);
}

export async function deleteSection(
  sectionId: number,
): Promise<string | undefined> {
  return apiDelete(`/courses/sections/${sectionId}/`);
}

// Section content (lectures, quizzes, coding exercises, assignments)

export type SectionItemType = "lecture" | "quiz" | "coding" | "assignment";
export type LectureType = "video" | "article";

export interface VideoAsset {
  id: number;
  status: "uploading" | "processing" | "ready" | "failed";
  duration_seconds: number | null;
}

export interface LectureContent {
  id: number;
  title: string;
  lecture_type: LectureType;
  article_content?: string;
  is_preview?: boolean;
  active_video_asset?: VideoAsset | null;
}

export interface SectionContentItem {
  id: number;
  section: number;
  item_type: SectionItemType;
  object_id: number;
  position: number;
  content: LectureContent | Record<string, unknown>;
}

export interface CreateArticleLectureInput {
  item_type: "lecture";
  title: string;
  lecture_type: "article";
  article_content: string;
  position?: number;
  is_preview?: boolean;
}

export interface CreateVideoLectureInput {
  item_type: "lecture";
  title: string;
  lecture_type: "video";
  video_file: File;
  position?: number;
  is_preview?: boolean;
}

/** Create an article lecture (JSON body). */
export async function createArticleLecture(
  sectionId: number,
  input: Omit<CreateArticleLectureInput, "item_type" | "lecture_type">,
): Promise<WithMessage<SectionContentItem>> {
  const res = await apiPost<SectionContentItem>(
    `/courses/sections/${sectionId}/contents/`,
    { item_type: "lecture", lecture_type: "article", ...input },
  );
  return withMessage(res);
}

/** Create a video lecture (multipart/form-data — required for the file upload). */
export async function createVideoLecture(
  sectionId: number,
  input: Omit<CreateVideoLectureInput, "item_type" | "lecture_type">,
): Promise<WithMessage<SectionContentItem>> {
  const form = new FormData();
  form.append("item_type", "lecture");
  form.append("title", input.title);
  form.append("lecture_type", "video");
  form.append("video_file", input.video_file);
  if (input.position !== undefined)
    form.append("position", String(input.position));
  if (input.is_preview !== undefined)
    form.append("is_preview", String(input.is_preview));
  const res = await apiPost<SectionContentItem>(
    `/courses/sections/${sectionId}/contents/`,
    form,
  );
  return withMessage(res);
}

export async function listSectionContents(
  sectionId: number,
): Promise<SectionContentItem[]> {
  const res = await apiGet<SectionContentItem[]>(
    `/courses/sections/${sectionId}/contents/`,
  );
  return (res.data ?? []) as SectionContentItem[];
}

/** Fetch a lecture by id — used to poll video transcode status. */
export async function getLecture(lectureId: number): Promise<LectureContent> {
  const res = await apiGet<LectureContent>(`/courses/lectures/${lectureId}/`);
  return res.data as LectureContent;
}

export interface LectureUpdateInput {
  title?: string;
  article_content?: string;
  is_preview?: boolean;
}

/** Partial update of an existing lecture (title / article content / preview flag). */
export async function updateLecture(
  lectureId: number,
  input: LectureUpdateInput,
): Promise<WithMessage<LectureContent>> {
  const res = await apiPatch<LectureContent>(
    `/courses/lectures/${lectureId}/`,
    input,
  );
  return withMessage(res);
}

export async function deleteLecture(
  lectureId: number,
): Promise<string | undefined> {
  return apiDelete(`/courses/lectures/${lectureId}/`);
}

/** Move a section-content item (lecture, quiz, coding exercise, assignment) to a new position. */
export async function reorderSectionContent(
  contentId: number,
  position: number,
): Promise<WithMessage<SectionContentItem>> {
  const res = await apiPatch<SectionContentItem>(
    `/courses/contents/${contentId}/reorder/`,
    { position },
  );
  return withMessage(res);
}
