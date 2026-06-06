"use client";

import type { QuizQuestion } from "../quiz-types";

export default function PreviewTab({
  quizTitle,
  questions,
}: {
  quizTitle: string;
  questions: QuizQuestion[];
}) {
  return (
    <div className="flex flex-col">
      <p className="text-[12px] text-(--gray-500) mb-4">
        Student view this is exactly how learners see the quiz.
      </p>
      <div className="bg-(--gray-50) rounded-xl border border-(--gray-200) overflow-hidden">
        {/* Header */}
        <div className="flex flex-col items-center py-5 border-b border-(--gray-200)">
          <p className="text-[11px] text-(--gray-400) mb-1">Student Preview</p>
          <h3 className="text-[18px] font-bold text-(--text-title)">
            {quizTitle || "Untitled Quiz"}
          </h3>
          <p className="text-[12px] text-(--gray-500) mt-0.5">
            {questions.length} question{questions.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Questions */}
        <div className="divide-y divide-(--gray-200)">
          {questions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-(--gray-400)">
              <p className="text-[14px]">No questions to preview yet.</p>
            </div>
          ) : (
            questions.map((q, idx) => (
              <div key={q.id} className="px-5 py-4 bg-white">
                <p className="text-[11px] text-(--gray-400) mb-1">
                  Question {idx + 1}. {q.points}pt
                </p>
                <p className="text-[14px] font-semibold text-(--text-title) mb-3">
                  {q.prompt || "Untitled question"}
                </p>
                <div className="space-y-2">
                  {q.options.map((opt) => (
                    <label
                      key={opt.id}
                      className="flex items-center gap-3 h-10 px-3 border border-(--gray-200) rounded-lg bg-white cursor-pointer hover:bg-(--gray-50) transition-colors"
                    >
                      <input
                        type="radio"
                        name={`preview-${q.id}`}
                        className="accent-(--primary-700) shrink-0 cursor-pointer"
                      />
                      <span className="text-[13px] text-(--text-title)">
                        {opt.text}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Submit */}
        {questions.length > 0 && (
          <div className="px-5 py-4 bg-white border-t border-(--gray-200)">
            <button
              type="button"
              className="w-full h-11 bg-(--primary-700) hover:bg-(--primary-900) text-white text-[14px] font-semibold rounded-lg cursor-pointer transition-colors"
            >
              Submit Answer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
