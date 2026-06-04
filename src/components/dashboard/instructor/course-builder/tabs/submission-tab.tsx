"use client";

import { useState } from "react";
import { Search, ChevronDown, Check } from "lucide-react";
import type { QuizQuestion, StudentAttempt } from "../quiz-types";
import { SEED_ATTEMPTS } from "../quiz-types";

function AvatarCircle({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const colors = [
    "bg-orange-400",
    "bg-blue-400",
    "bg-green-500",
    "bg-purple-500",
    "bg-pink-400",
  ];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div
      className={`w-9 h-9 rounded-full ${color} text-white text-[13px] font-semibold flex items-center justify-center shrink-0`}
    >
      {initials}
    </div>
  );
}

export default function SubmissionTab({
  questions,
  passMark,
}: {
  questions: QuizQuestion[];
  passMark: number;
}) {
  const [search, setSearch] = useState("");
  const [attempts, setAttempts] = useState<StudentAttempt[]>(SEED_ATTEMPTS);

  const toggleExpand = (id: string) =>
    setAttempts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, expanded: !a.expanded } : a)),
    );

  const filtered = attempts.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-4">
      <p className="text-[12px] text-(--gray-500)">
        Student view this is exactly how learners see the quiz.
      </p>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--gray-400)" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search students..."
          className="w-full h-11 pl-9 pr-4 text-[14px] border border-(--gray-200) rounded-lg bg-white text-(--text-title) placeholder:text-(--gray-400) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow"
        />
      </div>

      <p className="text-[13px] font-medium text-(--text-title)">
        {filtered.length} student{filtered.length !== 1 ? "s" : ""} attempts
      </p>

      {/* Attempt list */}
      <div className="space-y-2">
        {filtered.map((attempt) => {
          const pct = Math.round((attempt.score / attempt.total) * 100);
          const passed = pct >= passMark;
          return (
            <div
              key={attempt.id}
              className="border border-(--gray-200) rounded-xl overflow-hidden bg-white"
            >
              <button
                type="button"
                onClick={() => toggleExpand(attempt.id)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-(--gray-50) transition-colors cursor-pointer"
              >
                <AvatarCircle name={attempt.name} />
                <div className="flex-1 text-left">
                  <p className="text-[14px] font-semibold text-(--text-title)">
                    {attempt.name}
                  </p>
                  <p className="text-[12px] text-(--gray-400)">
                    Submitted {attempt.submittedAgo}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-[13px] font-semibold ${passed ? "text-green-600" : "text-orange-500"}`}
                  >
                    {pct}% {passed ? "Passed" : "Failed"}
                  </span>
                  <span className="text-[12px] text-(--gray-400)">
                    {attempt.score}/{attempt.total}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-(--gray-400) transition-transform duration-200 ${attempt.expanded ? "rotate-180" : ""}`}
                  />
                </div>
              </button>

              {attempt.expanded && questions.length > 0 && (
                <div className="border-t border-(--gray-100) px-4 py-3 space-y-4">
                  {questions.map((q, qi) => (
                    <div key={q.id}>
                      <p className="text-[12px] text-(--gray-400) mb-1">
                        {q.prompt || "Untitled question"}{" "}
                        <span className="text-(--gray-300)">
                          Question {qi + 1}. {q.points}pt
                        </span>
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {q.options.map((opt, oi) => {
                          const isCorrect = opt.correct;
                          const isChosen =
                            oi === (attempt.answers[qi]?.chosenIdx ?? 0);
                          return (
                            <div
                              key={opt.id}
                              className={`flex items-center justify-between h-10 px-3 rounded-lg border text-[13px] ${
                                isCorrect
                                  ? "border-green-300 bg-green-50 text-green-700"
                                  : isChosen && !isCorrect
                                    ? "border-red-300 bg-red-50 text-red-600"
                                    : "border-(--gray-200) text-(--text-title)"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                {isChosen ? (
                                  <div className="w-4 h-4 rounded-full bg-(--text-title) flex items-center justify-center shrink-0">
                                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                  </div>
                                ) : (
                                  <div className="w-4 h-4 rounded-full border border-(--gray-300) shrink-0" />
                                )}
                                <span>{opt.text}</span>
                              </div>
                              {isCorrect && (
                                <span className="text-[11px] font-semibold text-green-600 flex items-center gap-1">
                                  <Check className="w-3 h-3" /> Correct Answer
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {attempt.expanded && questions.length === 0 && (
                <div className="border-t border-(--gray-100) px-4 py-4 text-center text-[13px] text-(--gray-400)">
                  No questions added yet.
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
