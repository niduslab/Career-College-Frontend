import { apiGet, apiPost, apiPatch, apiDelete, type ApiEnvelope } from "../api";
import {
  type PaginatedResponse,
  type WithMessage,
  withMessage,
} from "./shared";

export type MilestoneStatus =
  | "locked"
  | "available"
  | "in_progress"
  | "completed";

export interface MilestoneCourseBrief {
  id: number;
  title: string;
  slug: string;
  thumbnail: string | null;
}

/** Public milestone shape — no progress (guest/unauthenticated view). */
export interface LearningPathMilestone {
  id: number;
  position: number;
  title: string;
  course: MilestoneCourseBrief;
}

/** Learner-facing milestone shape, with derived status. */
export interface LearningPathMilestoneProgress extends LearningPathMilestone {
  status: MilestoneStatus;
}

export interface LearningPathListItem {
  id: number;
  title: string;
  slug: string;
  description: string;
  career_goal: string;
  skill_tags: string[];
  milestone_count: number;
  created_at: string;
}

export interface LearningPathDetail {
  id: number;
  title: string;
  slug: string;
  description: string;
  career_goal: string;
  skill_tags: string[];
  milestones: LearningPathMilestone[];
  created_at: string;
}

export interface LearningPathProgressDetail {
  id: number;
  title: string;
  slug: string;
  description: string;
  career_goal: string;
  skill_tags: string[];
  milestones: LearningPathMilestoneProgress[];
  progress_percent: number;
  /** Real LearningPathEnrollment lookup — do not infer this from milestone
   *  status. A learner can complete a milestone's course independently,
   *  before ever joining the path, so milestone #1 reading "available" does
   *  not imply they've joined. */
  is_enrolled: boolean;
  created_at: string;
}

export interface MyLearningPath {
  id: number;
  path: LearningPathProgressDetail;
  created_at: string;
}

/** Public paginated list of published learning paths. */
export async function getLearningPaths(
  params: { page?: number; page_size?: number } = {},
): Promise<PaginatedResponse<LearningPathListItem>> {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  if (params.page_size) qs.set("page_size", String(params.page_size));
  const s = qs.toString();
  const res = await apiGet<PaginatedResponse<LearningPathListItem>>(
    `/courses/learning-paths/${s ? `?${s}` : ""}`,
  );
  return res.data ?? { count: 0, next: null, previous: null, results: [] };
}

/** Public path detail, no progress. */
export async function getLearningPathDetail(
  slug: string,
): Promise<LearningPathDetail> {
  const res = await apiGet<LearningPathDetail>(
    `/courses/learning-paths/${slug}/`,
  );
  return res.data as LearningPathDetail;
}

/** Learner-facing detail with derived per-milestone status + overall percent. */
export async function getLearningPathProgress(
  slug: string,
): Promise<LearningPathProgressDetail> {
  const res = await apiGet<LearningPathProgressDetail>(
    `/courses/learning-paths/${slug}/progress/`,
  );
  return res.data as LearningPathProgressDetail;
}

/** Join a path (idempotent — 201 first, 200 on repeat). Returns the backend's
 *  success message (e.g. "Joined learning path." / "You are already on this path."). */
export async function enrollInLearningPath(
  slug: string,
): Promise<string | undefined> {
  const res = await apiPost(`/courses/learning-paths/${slug}/enroll/`, {});
  return typeof res.message === "string" ? res.message : undefined;
}

export async function leaveLearningPath(slug: string): Promise<void> {
  await apiDelete(`/courses/learning-paths/${slug}/enroll/`);
}

/** The caller's enrolled paths, each with derived progress. */
export async function getMyLearningPaths(): Promise<MyLearningPath[]> {
  const res: ApiEnvelope<MyLearningPath[]> = await apiGet<MyLearningPath[]>(
    "/courses/my-learning-paths/",
  );
  return res.data ?? [];
}

// Authoring (instructor / admin)

export type LearningPathAuthoringStatus = "draft" | "published" | "archived";

export interface LearningPathManage {
  id: number;
  title: string;
  slug: string;
  description: string;
  career_goal: string;
  skill_tags: string[];
  status: LearningPathAuthoringStatus;
  milestones: LearningPathMilestone[];
  created_at: string;
  updated_at: string;
}

export interface LearningPathCreateInput {
  title: string;
  description?: string;
  career_goal?: string;
  skill_tags?: string[];
  status?: LearningPathAuthoringStatus;
}

export type LearningPathUpdateInput = Partial<LearningPathCreateInput>;

export async function listOwnedLearningPaths(
  params: { page?: number; page_size?: number } = {},
): Promise<PaginatedResponse<LearningPathManage>> {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  if (params.page_size) qs.set("page_size", String(params.page_size));
  const s = qs.toString();
  const res = await apiGet<PaginatedResponse<LearningPathManage>>(
    `/courses/learning-paths/manage/${s ? `?${s}` : ""}`,
  );
  return res.data ?? { count: 0, next: null, previous: null, results: [] };
}

export async function getLearningPathManageDetail(
  pathId: number,
): Promise<LearningPathManage> {
  const res = await apiGet<LearningPathManage>(
    `/courses/learning-paths/manage/${pathId}/`,
  );
  return res.data as LearningPathManage;
}

export async function createLearningPath(
  input: LearningPathCreateInput,
): Promise<WithMessage<LearningPathManage>> {
  const res = await apiPost<LearningPathManage>(
    "/courses/learning-paths/manage/",
    input,
  );
  return withMessage(res);
}

export async function updateLearningPath(
  pathId: number,
  input: LearningPathUpdateInput,
): Promise<WithMessage<LearningPathManage>> {
  const res = await apiPatch<LearningPathManage>(
    `/courses/learning-paths/manage/${pathId}/`,
    input,
  );
  return withMessage(res);
}

export async function deleteLearningPath(pathId: number): Promise<void> {
  await apiDelete(`/courses/learning-paths/manage/${pathId}/`);
}

export async function addLearningPathMilestone(
  pathId: number,
  input: { course_id: number; title?: string },
): Promise<WithMessage<LearningPathManage>> {
  const res = await apiPost<LearningPathManage>(
    `/courses/learning-paths/manage/${pathId}/milestones/`,
    input,
  );
  return withMessage(res);
}

export async function removeLearningPathMilestone(
  pathId: number,
  milestoneId: number,
): Promise<void> {
  await apiDelete(
    `/courses/learning-paths/manage/${pathId}/milestones/${milestoneId}/`,
  );
}

export async function reorderLearningPathMilestones(
  pathId: number,
  orderedMilestoneIds: number[],
): Promise<WithMessage<LearningPathManage>> {
  const res = await apiPost<LearningPathManage>(
    `/courses/learning-paths/manage/${pathId}/milestones/reorder/`,
    { ordered_milestone_ids: orderedMilestoneIds },
  );
  return withMessage(res);
}
