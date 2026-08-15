/**
 * UI-facing types for the course Q&A board.
 *
 * Thread and Reply shapes now come straight from `@/lib/course-qa-api` — this
 * file only holds what is purely presentational. Two things the backend does
 * not provide, so nothing here models them: an author avatar, and a
 * per-viewer "did I upvote" flag (upvotes are a counter with no vote table).
 * `ThreadCategory` is gone too: Q&A is scoped per course, so the selected
 * course *is* the category.
 */
export type SortOption = "Most Recent" | "Most Popular" | "Most Replies";
