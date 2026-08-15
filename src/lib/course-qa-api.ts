import { apiDelete, apiGet, apiPost } from "./api";
import type { PaginatedResponse } from "./course-api";

/**
 * Course Q&A is scoped per course — every read and write takes a course slug
 * or a question/reply id belonging to one.
 *
 * Two things the backend deliberately does not return: an author avatar, and
 * whether the *viewer* has already upvoted. Upvotes are a counter with no
 * per-user vote row, so the action increments and cannot be undone.
 */

export interface QaRelatedContent {
  id: number;
  item_type: string;
}

export interface QaQuestion {
  id: number;
  title: string;
  body: string;
  author_name: string;
  related_content: QaRelatedContent | null;
  is_pinned: boolean;
  reply_count: number;
  upvote_count: number;
  is_own: boolean;
  created_at: string;
  updated_at: string;
}

export interface QaReply {
  id: number;
  body: string;
  author_name: string;
  is_instructor_reply: boolean;
  is_own: boolean;
  upvote_count: number;
  created_at: string;
  updated_at: string;
}

export interface QaQuestionDetail extends QaQuestion {
  replies: QaReply[];
}

export type QaOrdering =
  | "-created_at"
  | "created_at"
  | "-upvote_count"
  | "-reply_count";

export interface QaListParams {
  content_id?: number;
  ordering?: QaOrdering;
  page?: number;
  page_size?: number;
}

export interface QuestionCreateInput {
  title: string;
  body: string;
  related_content_id?: number;
}

function buildQaQuery(params: QaListParams): string {
  const qs = new URLSearchParams();
  if (params.content_id !== undefined)
    qs.set("content_id", String(params.content_id));
  if (params.ordering) qs.set("ordering", params.ordering);
  if (params.page) qs.set("page", String(params.page));
  if (params.page_size) qs.set("page_size", String(params.page_size));
  const s = qs.toString();
  return s ? `?${s}` : "";
}

/** Questions on one course. Pinned questions always sort first. */
export async function getCourseQuestions(
  courseSlug: string,
  params: QaListParams = {},
): Promise<PaginatedResponse<QaQuestion>> {
  const res = await apiGet<PaginatedResponse<QaQuestion>>(
    `/courses/${courseSlug}/questions/${buildQaQuery(params)}`,
  );
  return res.data ?? { count: 0, next: null, previous: null, results: [] };
}

export async function createQuestion(
  courseSlug: string,
  input: QuestionCreateInput,
): Promise<QaQuestion> {
  const res = await apiPost<QaQuestion>(
    `/courses/${courseSlug}/questions/`,
    input,
  );
  return res.data as QaQuestion;
}

export async function getQuestion(id: number): Promise<QaQuestionDetail> {
  const res = await apiGet<QaQuestionDetail>(`/courses/questions/${id}/`);
  return res.data as QaQuestionDetail;
}

export async function deleteQuestion(id: number): Promise<string | undefined> {
  return apiDelete(`/courses/questions/${id}/`);
}

export async function createReply(
  questionId: number,
  body: string,
): Promise<QaReply> {
  const res = await apiPost<QaReply>(
    `/courses/questions/${questionId}/replies/`,
    { body },
  );
  return res.data as QaReply;
}

export async function deleteReply(id: number): Promise<string | undefined> {
  return apiDelete(`/courses/replies/${id}/`);
}

/** Increment-only — there is no per-user vote row, so this cannot be undone. */
export async function upvoteQuestion(id: number): Promise<void> {
  await apiPost(`/courses/questions/${id}/upvote/`, {});
}

export async function upvoteReply(id: number): Promise<void> {
  await apiPost(`/courses/replies/${id}/upvote/`, {});
}
