import { apiGet, apiPost, apiDelete } from "../api";
import {
  type CurriculumItemType,
  type PaginatedResponse,
  type WithMessage,
  withMessage,
} from "./shared";

// Discussion Q&A

export type DiscussionOrdering =
  | "-created_at"
  | "created_at"
  | "-upvote_count"
  | "-reply_count";

export interface RelatedContentBrief {
  id: number;
  item_type: CurriculumItemType;
}

export interface QuestionReply {
  id: number;
  body: string;
  author_name: string;
  is_instructor_reply: boolean;
  is_own: boolean;
  upvote_count: number;
  created_at: string;
  updated_at: string;
}

export interface CourseQuestion {
  id: number;
  title: string;
  body: string;
  author_name: string;
  related_content: RelatedContentBrief | null;
  is_pinned: boolean;
  reply_count: number;
  upvote_count: number;
  is_own: boolean;
  created_at: string;
  updated_at: string;
}

export interface CourseQuestionDetail extends CourseQuestion {
  replies: QuestionReply[];
}

export interface QuestionCreateInput {
  title: string;
  body: string;
  related_content_id?: number;
}

/** Paginated question list for a course — enrolled learner or instructor only. */
export async function getCourseQuestions(
  courseSlug: string,
  params: {
    content_id?: number;
    ordering?: DiscussionOrdering;
    page?: number;
  } = {},
): Promise<PaginatedResponse<CourseQuestion>> {
  const qs = new URLSearchParams();
  if (params.content_id !== undefined)
    qs.set("content_id", String(params.content_id));
  if (params.ordering) qs.set("ordering", params.ordering);
  if (params.page) qs.set("page", String(params.page));
  const s = qs.toString();
  const res = await apiGet<PaginatedResponse<CourseQuestion>>(
    `/courses/${courseSlug}/questions/${s ? `?${s}` : ""}`,
  );
  return res.data ?? { count: 0, next: null, previous: null, results: [] };
}

export async function postCourseQuestion(
  courseSlug: string,
  input: QuestionCreateInput,
): Promise<WithMessage<CourseQuestion>> {
  const res = await apiPost<CourseQuestion>(
    `/courses/${courseSlug}/questions/`,
    input,
  );
  return withMessage(res);
}

/** Question detail with its full reply thread. */
export async function getQuestionDetail(
  questionId: number,
): Promise<CourseQuestionDetail> {
  const res = await apiGet<CourseQuestionDetail>(
    `/courses/questions/${questionId}/`,
  );
  return res.data as CourseQuestionDetail;
}

export async function deleteQuestion(questionId: number): Promise<void> {
  await apiDelete(`/courses/questions/${questionId}/`);
}

export async function postQuestionReply(
  questionId: number,
  body: string,
): Promise<WithMessage<QuestionReply>> {
  const res = await apiPost<QuestionReply>(
    `/courses/questions/${questionId}/replies/`,
    { body },
  );
  return withMessage(res);
}

export async function deleteQuestionReply(replyId: number): Promise<void> {
  await apiDelete(`/courses/replies/${replyId}/`);
}

/** Instructor-only. Toggles pin state. */
export async function toggleQuestionPin(
  questionId: number,
): Promise<WithMessage<{ is_pinned: boolean }>> {
  const res = await apiPost<{ is_pinned: boolean }>(
    `/courses/questions/${questionId}/pin/`,
    {},
  );
  return withMessage(res);
}

/** Counter-only — no dedup, no un-upvote. Rate-limited server-side. */
export async function upvoteQuestion(
  questionId: number,
): Promise<{ upvote_count: number }> {
  const res = await apiPost<{ upvote_count: number }>(
    `/courses/questions/${questionId}/upvote/`,
    {},
  );
  return res.data as { upvote_count: number };
}

export async function upvoteReply(
  replyId: number,
): Promise<{ upvote_count: number }> {
  const res = await apiPost<{ upvote_count: number }>(
    `/courses/replies/${replyId}/upvote/`,
    {},
  );
  return res.data as { upvote_count: number };
}
