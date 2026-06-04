export type QuizOption = { id: string; text: string; correct: boolean };

export type QuizQuestion = {
  id: string;
  type: string;
  points: number;
  prompt: string;
  options: QuizOption[];
};

export type StudentAttempt = {
  id: string;
  name: string;
  avatar: string;
  submittedAgo: string;
  score: number;
  total: number;
  passed: boolean;
  expanded: boolean;
  answers: { questionId: string; chosenIdx: number }[];
};

export const QTYPES = [
  "Multiple Choice",
  "True / False",
  "Short Answer",
  "Essay",
] as const;

export const QUIZ_TABS = [
  "Build",
  "Preview",
  "Submission",
] as const;

export type QuizTab = (typeof QUIZ_TABS)[number];

export function defaultOptions(): QuizOption[] {
  const id = () => Math.random().toString(36).slice(2, 9);
  return [
    { id: id(), text: "Option A", correct: true },
    { id: id(), text: "Option B", correct: false },
    { id: id(), text: "Option C", correct: false },
    { id: id(), text: "Option D", correct: false },
  ];
}

export const SEED_ATTEMPTS: StudentAttempt[] = [
  { id: "a1", name: "Amelia Watson",  avatar: "", submittedAgo: "2h ago", score: 3, total: 3, passed: true,  expanded: true,  answers: [] },
  { id: "a2", name: "James Carter",   avatar: "", submittedAgo: "2h ago", score: 2, total: 3, passed: false, expanded: false, answers: [] },
  { id: "a3", name: "Sophia Lee",     avatar: "", submittedAgo: "2h ago", score: 3, total: 3, passed: true,  expanded: false, answers: [] },
  { id: "a4", name: "Marcus Brown",   avatar: "", submittedAgo: "2h ago", score: 2, total: 3, passed: false, expanded: false, answers: [] },
];
