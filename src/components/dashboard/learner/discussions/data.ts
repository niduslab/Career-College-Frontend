import type { QaOrdering } from "@/lib/course-qa-api";

import type { SortOption } from "./types";

/** Static presentation config. The mock `THREADS` and `CATEGORIES` are gone —
 *  threads come from the per-course Q&A endpoint and the course selector
 *  replaces the category chips. */
export const SORT_OPTIONS: SortOption[] = [
  "Most Recent",
  "Most Popular",
  "Most Replies",
];

/** All three map to real backend ordering values, including `-reply_count`
 *  which the list serializer denormalizes. */
export const SORT_TO_ORDERING: Record<SortOption, QaOrdering> = {
  "Most Recent": "-created_at",
  "Most Popular": "-upvote_count",
  "Most Replies": "-reply_count",
};
