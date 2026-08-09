import { apiDelete, apiGet, apiPatch, apiPost } from "./api";
import type { PaginatedResponse } from "./course-api";

export type NoteColor =
  | "default"
  | "yellow"
  | "green"
  | "blue"
  | "pink"
  | "purple";

/** A learner's private note. `course` is null for a general note; the anchor
 *  can also survive as null if the course is later deleted. */
export interface LearnerNote {
  id: number;
  title: string;
  body: string;
  tags: string[];
  color: NoteColor;
  is_pinned: boolean;
  timestamp_seconds: number | null;
  course: { id: number; title: string; slug: string } | null;
  lecture: { id: number; title: string; lecture_type: string } | null;
  created_at: string;
  updated_at: string;
}

export type NoteOrdering =
  | "-updated_at"
  | "updated_at"
  | "-created_at"
  | "created_at"
  | "title"
  | "-title";

export interface NoteFilterParams {
  course?: string;
  lecture_id?: number;
  /** Multiple tags AND together — a note must carry all of them. */
  tag?: string[];
  is_pinned?: boolean;
  search?: string;
  ordering?: NoteOrdering;
  page?: number;
  page_size?: number;
}

export interface NoteCreateInput {
  body: string;
  title?: string;
  course_slug?: string;
  lecture_id?: number;
  timestamp_seconds?: number;
  tags?: string[];
  color?: NoteColor;
  is_pinned?: boolean;
}

export type NoteUpdateInput = Partial<NoteCreateInput>;

function buildNotesQuery(params: NoteFilterParams): string {
  const qs = new URLSearchParams();
  if (params.course) qs.set("course", params.course);
  if (params.lecture_id !== undefined)
    qs.set("lecture_id", String(params.lecture_id));
  if (params.tag && params.tag.length > 0) qs.set("tag", params.tag.join(","));
  if (params.is_pinned !== undefined)
    qs.set("is_pinned", params.is_pinned ? "true" : "false");
  if (params.search) qs.set("search", params.search);
  if (params.ordering) qs.set("ordering", params.ordering);
  if (params.page) qs.set("page", String(params.page));
  if (params.page_size) qs.set("page_size", String(params.page_size));
  const s = qs.toString();
  return s ? `?${s}` : "";
}

/** List the caller's notes. Pinned notes always sort first. */
export async function getNotes(
  params: NoteFilterParams = {},
): Promise<PaginatedResponse<LearnerNote>> {
  const res = await apiGet<PaginatedResponse<LearnerNote>>(
    `/courses/notes/${buildNotesQuery(params)}`,
  );
  return res.data ?? { count: 0, next: null, previous: null, results: [] };
}

export async function getNote(id: number): Promise<LearnerNote> {
  const res = await apiGet<LearnerNote>(`/courses/notes/${id}/`);
  return res.data as LearnerNote;
}

export async function createNote(
  input: NoteCreateInput,
): Promise<LearnerNote> {
  const res = await apiPost<LearnerNote>("/courses/notes/", input);
  return res.data as LearnerNote;
}

export async function updateNote(
  id: number,
  input: NoteUpdateInput,
): Promise<LearnerNote> {
  const res = await apiPatch<LearnerNote>(`/courses/notes/${id}/`, input);
  return res.data as LearnerNote;
}

export async function deleteNote(id: number): Promise<string | undefined> {
  return apiDelete(`/courses/notes/${id}/`);
}
