"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Clock, X, ChevronLeft, ChevronRight, Trophy } from "lucide-react";
import gsap from "gsap";
import { QUIZ } from "./data";
import type { Question } from "./types";

function fmt(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function QuestionDot({
  index,
  current,
  answered,
  onClick,
}: {
  index: number;
  current: boolean;
  answered: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-7 h-7 sm:w-9 sm:h-9 cursor-pointer rounded-full text-[12px]   font-semibold transition-all shrink-0 border-2 ${
        current
          ? "bg-(--primary-700) text-white border-(--primary-700)"
          : answered
            ? "bg-(--primary-100) text-(--primary-600) border-(--primary-300)"
            : "bg-white text-(--gray-400) border-(--gray-200) hover:border-(--primary-300)"
      }`}
    >
      {index + 1}
    </button>
  );
}

function ResultScreen({
  score,
  total,
  onRetry,
}: {
  score: number;
  total: number;
  answers: Record<number, string>;
  onRetry: () => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const pct = Math.round((score / total) * 100);
  const passed = pct >= 70;

  useEffect(() => {
    gsap.fromTo(
      cardRef.current,
      { opacity: 0, scale: 0.95, y: 24 },
      { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: "power3.out" },
    );
  }, []);

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div
        ref={cardRef}
        className="w-full max-w-lg bg-white rounded-2xl border border-(--gray-200) p-8 text-center"
      >
        <div
          className={`w-20 h-20 rounded-full mx-auto mb-5 flex items-center justify-center ${passed ? "bg-emerald-100" : "bg-red-100"}`}
        >
          <Trophy
            className={`w-9 h-9 ${passed ? "text-emerald-500" : "text-red-400"}`}
          />
        </div>
        <h2 className="text-[20px] lg:text-[24px] font-bold text-(--text-title) mb-1">
          {passed ? "Great job!" : "Keep practising!"}
        </h2>
        <p className="text-[14px] text-(--gray-500) mb-6">
          You scored{" "}
          <span className="font-semibold text-(--text-title)">
            {score} / {total}
          </span>{" "}
          - {pct}%
        </p>

        {/* Score ring */}
        <div className="flex items-center justify-center mb-8">
          <svg className="w-32 h-32 -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="var(--gray-100)"
              strokeWidth="10"
            />
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke={passed ? "#10b981" : "#ef4444"}
              strokeWidth="10"
              strokeDasharray={`${2 * Math.PI * 42}`}
              strokeDashoffset={`${2 * Math.PI * 42 * (1 - pct / 100)}`}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span
              className={`text-[28px] font-bold ${passed ? "text-emerald-500" : "text-red-400"}`}
            >
              {pct}%
            </span>
            <span className="text-[12px] text-(--gray-400)">
              {passed ? "Passed" : "Failed"}
            </span>
          </div>
        </div>

        <div className="flex gap-3 justify-center">
          <button
            onClick={onRetry}
            className="px-6 py-2.5 rounded-lg cursor-pointer border border-(--gray-200) text-[12px] lg:text-[14px] font-medium text-(--gray-500) hover:bg-(--gray-50) transition-colors"
          >
            Try again
          </button>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-2.5 rounded-lg cursor-pointer bg-(--primary-700) text-[12px] lg:text-[14px] font-medium text-white hover:bg-(--primary-900) transition-colors"
          >
            Back to course
          </button>
        </div>
      </div>
    </div>
  );
}

export default function QuizAssessmentPage() {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(QUIZ.timeLimitSeconds);
  const [submitted, setSubmitted] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const question: Question = QUIZ.questions[current];
  const answeredCount = Object.keys(answers).length;
  const progress = ((current + 1) / QUIZ.totalQuestions) * 100;

  // Entrance animation
  useEffect(() => {
    gsap.fromTo(
      containerRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.45, ease: "power3.out" },
    );
  }, []);

  // Animate card on question change
  const animateCard = useCallback((dir: 1 | -1) => {
    if (!cardRef.current) return;
    gsap.fromTo(
      cardRef.current,
      { opacity: 0, x: dir * 40 },
      { opacity: 1, x: 0, duration: 0.3, ease: "power2.out" },
    );
  }, []);

  // Timer — single interval, no timeLeft dependency to avoid cascading setState
  useEffect(() => {
    if (submitted) return;
    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(id);
          setSubmitted(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [submitted]);

  const select = (optId: string) => {
    setAnswers((prev) => ({ ...prev, [question.id]: optId }));
  };

  const goTo = (index: number, dir: 1 | -1 = 1) => {
    setCurrent(index);
    animateCard(dir);
  };

  const prev = () => current > 0 && goTo(current - 1, -1);
  const next = () => {
    if (current < QUIZ.totalQuestions - 1) goTo(current + 1, 1);
    else setSubmitted(true);
  };

  const retry = () => {
    setAnswers({});
    setCurrent(0);
    setTimeLeft(QUIZ.timeLimitSeconds);
    setSubmitted(false);
    animateCard(1);
  };

  const score = QUIZ.questions.filter(
    (q) => answers[q.id] === q.correctId,
  ).length;
  const timerWarning = timeLeft <= 60;

  if (submitted) {
    return (
      <div
        ref={containerRef}
        className="opacity-0 min-h-[calc(100svh-64px)] flex flex-col bg-(--gray-50) -m-4 lg:-m-6"
      >
        <ResultScreen
          score={score}
          total={QUIZ.totalQuestions}
          answers={answers}
          onRetry={retry}
        />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="opacity-0 min-h-[calc(100svh-64px)] flex flex-col bg-(--gray-50) -m-4 lg:-m-6"
    >
      {/* Modal card */}
      <div className="flex-1 flex items-start justify-center p-4 sm:p-6 lg:p-10">
        <div className="w-full max-w-2xl bg-white rounded-2xl border border-(--gray-200) shadow-sm overflow-hidden">
          {/* Header */}
          <div className="flex items-start justify-between px-5 sm:px-6 pt-5 pb-4 border-b border-(--gray-200)">
            <div>
              <p className="text-[12px] font-semibold text-(--gray-400) uppercase tracking-widest mb-0.5">
                {QUIZ.moduleTitle}
              </p>
              <h1 className="text-[16px] lg:text-[20px] font-semibold text-(--text-title)">
                {QUIZ.title}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              {/* Timer */}
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-[14px] tabular-nums ${timerWarning ? "bg-red-50 text-red-500" : "bg-(--gray-50) text-(--gray-600)"}`}
              >
                <Clock
                  className={`w-4 h-4 ${timerWarning ? "animate-pulse" : ""}`}
                />
                {fmt(timeLeft)}
              </div>
              <button
                onClick={() => router.back()}
                className="w-8 h-8 flex items-center cursor-pointer justify-center rounded-lg hover:bg-(--gray-100) transition-colors text-(--gray-400)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Progress */}
          <div className="px-5 sm:px-6 pt-4 pb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[14px] text-(--gray-500)">
                Question {current + 1} of {QUIZ.totalQuestions}
              </span>
              <span className="text-[14px] font-semibold text-(--primary-700)">
                {Math.round(progress)}%
              </span>
            </div>
            {/* Progress bar */}
            <div className="h-2 rounded-full bg-(--gray-100) mb-4">
              <div
                className="h-2 rounded-full bg-(--primary-700) transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            {/* Question dots */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              {QUIZ.questions.map((q, i) => (
                <QuestionDot
                  key={q.id}
                  index={i}
                  current={i === current}
                  answered={!!answers[q.id]}
                  onClick={() => goTo(i, i > current ? 1 : -1)}
                />
              ))}
            </div>
          </div>

          {/* Question card */}
          <div ref={cardRef} className="px-5 sm:px-6 py-4">
            {/* Badge */}
            <div className="mb-4">
              <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-(--primary-700) bg-(--primary-50) px-3 py-1 rounded-full capitalize">
                {question.type === "multiple-choice"
                  ? "Multiple Choice"
                  : question.type === "true-false"
                    ? "True / False"
                    : "Short Answer"}
                &nbsp;·&nbsp;{question.points} point
                {question.points > 1 ? "s" : ""}
              </span>
            </div>

            {/* Question text */}
            <h2 className="text-[16px] lg:text-[18px] font-semibold text-(--text-title) leading-snug mb-5">
              {question.text}
            </h2>

            {/* Options */}
            <div className="space-y-3">
              {question.options.map((opt) => {
                const selected = answers[question.id] === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => select(opt.id)}
                    className={`w-full flex items-center cursor-pointer gap-3 text-left px-4 py-3.5 rounded-xl border-2 text-[14px] transition-all ${
                      selected
                        ? "border-(--primary-600) bg-(--primary-50) text-(--primary-700) font-medium"
                        : "border-(--gray-200) text-(--text-title) hover:border-(--primary-300) hover:bg-(--gray-50)"
                    }`}
                  >
                    {/* Radio circle */}
                    <span
                      className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${selected ? "border-(--primary-600)" : "border-(--gray-300)"}`}
                    >
                      {selected && (
                        <span className="w-2.5 h-2.5 rounded-full bg-(--primary-600)" />
                      )}
                    </span>
                    {opt.text}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="px-4 sm:px-6 py-4 border-t border-(--gray-200)">
            <div className="flex items-center justify-between gap-2">
              <button
                onClick={prev}
                disabled={current === 0}
                className="flex items-center gap-1.5 h-10 cursor-pointer sm:gap-2 px-3 sm:px-4 py-2 rounded-lg border border-(--gray-200) text-[12px]  md:text-[14px] lg:text-[14px] font-medium text-(--gray-600) hover:bg-(--gray-50) transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              <span className="hidden sm:block text-[12px] md:text-[14px] lg:text-[14px] text-(--gray-400) shrink-0">
                {answeredCount} / {QUIZ.totalQuestions} answered
              </span>

              <button
                onClick={next}
                className="flex items-center gap-1.5 h-10 cursor-pointer sm:gap-2 px-3 sm:px-5 py-2 rounded-lg bg-(--primary-600) text-[12px]  md:text-[14px] lg:text-[14px] font-semibold text-white hover:bg-(--primary-700) transition-colors shrink-0"
              >
                {current === QUIZ.totalQuestions - 1
                  ? "Submit"
                  : "Next question"}
                {current < QUIZ.totalQuestions - 1 && (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Mobile only — answered count below buttons */}
            <p className="sm:hidden text-center text-[12px] text-(--gray-400) mt-2.5">
              {answeredCount} / {QUIZ.totalQuestions} answered
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
