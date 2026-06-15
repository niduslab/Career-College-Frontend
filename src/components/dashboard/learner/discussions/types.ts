import Image from "next/image";

export type ThreadCategory =
  | "All"
  | "AI & ML"
  | "Data"
  | "Design"
  | "Web Dev"
  | "General";
export type SortOption = "Most Recent" | "Most Popular" | "Most Replies";

export interface Reply {
  id: number;
  author: string;
  avatar: Parameters<typeof Image>[0]["src"];
  isInstructor?: boolean;
  body: string;
  likes: number;
  liked: boolean;
  time: string;
}

export interface Thread {
  id: number;
  title: string;
  body: string;
  author: string;
  avatar: Parameters<typeof Image>[0]["src"];
  isInstructor?: boolean;
  category: ThreadCategory;
  tags: string[];
  likes: number;
  liked: boolean;
  replies: Reply[];
  time: string;
  pinned?: boolean;
  course: string;
}
