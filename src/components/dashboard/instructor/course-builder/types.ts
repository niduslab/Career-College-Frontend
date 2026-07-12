export type Step = "Setup" | "Curriculum" | "Review";

export type LessonType = "Lecture" | "Quiz" | "Coding Exercise" | "Assignment";
export type LectureType = "Video" | "Article";

export interface Lesson {
  id: string;
  type: LessonType;
  /** For a Lecture, whether it's a video or article — determines its curriculum-list icon. */
  lectureType?: LectureType;
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
