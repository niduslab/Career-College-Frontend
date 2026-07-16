import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import {
  getLearnerCurriculum,
  getLearnerLecture,
  saveWatchProgress,
  getLearnerQuiz,
  submitQuizAttempt,
  getLearnerAssignment,
  submitAssignment,
  getAssignmentSubmission,
  retryAssignmentGrading,
  getLearnerCodingExercise,
  runCodingExercise,
  getCodingTaskStatus,
  submitCodingExercise,
  getCodingSubmission,
  retryCodingSubmission,
  type WatchProgressInput,
  type QuizSubmitInput,
  type AssignmentSubmitInput,
  type CodingRunInput,
} from "@/lib/course-api";

/** Sidebar curriculum outline for the course player. */
export function useLearnerCurriculum(courseSlug: string | undefined) {
  return useQuery({
    queryKey: ["learner-curriculum", courseSlug],
    queryFn: () => getLearnerCurriculum(courseSlug as string),
    enabled: !!courseSlug,
  });
}

/** Learner-safe lecture detail (video HLS / article content + progress). */
export function useLearnerLecture(lectureId: number | undefined) {
  return useQuery({
    queryKey: ["learner-lecture", lectureId],
    queryFn: () => getLearnerLecture(lectureId as number),
    enabled: !!lectureId,
  });
}

export function useSaveWatchProgress(courseSlug: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      lectureId,
      input,
    }: {
      lectureId: number;
      input: WatchProgressInput;
    }) => saveWatchProgress(lectureId, input),
    onSuccess: (_res, { lectureId }) => {
      queryClient.invalidateQueries({
        queryKey: ["learner-lecture", lectureId],
      });
      queryClient.invalidateQueries({
        queryKey: ["learner-curriculum", courseSlug],
      });
      queryClient.invalidateQueries({ queryKey: ["my-courses"] });
    },
  });
}

/** Learner-safe quiz detail for the attempt UI. */
export function useLearnerQuiz(quizId: number | undefined) {
  return useQuery({
    queryKey: ["learner-quiz", quizId],
    queryFn: () => getLearnerQuiz(quizId as number),
    enabled: !!quizId,
  });
}

export function useSubmitQuizAttempt(courseSlug: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      quizId,
      input,
    }: {
      quizId: number;
      input: QuizSubmitInput;
    }) => submitQuizAttempt(quizId, input),
    onSuccess: (_res, { quizId }) => {
      queryClient.invalidateQueries({ queryKey: ["learner-quiz", quizId] });
      queryClient.invalidateQueries({
        queryKey: ["learner-curriculum", courseSlug],
      });
      queryClient.invalidateQueries({ queryKey: ["my-courses"] });
    },
  });
}

/** Learner-safe assignment detail for the attempt UI. */
export function useLearnerAssignment(assignmentId: number | undefined) {
  return useQuery({
    queryKey: ["learner-assignment", assignmentId],
    queryFn: () => getLearnerAssignment(assignmentId as number),
    enabled: !!assignmentId,
  });
}

/** Submit an assignment for auto-grading (202 — grading runs async). */
export function useSubmitAssignment(courseSlug: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      assignmentId,
      input,
    }: {
      assignmentId: number;
      input: AssignmentSubmitInput;
    }) => submitAssignment(assignmentId, input),
    onSuccess: (_res, { assignmentId }) => {
      queryClient.invalidateQueries({
        queryKey: ["learner-assignment", assignmentId],
      });
      queryClient.invalidateQueries({
        queryKey: ["learner-curriculum", courseSlug],
      });
    },
  });
}

const TERMINAL_ASSIGNMENT_STATUSES = new Set([
  "passed",
  "failed",
  "grading_failed",
]);

export function useAssignmentSubmission(submissionId: number | undefined) {
  return useQuery({
    queryKey: ["assignment-submission", submissionId],
    queryFn: () => getAssignmentSubmission(submissionId as number),
    enabled: !!submissionId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status && TERMINAL_ASSIGNMENT_STATUSES.has(status)) return false;
      return 2500;
    },
  });
}

/** Re-enqueue grading for a submission stuck in "grading_failed". */
export function useRetryAssignmentGrading() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (submissionId: number) => retryAssignmentGrading(submissionId),
    onSuccess: (_res, submissionId) => {
      queryClient.invalidateQueries({
        queryKey: ["assignment-submission", submissionId],
      });
    },
  });
}

/** Learner-safe coding exercise detail (starter code + visible test cases). */
export function useLearnerCodingExercise(exerciseId: number | undefined) {
  return useQuery({
    queryKey: ["learner-coding-exercise", exerciseId],
    queryFn: () => getLearnerCodingExercise(exerciseId as number),
    enabled: !!exerciseId,
  });
}

export function useRunCodingExercise() {
  return useMutation({
    mutationFn: ({
      exerciseId,
      input,
    }: {
      exerciseId: number;
      input: CodingRunInput;
    }) => runCodingExercise(exerciseId, input),
  });
}

export function useCodingTaskStatus(taskId: string | undefined) {
  const startRef = useRef<number | null>(null);
  useEffect(() => {
    startRef.current = taskId ? Date.now() : null;
  }, [taskId]);

  return useQuery({
    queryKey: ["coding-task", taskId],
    queryFn: () => getCodingTaskStatus(taskId as string),
    enabled: !!taskId,
    refetchInterval: (query) => {
      const state = query.state.data?.state;
      if (state === "SUCCESS" || state === "FAILURE") return false;
      if (startRef.current && Date.now() - startRef.current > 60_000)
        return false;
      return 500;
    },
  });
}

/** Persisted submission against all (visible + hidden) tests. */
export function useSubmitCodingExercise() {
  return useMutation({
    mutationFn: ({
      exerciseId,
      input,
    }: {
      exerciseId: number;
      input: CodingRunInput;
    }) => submitCodingExercise(exerciseId, input),
  });
}

const TERMINAL_CODING_STATUSES = new Set(["passed", "failed", "error"]);

/** Poll a submission every 750ms until it reaches a terminal status. */
export function useCodingSubmission(submissionId: number | undefined) {
  return useQuery({
    queryKey: ["coding-submission", submissionId],
    queryFn: () => getCodingSubmission(submissionId as number),
    enabled: !!submissionId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status && TERMINAL_CODING_STATUSES.has(status)) return false;
      return 750;
    },
  });
}

/** Re-enqueue a submission stuck in "error". */
export function useRetryCodingSubmission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (submissionId: number) => retryCodingSubmission(submissionId),
    onSuccess: (_res, submissionId) => {
      queryClient.invalidateQueries({
        queryKey: ["coding-submission", submissionId],
      });
    },
  });
}
