import { apiDelete, apiPost, apiGet } from "./api";
import type { CatalogCourse, PaginatedResponse } from "./course-api";

/** A wishlist row. Mirrors the enrollment shape — the catalog card is nested
 *  so the same component renders here, in the catalog, and in my-courses. */
export interface WishlistEntry {
  id: number;
  course: CatalogCourse;
  created_at: string;
}

export interface WishlistParams {
  page?: number;
  page_size?: number;
}

/** List the caller's wishlist, most recently saved first. */
export async function getWishlist(
  params: WishlistParams = {},
): Promise<PaginatedResponse<WishlistEntry>> {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  if (params.page_size) qs.set("page_size", String(params.page_size));
  const s = qs.toString();
  const res = await apiGet<PaginatedResponse<WishlistEntry>>(
    `/courses/wishlist/${s ? `?${s}` : ""}`,
  );
  return res.data ?? { count: 0, next: null, previous: null, results: [] };
}

/** Save a course. Idempotent — adding twice is a 200, never an error. */
export async function addToWishlist(
  courseSlug: string,
): Promise<WishlistEntry> {
  const res = await apiPost<WishlistEntry>(
    `/courses/${courseSlug}/wishlist/`,
    {},
  );
  return res.data as WishlistEntry;
}

/** Remove a course. 404 when it was not on the wishlist. */
export async function removeFromWishlist(
  courseSlug: string,
): Promise<string | undefined> {
  return apiDelete(`/courses/${courseSlug}/wishlist/`);
}
