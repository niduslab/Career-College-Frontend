"use client";

import { useEffect, useState } from "react";
import { X, Plus, Trash2, Loader2 } from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import type { UiQuizQuestion } from "./quiz-types";
import QuestionCard from "./question-card";
import {
  updateQuiz,
  deleteQuiz,
  createQuizQuestion,
  listQuizQuestions,
  updateQuizQuestion,
  deleteQuizQuestion,
  createQuizAnswer,
  listQuizAnswers,
  updateQuizAnswer,
  deleteQuizAnswer,
} from "@/lib/course-api";
import { ApiError } from "@/lib/api";
import { notify } from "@/lib/toast";

export default function QuizBuilder({
  quizId,
  quizTitle,
  setQuizTitle,
  onDone,
  onDelete,
  onClose,
}: {
  quizId: number;
  quizTitle: string;
  setQuizTitle: (v: string) => void;
  onDone: () => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  const [questions, setQuestions] = useState<UiQuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingTitle, setSavingTitle] = useState(false);
  const [addingQuestion, setAddingQuestion] = useState(false);
  const [deletingQuiz, setDeletingQuiz] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    let active = true;
    listQuizQuestions(quizId)
      .then(async (qs) => {
        if (!active) return;
        const withAnswers: UiQuizQuestion[] = qs.map((q) => ({
          ...q,
          answers: [],
          loadingAnswers: true,
        }));
        setQuestions(withAnswers);
        setLoading(false);
        for (const q of qs) {
          try {
            const answers = await listQuizAnswers(q.id);
            if (!active) return;
            setQuestions((prev) =>
              prev.map((uq) =>
                uq.id === q.id ? { ...uq, answers, loadingAnswers: false } : uq,
              ),
            );
          } catch {
            if (!active) return;
            setQuestions((prev) =>
              prev.map((uq) =>
                uq.id === q.id ? { ...uq, loadingAnswers: false } : uq,
              ),
            );
          }
        }
      })
      .catch((err) => {
        if (!active) return;
        notify.error(
          err instanceof ApiError ? err.message : "Failed to load questions.",
        );
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [quizId]);

  const handleTitleBlur = async () => {
    if (!quizTitle.trim()) return;
    setSavingTitle(true);
    try {
      const { message } = await updateQuiz(quizId, { title: quizTitle.trim() });
      notify.success(message ?? "Quiz updated.");
    } catch (err) {
      notify.error(
        err instanceof ApiError ? err.message : "Failed to update quiz title.",
      );
    } finally {
      setSavingTitle(false);
    }
  };

  const addQuestion = async () => {
    setAddingQuestion(true);
    try {
      const { data: question, message } = await createQuizQuestion(quizId, {
        question_text: "New question",
        position: questions.length + 1,
      });
      setQuestions((prev) => [
        ...prev,
        { ...question, answers: [], loadingAnswers: false },
      ]);
      notify.success(message ?? "Question added.");
    } catch (err) {
      notify.error(
        err instanceof ApiError ? err.message : "Failed to add question.",
      );
    } finally {
      setAddingQuestion(false);
    }
  };

  const updateQuestionText = async (questionId: number, text: string) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? { ...q, question_text: text } : q)),
    );
    try {
      await updateQuizQuestion(questionId, { question_text: text });
    } catch (err) {
      notify.error(
        err instanceof ApiError ? err.message : "Failed to save question.",
      );
    }
  };

  const removeQuestion = async (questionId: number) => {
    try {
      const message = await deleteQuizQuestion(questionId);
      setQuestions((prev) => prev.filter((q) => q.id !== questionId));
      notify.success(message ?? "Question deleted.");
    } catch (err) {
      notify.error(
        err instanceof ApiError ? err.message : "Failed to delete question.",
      );
    }
  };

  const addAnswer = async (questionId: number, text: string) => {
    try {
      const { data: answer, message } = await createQuizAnswer(questionId, {
        answer_text: text,
        is_correct: false,
      });
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === questionId ? { ...q, answers: [...q.answers, answer] } : q,
        ),
      );
      notify.success(message ?? "Answer added.");
    } catch (err) {
      notify.error(
        err instanceof ApiError ? err.message : "Failed to add answer.",
      );
    }
  };

  const updateAnswerText = async (
    questionId: number,
    answerId: number,
    text: string,
  ) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? {
              ...q,
              answers: q.answers.map((a) =>
                a.id === answerId ? { ...a, answer_text: text } : a,
              ),
            }
          : q,
      ),
    );
    try {
      await updateQuizAnswer(answerId, { answer_text: text });
    } catch (err) {
      notify.error(
        err instanceof ApiError ? err.message : "Failed to save answer.",
      );
    }
  };

  const setCorrectAnswer = async (questionId: number, answerId: number) => {
    const question = questions.find((q) => q.id === questionId);
    if (!question) return;
    const previouslyCorrect = question.answers.find((a) => a.is_correct);

    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? {
              ...q,
              answers: q.answers.map((a) => ({
                ...a,
                is_correct: a.id === answerId,
              })),
            }
          : q,
      ),
    );

    try {
      await updateQuizAnswer(answerId, { is_correct: true });
      if (previouslyCorrect && previouslyCorrect.id !== answerId) {
        await updateQuizAnswer(previouslyCorrect.id, { is_correct: false });
      }
    } catch (err) {
      notify.error(
        err instanceof ApiError ? err.message : "Failed to mark correct answer.",
      );
    }
  };

  const removeAnswer = async (questionId: number, answerId: number) => {
    try {
      const message = await deleteQuizAnswer(answerId);
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === questionId
            ? { ...q, answers: q.answers.filter((a) => a.id !== answerId) }
            : q,
        ),
      );
      notify.success(message ?? "Answer deleted.");
    } catch (err) {
      notify.error(
        err instanceof ApiError ? err.message : "Failed to delete answer.",
      );
    }
  };

  const handleDeleteQuiz = async () => {
    setDeletingQuiz(true);
    try {
      const message = await deleteQuiz(quizId);
      notify.success(message ?? "Quiz deleted.");
      onDelete();
    } catch (err) {
      notify.error(
        err instanceof ApiError ? err.message : "Failed to delete quiz.",
      );
    } finally {
      setDeletingQuiz(false);
    }
  };

  const handleQuestionDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = questions.findIndex((q) => q.id === active.id);
    const newIdx = questions.findIndex((q) => q.id === over.id);
    if (oldIdx === -1 || newIdx === -1) return;
    setQuestions((prev) => arrayMove(prev, oldIdx, newIdx));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-(--gray-100)">
          <h3 className="text-[16px] lg:text-[20px] font-semibold text-(--text-title)">
            Quiz Builder
          </h3>
          <button
            onClick={onClose}
            className="text-(--gray-500) hover:text-(--gray-600) cursor-pointer transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-6 py-5 pb-6 space-y-5 flex-1">
          <div className="space-y-1.5">
            <label className="text-[14px] font-normal text-(--text-title)">
              Quiz Title
            </label>
            <div className="relative">
              <input
                type="text"
                value={quizTitle}
                onChange={(e) => setQuizTitle(e.target.value)}
                onBlur={handleTitleBlur}
                placeholder="Enter quiz title"
                className="w-full h-12 px-3 text-[14px] mt-1 border border-(--gray-200) rounded-lg bg-white text-(--text-title) placeholder:text-(--gray-400) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow"
              />
              {savingTitle && (
                <Loader2 className="w-4 h-4 animate-spin absolute right-3 top-1/2 -translate-y-1/2 text-(--gray-400)" />
              )}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-10 text-(--gray-500)">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Loading questions…
            </div>
          ) : questions.length === 0 ? (
            <div className="w-full rounded-xl border border-dashed border-(--gray-200) bg-(--gray-100) flex flex-col items-center justify-center gap-3 py-10">
              <div className="text-center">
                <p className="text-[16px] font-medium text-(--text-title)">
                  No questions yet
                </p>
                <p className="text-[12px] text-(--text-paragraph) font-normal mt-1">
                  Add your first question, then add answer options below it.
                </p>
              </div>
              <button
                onClick={addQuestion}
                disabled={addingQuestion}
                className="flex items-center gap-2 px-5 h-10 bg-(--primary-700) hover:bg-(--primary-900) text-white text-[14px] font-semibold rounded-md cursor-pointer transition-colors disabled:opacity-60"
              >
                {addingQuestion ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                Add First Question
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleQuestionDragEnd}
              >
                <SortableContext
                  items={questions.map((q) => q.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {questions.map((q, idx) => (
                    <QuestionCard
                      key={q.id}
                      question={q}
                      index={idx}
                      onUpdateText={(text) => updateQuestionText(q.id, text)}
                      onDeleteQuestion={() => removeQuestion(q.id)}
                      onAddAnswer={(text) => addAnswer(q.id, text)}
                      onUpdateAnswerText={(answerId, text) =>
                        updateAnswerText(q.id, answerId, text)
                      }
                      onSetCorrectAnswer={(answerId) =>
                        setCorrectAnswer(q.id, answerId)
                      }
                      onDeleteAnswer={(answerId) => removeAnswer(q.id, answerId)}
                    />
                  ))}
                </SortableContext>
              </DndContext>
              <button
                onClick={addQuestion}
                disabled={addingQuestion}
                className="flex items-center gap-2 px-5 h-10 bg-(--primary-700) hover:bg-(--primary-900) text-white text-[14px] font-semibold rounded-md cursor-pointer transition-colors disabled:opacity-60"
              >
                {addingQuestion ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                Add New Question
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-6 py-4 border-t border-(--gray-200) bg-(--gray-100) rounded-b-2xl">
          <button
            onClick={handleDeleteQuiz}
            disabled={deletingQuiz}
            className="flex items-center gap-2 text-[14px] font-medium text-red-500 hover:text-red-600 cursor-pointer transition-colors self-start sm:self-auto order-last sm:order-first disabled:opacity-60"
          >
            {deletingQuiz ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            {deletingQuiz ? "Deleting…" : "Delete Quiz"}
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onDone}
              className="flex-1 sm:flex-none px-5 h-10 text-[14px] font-semibold bg-(--primary-700) hover:bg-(--primary-900) text-white rounded-md cursor-pointer transition-colors whitespace-nowrap"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
