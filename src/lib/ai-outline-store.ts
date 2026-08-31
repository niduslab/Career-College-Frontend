/**
 * Remembers which course sections an AI outline apply produced, per course.
 *
 * Why this exists: applying a regenerated outline should update the sections the
 * previous apply made rather than stack a second batch on top. That needs
 * provenance, and provenance cannot be queried — `GET .../sections/` exposes
 * `created_by`/`created_at`, but Django stamps `request.user` on AI-applied and
 * hand-made sections alike, so nothing there distinguishes them. Guessing from
 * `created_at` clustering would eventually overwrite a hand-authored section.
 *
 * So the record is kept here instead. Same status as `session.ts`'s login flag:
 * **a UI hint, not a source of truth.** It is per-browser, so another device (or
 * cleared site data) simply has no record — the caller then asks the user
 * instead of assuming. Every access is wrapped: storage throws in private mode
 * and when a browser blocks site data, and a failed read must never break the
 * curriculum builder.
 */

const KEY_PREFIX = "cc_ai_outline_sections:";

function key(courseId: number): string {
  return `${KEY_PREFIX}${courseId}`;
}

/** Section ids the last apply wrote for this course, in outline order. Empty
 *  when there is no record — which is not the same as "no AI sections exist". */
export function readAiSectionIds(courseId: number): number[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(key(courseId));
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is number => Number.isInteger(id));
  } catch {
    return [];
  }
}

export function writeAiSectionIds(courseId: number, ids: number[]): void {
  if (typeof window === "undefined") return;
  try {
    if (ids.length === 0) {
      localStorage.removeItem(key(courseId));
      return;
    }
    localStorage.setItem(key(courseId), JSON.stringify(ids));
  } catch {
    // Storage unavailable or full. The in-memory state still works for this
    // session; the next reload just falls back to asking the user.
  }
}
