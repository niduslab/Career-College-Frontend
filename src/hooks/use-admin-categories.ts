import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listCategoryTree,
  listAllCategories,
  createCategory,
  updateCategory,
  deactivateCategory,
  type CreateCategoryArgs,
} from "@/lib/admin-categories-api";

/** Paginated top-level category list for the main tree view. */
export function useCategoryTree(page: number) {
  return useQuery({
    queryKey: ["admin-category-tree", page],
    queryFn: () => listCategoryTree(page),
    placeholderData: (previousData) => previousData,
  });
}

/** Full unpaginated category list — used to populate the parent-category picker. */
export function useAllCategories() {
  return useQuery({
    queryKey: ["admin-all-categories"],
    queryFn: listAllCategories,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (args: CreateCategoryArgs) => createCategory(args),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-category-tree"] });
      queryClient.invalidateQueries({ queryKey: ["admin-all-categories"] });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...args
    }: { id: number } & Partial<CreateCategoryArgs> & { is_active?: boolean }) =>
      updateCategory(id, args),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-category-tree"] });
      queryClient.invalidateQueries({ queryKey: ["admin-all-categories"] });
    },
  });
}

export function useDeactivateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deactivateCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-category-tree"] });
      queryClient.invalidateQueries({ queryKey: ["admin-all-categories"] });
    },
  });
}
