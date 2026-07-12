import type { QuizAnswer, QuizQuestion as ApiQuizQuestion } from "@/lib/course-api";

/** UI-level question: the real question row plus its loaded answers. */
export interface UiQuizQuestion extends ApiQuizQuestion {
  answers: QuizAnswer[];
  loadingAnswers: boolean;
}
