export type Step = "Setup" | "Curriculum" | "Pricing" | "Review";

export type LessonType = "Lecture" | "Quiz" | "Coding Exercise" | "Assignment";
export type LectureType = "Video" | "Article";

export interface Lesson {
  id: string;
  type: LessonType;
  title: string;
  videoType: string;
  duration: string;
  description: string;
  isFreePreview: boolean;
}

export interface Module {
  id: string;
  title: string;
  summary: string;
  expanded: boolean;
  lessons: Lesson[];
}
