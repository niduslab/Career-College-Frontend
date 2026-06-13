export type LessonStatus = "completed" | "active" | "pending";
export type LessonType = "video" | "quiz";
export type TabKey = "overview" | "resources" | "transcript" | "discussion" | "reviews";

export interface Lesson {
  id: number;
  title: string;
  duration: string;
  status: LessonStatus;
  type: LessonType;
}

export interface Module {
  id: number;
  title: string;
  lessons: Lesson[];
}

export interface AiMessage {
  role: "ai" | "user";
  text: string;
}
