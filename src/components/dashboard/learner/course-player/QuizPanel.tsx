"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import {
  useLearnerQuiz,
  useSubmitQuizAttempt,
} from "@/hooks/use-learner-consumption";
import { ApiError } from "@/lib/api";
import { notify } from "@/lib/toast";
import type { QuizSubmitResult } from "@/lib/course-api";

export default function QuizPanel({
  quizId,
  courseSlug,
  onCompleted,
  onNextLesson,
}: {
  quizId: number;
  courseSlug?: string;
  onCompleted?: () => void;
  onNextLesson?: () => void;
}) {
  const { data: quiz, isLoading } = useLearnerQuiz(quizId);
  const submitMutation = useSubmitQuizAttempt(courseSlug);
  const [selections, setSelections] = useState<Record<number, number | null>>(
    {},
  );
  const [result, setResult] = useState<QuizSubmitResult | null>(null);

  const hasAttempt = !!quiz?.latest_attempt;
  useEffect(() => {
    if (hasAttempt) onCompleted?.();
  }, [hasAttempt, onCompleted]);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-(--gray-400) text-[14px] p-6">
        <Loader2 className="w-5 h-5 animate-spin" />
        Loading quiz...
      </div>
    );
  }

  if (!quiz) {
    return <div className="p-6 text-[14px] text-rose-500">Quiz not found.</div>;
  }

  const handleSelect = (questionId: number, answerId: number) => {
    if (result) return;
    setSelections((prev) => ({ ...prev, [questionId]: answerId }));
  };

  const handleSubmit = () => {
    const answers = quiz.questions.map((q) => ({
      question_id: q.id,
      selected_answer_id: selections[q.id] ?? null,
    }));
    submitMutation.mutate(
      { quizId: quiz.id, input: { answers } },
      {
        onSuccess: (res) => {
          setResult(res.data);
          onCompleted?.();
        },
        onError: (err) =>
          notify.error(
            err instanceof ApiError ? err.message : "Failed to submit quiz.",
          ),
      },
    );
  };

  const handleRetake = () => {
    setResult(null);
    setSelections({});
  };

  return (
    <div className="bg-white p-4 sm:p-6 lg:p-8 max-h-[70vh] overflow-y-auto">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-[18px] sm:text-[20px] font-bold text-(--text-title) mb-1">
          {quiz.title}
        </h2>
        {quiz.description && (
          <p className="text-[13px] text-(--gray-500) mb-6">
            {quiz.description}
          </p>
        )}

        {result && (
          <div className="mb-6 flex items-center gap-3 bg-(--primary-50) border border-(--primary-100) rounded-xl px-4 py-3">
            <span className="text-[24px] font-bold text-(--primary-700)">
              {result.score}/{result.max_score}
            </span>
            <span className="text-[13px] text-(--gray-500)">
              Submitted {new Date(result.submitted_at).toLocaleString()}
            </span>
          </div>
        )}

        <div className="space-y-6">
          {quiz.questions.map((q, idx) => {
            const questionResult = result?.questions.find(
              (r) => r.question_id === q.id,
            );
            return (
              <div key={q.id}>
                <p className="text-[14px] font-semibold text-(--text-title) mb-3">
                  {idx + 1}. {q.question_text}
                </p>
                <div className="space-y-2">
                  {q.answers.map((a) => {
                    const selected = selections[q.id] === a.id;
                    const isCorrectAnswer =
                      questionResult?.correct_answer_id === a.id;
                    const isSelectedWrong =
                      questionResult &&
                      !questionResult.is_correct &&
                      questionResult.selected_answer_id === a.id;
                    const isSelectedCorrect =
                      questionResult?.is_correct &&
                      questionResult.selected_answer_id === a.id;

                    let optionClass =
                      "border-(--gray-200) hover:border-(--primary-300)";
                    if (result) {
                      if (isSelectedCorrect)
                        optionClass = "border-emerald-400 bg-emerald-50";
                      else if (isSelectedWrong)
                        optionClass = "border-rose-400 bg-rose-50";
                      else if (isCorrectAnswer)
                        optionClass = "border-emerald-400 bg-emerald-50";
                    } else if (selected) {
                      optionClass = "border-(--primary-500) bg-(--primary-50)";
                    }

                    return (
                      <button
                        key={a.id}
                        onClick={() => handleSelect(q.id, a.id)}
                        disabled={!!result}
                        className={`w-full flex items-center justify-between gap-2 text-left px-4 py-2.5 rounded-lg border transition-colors ${optionClass} ${
                          result ? "cursor-default" : "cursor-pointer"
                        }`}
                      >
                        <span className="text-[14px] text-(--text-title)">
                          {a.answer_text}
                        </span>
                        {result &&
                          (isSelectedCorrect ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : isSelectedWrong ? (
                            <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                          ) : isCorrectAnswer ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : null)}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 pt-4 border-t border-(--gray-100)">
          {result ? (
            <div className="flex items-center gap-3">
              <button
                onClick={handleRetake}
                className="px-4 py-2 rounded-md bg-(--primary-50) hover:bg-(--primary-100) text-(--primary-600) text-[14px] font-semibold transition-colors cursor-pointer border border-(--primary-100)"
              >
                Retake quiz
              </button>
              {onNextLesson && (
                <button
                  onClick={onNextLesson}
                  className="px-4 py-2 rounded-md bg-(--primary-600) hover:bg-(--primary-700) text-white text-[14px] font-semibold transition-colors cursor-pointer"
                >
                  Next lesson →
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitMutation.isPending}
              className="px-4 py-2 rounded-md bg-(--primary-600) hover:bg-(--primary-700) text-white text-[14px] font-semibold transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitMutation.isPending ? "Submitting..." : "Submit quiz"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
