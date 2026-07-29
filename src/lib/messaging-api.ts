import { apiGet, apiPost, type ApiEnvelope } from "./api";
import type { PaginatedResult } from "./notifications-api";

export type ConversationType =
  | "learner_instructor"
  | "co_instructor"
  | "institution_expert";

export type ConversationUserType =
  | "learner"
  | "instructor"
  | "partner_institution";

export interface ConversationParticipant {
  user_id: number;
  full_name: string;
  user_type: ConversationUserType;
  last_read_at: string | null;
}

export interface ConversationLastMessage {
  body: string;
  sender_id: number;
  created_at: string;
}

export interface Conversation {
  id: number;
  conversation_type: ConversationType;
  course_id: number | null;
  course_title: string | null;
  course_slug: string | null;
  participants: ConversationParticipant[];
  unread_count: number;
  last_message: ConversationLastMessage | null;
  updated_at: string;
  created_at: string;
}

export interface Message {
  id: number;
  conversation_id: number;
  sender_id: number;
  sender_name?: string;
  body: string;
  is_own?: boolean;
  created_at: string;
}

export interface ConversationListParams {
  page?: number;
  page_size?: number;
}

function buildQuery(params: ConversationListParams = {}): string {
  const search = new URLSearchParams();
  if (params.page) search.set("page", String(params.page));
  if (params.page_size) search.set("page_size", String(params.page_size));
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export async function fetchConversations(
  params: ConversationListParams = {},
): Promise<PaginatedResult<Conversation>> {
  const res = await apiGet<PaginatedResult<Conversation>>(
    `/messaging/conversations/${buildQuery(params)}`,
  );
  return (
    res.data ?? { count: 0, next: null, previous: null, results: [] }
  );
}

export async function fetchUnreadConversationCount(): Promise<number> {
  const res = await apiGet<{ unread_conversations: number }>(
    "/messaging/conversations/unread-count/",
  );
  return res.data?.unread_conversations ?? 0;
}

export interface CreateLearnerInstructorConversationInput {
  conversation_type?: "learner_instructor";
  course_id: number;
  instructor_id: number;
  body: string;
}

export interface CreateCoInstructorConversationInput {
  conversation_type: "co_instructor";
  course_id: number;
  peer_instructor_id: number;
  body: string;
}

export interface CreateInstitutionExpertConversationInput {
  conversation_type: "institution_expert";
  expert_user_id: number;
  course_id?: number;
  body: string;
}

export type CreateConversationInput =
  | CreateLearnerInstructorConversationInput
  | CreateCoInstructorConversationInput
  | CreateInstitutionExpertConversationInput;

/** Creates the conversation (if needed) + persists the opener message. Returns 201 on creation, 200 if it already existed (idempotent either way). */
export async function createConversation(
  input: CreateConversationInput,
): Promise<Conversation> {
  const res: ApiEnvelope<Conversation> = await apiPost<Conversation>(
    "/messaging/conversations/create/",
    input,
  );
  return res.data as Conversation;
}

export interface ConversationDetailParams {
  page?: number;
  page_size?: number;
}

export interface ConversationDetail {
  conversation: Conversation;
  messages: PaginatedResult<Message>;
}

export async function fetchConversationDetail(
  id: number,
  params: ConversationDetailParams = {},
): Promise<ConversationDetail> {
  const res = await apiGet<ConversationDetail>(
    `/messaging/conversations/${id}/${buildQuery(params)}`,
  );
  return res.data as ConversationDetail;
}

export async function markConversationRead(id: number): Promise<void> {
  await apiPost(`/messaging/conversations/${id}/read/`, {});
}
