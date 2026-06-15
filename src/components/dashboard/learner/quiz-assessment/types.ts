export type QuestionType = "multiple-choice" | "true-false" | "short-answer";

export interface Option {
  id: string;
  text: string;
}

export interface Question {
  id: number;
  type: QuestionType;
  points: number;
  text: string;
  options: Option[];
  correctId: string;
}

export interface Quiz {
  id: string;
  moduleTitle: string;
  title: string;
  totalQuestions: number;
  timeLimitSeconds: number;
  questions: Question[];
}
