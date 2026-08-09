import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { CatalogCourse, PaginatedResponse } from "@/lib/course-api";
import {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  type WishlistEntry,
  type WishlistParams,
} from "@/lib/wishlist-api";

/** The caller's wishlist, most recently saved first. */
export function useWishlist(params: WishlistParams = {}) {
  return useQuery({
    queryKey: ["wishlist", params],
    queryFn: () => getWishlist(params),
    placeholderData: (previousData) => previousData,
  });
}

export interface ToggleWishlistInput {
  slug: string;
  /** The course's state *before* the click. */
  isWishlisted: boolean;
}

/**
 * Heart toggle, optimistic.
 *
 * The button used to be pure local state, so it felt instant; an unadorned
 * mutation would make it lag a round-trip. `onMutate` patches every cached
 * variant, `onError` restores the snapshot, `onSettled` refetches. Two caches
 * are touched: the wishlist list (row removed) and the catalog (flag flipped
 * on the matching slug).
 */
export function useToggleWishlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ slug, isWishlisted }: ToggleWishlistInput) => {
      if (isWishlisted) {
        await removeFromWishlist(slug);
        return null;
      }
      return addToWishlist(slug);
    },

    onMutate: async ({ slug, isWishlisted }: ToggleWishlistInput) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: ["wishlist"] }),
        queryClient.cancelQueries({ queryKey: ["course-catalog"] }),
      ]);

      const previousWishlist = queryClient.getQueriesData<
        PaginatedResponse<WishlistEntry>
      >({ queryKey: ["wishlist"] });
      const previousCatalog = queryClient.getQueriesData<
        PaginatedResponse<CatalogCourse>
      >({ queryKey: ["course-catalog"] });

      // Removals drop the row immediately. Additions are left for the
      // refetch — inventing a WishlistEntry would mean fabricating an id and
      // a created_at, and the heart already reads its state from the catalog.
      if (isWishlisted) {
        queryClient.setQueriesData<PaginatedResponse<WishlistEntry>>(
          { queryKey: ["wishlist"] },
          (old) => {
            if (!old) return old;
            const results = old.results.filter(
              (entry) => entry.course.slug !== slug,
            );
            if (results.length === old.results.length) return old;
            return { ...old, results, count: Math.max(0, old.count - 1) };
          },
        );
      }

      queryClient.setQueriesData<PaginatedResponse<CatalogCourse>>(
        { queryKey: ["course-catalog"] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            results: old.results.map((course) =>
              course.slug === slug
                ? { ...course, is_wishlisted: !isWishlisted }
                : course,
            ),
          };
        },
      );

      return { previousWishlist, previousCatalog };
    },

    onError: (_error, _input, context) => {
      context?.previousWishlist.forEach(([key, data]) =>
        queryClient.setQueryData(key, data),
      );
      context?.previousCatalog.forEach(([key, data]) =>
        queryClient.setQueryData(key, data),
      );
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      queryClient.invalidateQueries({ queryKey: ["course-catalog"] });
      queryClient.invalidateQueries({ queryKey: ["catalog-course"] });
    },
  });
}
