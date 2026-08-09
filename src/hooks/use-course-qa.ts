import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { PaginatedResponse } from "@/lib/course-api";
import {
  createQuestion,
  createReply,
  deleteQuestion,
  deleteReply,
  getCourseQuestions,
  getQuestion,
  upvoteQuestion,
  upvoteReply,
  type QaListParams,
  type QaQuestion,
  type QuestionCreateInput,
} from "@/lib/course-qa-api";

type QuestionPage = PaginatedResponse<QaQuestion>;

/** Questions on one course. Disabled until a course is selected — the Q&A
 *  board is per-course, so there is nothing to fetch without a slug. */
export function useCourseQuestions(
  courseSlug: string | undefined,
  params: QaListParams = {},
) {
  return useQuery({
    queryKey: ["course-questions", courseSlug, params],
    queryFn: () => getCourseQuestions(courseSlug as string, params),
    enabled: !!courseSlug,
    placeholderData: (previousData) => previousData,
  });
}

/** One question with its replies. */
export function useQuestionDetail(questionId: number | undefined) {
  return useQuery({
    queryKey: ["course-question", questionId],
    queryFn: () => getQuestion(questionId as number),
    enabled: !!questionId,
  });
}

function useQaInvalidator(courseSlug: string | undefined) {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ["course-questions", courseSlug] });
    queryClient.invalidateQueries({ queryKey: ["course-question"] });
  };
}

export function useCreateQuestion(courseSlug: string | undefined) {
  const invalidate = useQaInvalidator(courseSlug);
  return useMutation({
    mutationFn: (input: QuestionCreateInput) =>
      createQuestion(courseSlug as string, input),
    onSuccess: invalidate,
  });
}

export function useDeleteQuestion(courseSlug: string | undefined) {
  const invalidate = useQaInvalidator(courseSlug);
  return useMutation({
    mutationFn: (id: number) => deleteQuestion(id),
    onSuccess: invalidate,
  });
}

export function useCreateReply(courseSlug: string | undefined) {
  const invalidate = useQaInvalidator(courseSlug);
  return useMutation({
    mutationFn: ({ questionId, body }: { questionId: number; body: string }) =>
      createReply(questionId, body),
    onSuccess: invalidate,
  });
}

export function useDeleteReply(courseSlug: string | undefined) {
  const invalidate = useQaInvalidator(courseSlug);
  return useMutation({
    mutationFn: (id: number) => deleteReply(id),
    onSuccess: invalidate,
  });
}

/**
 * Upvote a question, optimistically.
 *
 * Upvotes are a plain counter with no per-user vote row, so the backend never
 * tells us whether *this* viewer already voted — the action can only ever
 * increment. The caller is responsible for disabling the button after a click
 * within the session.
 */
export function useUpvoteQuestion(courseSlug: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => upvoteQuestion(id),
    onMutate: async (id: number) => {
      await queryClient.cancelQueries({
        queryKey: ["course-questions", courseSlug],
      });
      const previous = queryClient.getQueriesData<QuestionPage>({
        queryKey: ["course-questions", courseSlug],
      });
      queryClient.setQueriesData<QuestionPage>(
        { queryKey: ["course-questions", courseSlug] },
        (old) =>
          old
            ? {
                ...old,
                results: old.results.map((question) =>
                  question.id === id
                    ? { ...question, upvote_count: question.upvote_count + 1 }
                    : question,
                ),
              }
            : old,
      );
      return { previous };
    },
    onError: (_error, _id, context) => {
      context?.previous.forEach(([key, data]) =>
        queryClient.setQueryData(key, data),
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["course-questions", courseSlug],
      });
    },
  });
}

export function useUpvoteReply(courseSlug: string | undefined) {
  const invalidate = useQaInvalidator(courseSlug);
  return useMutation({
    mutationFn: (id: number) => upvoteReply(id),
    onSuccess: invalidate,
  });
}
