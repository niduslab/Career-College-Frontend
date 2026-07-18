"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, XCircle, Loader2, RotateCcw } from "lucide-react";
import {
  useLearnerAssignment,
  useSubmitAssignment,
  useAssignmentSubmission,
  useRetryAssignmentGrading,
} from "@/hooks/use-learner-consumption";
import { ApiError } from "@/lib/api";
import { notify } from "@/lib/toast";

export default function AssignmentPanel({
  assignmentId,
  courseSlug,
  onCompleted,
  onNextLesson,
  isInstructorPreview,
}: {
  assignmentId: number;
  courseSlug?: string;
  /** Fired when a submission reaches "passed" — the item counts as completed. */
  onCompleted?: () => void;
  onNextLesson?: () => void;
  isInstructorPreview?: boolean;
}) {
  const { data: assignment, isLoading } = useLearnerAssignment(assignmentId);
  const submitMutation = useSubmitAssignment(courseSlug);
  const retryMutation = useRetryAssignmentGrading();
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submissionId, setSubmissionId] = useState<number | undefined>(
    undefined,
  );

  const activeSubmissionId =
    submissionId ?? assignment?.latest_submission?.submission_id;
  const { data: submission } = useAssignmentSubmission(activeSubmissionId);

  // Grading is async — the curriculum's is_completed flips once grading
  const queryClient = useQueryClient();
  const status = submission?.status;
  useEffect(() => {
    // Only "passed" counts as completion (matching the enrollment progress
    // rule) — a failed submission still refreshes the sidebar/rollup.
    if (status === "passed") onCompleted?.();
    if (status === "passed" || status === "failed") {
      queryClient.invalidateQueries({
        queryKey: ["learner-curriculum", courseSlug],
      });
      queryClient.invalidateQueries({ queryKey: ["my-courses"] });
    }
  }, [status, courseSlug, queryClient, onCompleted]);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-(--gray-400) text-[14px] p-6">
        <Loader2 className="w-5 h-5 animate-spin" />
        Loading assignment...
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="p-6 text-[14px] text-rose-500">Assignment not found.</div>
    );
  }

  const isGrading =
    submission?.status === "submitted" || submission?.status === "grading";
  const isGraded =
    submission?.status === "passed" || submission?.status === "failed";
  const isGradingFailed = submission?.status === "grading_failed";

  const handleChange = (questionId: number, text: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: text }));
  };

  const handleSubmit = () => {
    const missing = assignment.questions.some(
      (q) => answers[q.id] === undefined,
    );
    if (missing) {
      notify.error("Please answer every question before submitting.");
      return;
    }
    const payload = {
      answers: assignment.questions.map((q) => ({
        question_id: q.id,
        answer_text: answers[q.id] ?? "",
      })),
    };
    submitMutation.mutate(
      { assignmentId, input: payload },
      {
        onSuccess: (res) => setSubmissionId(res.data.submission_id),
        onError: (err) =>
          notify.error(
            err instanceof ApiError
              ? err.message
              : "Failed to submit assignment.",
          ),
      },
    );
  };

  const handleRetry = () => {
    if (!activeSubmissionId) return;
    retryMutation.mutate(activeSubmissionId, {
      onError: (err) =>
        notify.error(
          err instanceof ApiError ? err.message : "Failed to retry grading.",
        ),
    });
  };

  // Show the submission-in-progress / graded view once one exists.
  if (activeSubmissionId) {
    return (
      <div className="bg-white p-4 sm:p-6 lg:p-8 max-h-[70vh] overflow-y-auto">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-[18px] sm:text-[20px] font-bold text-(--text-title) mb-1">
            {assignment.title}
          </h2>
          <p className="text-[13px] text-(--gray-500) mb-6">
            {assignment.description}
          </p>

          {!submission ? (
            <div className="flex items-center gap-2 text-(--gray-400) text-[14px]">
              <Loader2 className="w-5 h-5 animate-spin" />
              Loading submission...
            </div>
          ) : (
            <>
              {isGrading && (
                <div className="flex items-center gap-2 bg-(--primary-50) border border-(--primary-100) rounded-xl px-4 py-3 mb-6 text-[14px] text-(--primary-700)">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Grading in progress...
                </div>
              )}

              {isGradingFailed && (
                <div className="mb-6 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
                  <p className="text-[14px] font-medium text-rose-700 mb-1">
                    Grading failed
                  </p>
                  {submission.grading_error && (
                    <p className="text-[13px] text-rose-600 mb-3">
                      {submission.grading_error}
                    </p>
                  )}
                  <button
                    onClick={handleRetry}
                    disabled={retryMutation.isPending}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-rose-600 hover:bg-rose-700 text-white text-[13px] font-semibold transition-colors cursor-pointer disabled:opacity-60"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    {retryMutation.isPending ? "Retrying..." : "Retry grading"}
                  </button>
                </div>
              )}

              {isGraded && (
                <div
                  className={`mb-6 flex items-center gap-3 rounded-xl px-4 py-3 border ${
                    submission.status === "passed"
                      ? "bg-emerald-50 border-emerald-200"
                      : "bg-rose-50 border-rose-200"
                  }`}
                >
                  {submission.status === "passed" ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                  ) : (
                    <XCircle className="w-6 h-6 text-rose-600 shrink-0" />
                  )}
                  <div>
                    <p className="text-[14px] font-semibold text-(--text-title)">
                      {submission.status === "passed" ? "Passed" : "Not passed"}
                    </p>
                    <p className="text-[13px] text-(--gray-500)">
                      Score: {submission.total_score}/{submission.max_score}
                    </p>
                  </div>
                  {submission.status === "passed" && onNextLesson && (
                    <button
                      onClick={onNextLesson}
                      className="ml-auto px-3 py-1.5 rounded-md bg-(--primary-600) hover:bg-(--primary-700) text-white text-[13px] font-semibold transition-colors cursor-pointer shrink-0"
                    >
                      Next lesson →
                    </button>
                  )}
                </div>
              )}

              <div className="space-y-6">
                {(submission.answers.length > 0
                  ? submission.answers
                  : assignment.questions.map(
                      (q): (typeof submission.answers)[number] => ({
                        question_id: q.id,
                        question_text: q.question_text,
                        answer_text: answers[q.id] ?? "",
                        score: 0,
                        max_score: q.points,
                        criterion_results: [],
                        feedback: "",
                      }),
                    )
                ).map((a, idx) => (
                  <div key={a.question_id}>
                    <p className="text-[14px] font-semibold text-(--text-title) mb-2">
                      {idx + 1}. {a.question_text}
                    </p>
                    <p className="text-[13px] text-(--gray-600) bg-(--gray-50) rounded-lg p-3 mb-2 whitespace-pre-wrap">
                      {a.answer_text || (
                        <span className="italic text-(--gray-400)">
                          (blank)
                        </span>
                      )}
                    </p>
                    {isGraded && (
                      <div className="text-[13px]">
                        <p className="font-medium text-(--text-title) mb-1">
                          Score: {a.score}/{a.max_score}
                        </p>
                        {a.feedback && (
                          <p className="text-(--gray-500) whitespace-pre-wrap">
                            {a.feedback}
                          </p>
                        )}
                        {a.model_answer && (
                          <div className="mt-2 bg-(--primary-50) border border-(--primary-100) rounded-lg p-3">
                            <p className="text-[12px] font-semibold text-(--primary-700) mb-1">
                              Reference answer
                            </p>
                            <p className="text-(--gray-600)">
                              {a.model_answer}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // Attempt form.
  return (
    <div className="bg-white p-4 sm:p-6 lg:p-8 max-h-[70vh] overflow-y-auto">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-[18px] sm:text-[20px] font-bold text-(--text-title) mb-1">
          {assignment.title}
        </h2>
        <p className="text-[13px] text-(--gray-500) mb-2">
          {assignment.description}
        </p>
        {assignment.instructions && (
          <p className="text-[13px] text-(--gray-500) mb-6 italic">
            {assignment.instructions}
          </p>
        )}

        <div className="space-y-6">
          {assignment.questions.map((q, idx) => (
            <div key={q.id}>
              <p className="text-[14px] font-semibold text-(--text-title) mb-1">
                {idx + 1}. {q.question_text}{" "}
                <span className="text-(--gray-400) font-normal">
                  ({q.points} pts)
                </span>
              </p>
              {q.hint && (
                <p className="text-[12px] text-(--gray-400) mb-2 italic">
                  Hint: {q.hint}
                </p>
              )}
              <textarea
                value={answers[q.id] ?? ""}
                onChange={(e) => handleChange(q.id, e.target.value)}
                rows={4}
                disabled={isInstructorPreview}
                placeholder="Write your answer..."
                className="w-full rounded-lg border border-(--gray-200) p-3 text-[14px] text-(--text-title) placeholder:text-(--gray-400) outline-none focus:border-(--primary-400) transition-colors disabled:bg-(--gray-50) disabled:cursor-not-allowed"
              />
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-(--gray-100)">
          {isInstructorPreview ? (
            <p className="text-[13px] text-(--gray-400) italic">
              Preview only — submitting is available to enrolled learners.
            </p>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitMutation.isPending}
              className="px-4 py-2 rounded-md bg-(--primary-600) hover:bg-(--primary-700) text-white text-[14px] font-semibold transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitMutation.isPending ? "Submitting..." : "Submit assignment"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
