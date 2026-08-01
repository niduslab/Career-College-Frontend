import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getCourseQuestions,
  postCourseQuestion,
  getQuestionDetail,
  deleteQuestion,
  postQuestionReply,
  deleteQuestionReply,
  toggleQuestionPin,
  upvoteQuestion,
  upvoteReply,
  type DiscussionOrdering,
  type QuestionCreateInput,
} from "@/lib/course-api";

/** Paginated question list for a course — enrolled learner or instructor only. */
export function useCourseQuestions(
  courseSlug: string | undefined,
  params: {
    content_id?: number;
    ordering?: DiscussionOrdering;
    page?: number;
  } = {},
) {
  return useQuery({
    queryKey: ["course-questions", courseSlug, params],
    queryFn: () => getCourseQuestions(courseSlug as string, params),
    enabled: !!courseSlug,
  });
}

/** Question detail with its full reply thread. */
export function useQuestionDetail(questionId: number | undefined) {
  return useQuery({
    queryKey: ["question-detail", questionId],
    queryFn: () => getQuestionDetail(questionId as number),
    enabled: !!questionId,
  });
}

function invalidateQuestionList(
  queryClient: ReturnType<typeof useQueryClient>,
  courseSlug: string | undefined,
) {
  if (courseSlug)
    queryClient.invalidateQueries({
      queryKey: ["course-questions", courseSlug],
    });
}

export function usePostQuestion(courseSlug: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: QuestionCreateInput) =>
      postCourseQuestion(courseSlug as string, input),
    onSuccess: () => invalidateQuestionList(queryClient, courseSlug),
  });
}

export function useDeleteQuestion(courseSlug: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (questionId: number) => deleteQuestion(questionId),
    onSuccess: () => invalidateQuestionList(queryClient, courseSlug),
  });
}

export function usePostReply(courseSlug: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ questionId, body }: { questionId: number; body: string }) =>
      postQuestionReply(questionId, body),
    onSuccess: (_res, { questionId }) => {
      queryClient.invalidateQueries({
        queryKey: ["question-detail", questionId],
      });
      invalidateQuestionList(queryClient, courseSlug);
    },
  });
}

export function useDeleteReply(courseSlug: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ replyId }: { replyId: number; questionId: number }) =>
      deleteQuestionReply(replyId),
    onSuccess: (_res, { questionId }) => {
      queryClient.invalidateQueries({
        queryKey: ["question-detail", questionId],
      });
      invalidateQuestionList(queryClient, courseSlug);
    },
  });
}

/** Instructor-only. Toggles pin state. */
export function useToggleQuestionPin(courseSlug: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (questionId: number) => toggleQuestionPin(questionId),
    onSuccess: (_res, questionId) => {
      queryClient.invalidateQueries({
        queryKey: ["question-detail", questionId],
      });
      invalidateQuestionList(queryClient, courseSlug);
    },
  });
}

/** Counter-only — no dedup, no un-upvote. Rate-limited server-side. */
export function useUpvoteQuestion(courseSlug: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (questionId: number) => upvoteQuestion(questionId),
    onSuccess: (_res, questionId) => {
      queryClient.invalidateQueries({
        queryKey: ["question-detail", questionId],
      });
      invalidateQuestionList(queryClient, courseSlug);
    },
  });
}

export function useUpvoteReply(questionId: number | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (replyId: number) => upvoteReply(replyId),
    onSuccess: () => {
      if (questionId)
        queryClient.invalidateQueries({
          queryKey: ["question-detail", questionId],
        });
    },
  });
}
