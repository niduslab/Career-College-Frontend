import { apiGet, apiPost, apiPatch, apiDelete, type ApiEnvelope } from "./api";
import type { PaginatedResult } from "./admin-console-api";

export interface CategoryLeaf {
  id: number;
  name: string;
  slug: string;
  children: [];
}

export interface CategoryTreeNode {
  id: number;
  name: string;
  slug: string;
  children: CategoryLeaf[];
}

export interface CategoryDetail {
  id: number;
  name: string;
  slug: string;
  parent: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const CATEGORY_PAGE_SIZE = 10;

/** Paginated top-level category list (each with its active children nested). */
export async function listCategoryTree(
  page = 1,
): Promise<PaginatedResult<CategoryTreeNode>> {
  const res = (await apiGet(
    `/courses/categories/?page=${page}&page_size=${CATEGORY_PAGE_SIZE}`,
  )) as ApiEnvelope<PaginatedResult<CategoryTreeNode>>;
  return res.data ?? { count: 0, next: null, previous: null, results: [] };
}

const CATEGORY_FETCH_MAX_PAGES = 20;

export async function listAllCategories(): Promise<CategoryTreeNode[]> {
  const all: CategoryTreeNode[] = [];
  let page = 1;
  for (;;) {
    const result = await listCategoryTree(page);
    all.push(...result.results);
    if (
      !result.next ||
      page >= CATEGORY_FETCH_MAX_PAGES ||
      result.results.length === 0
    )
      break;
    page += 1;
  }
  return all;
}

export interface CreateCategoryArgs {
  name: string;
  slug?: string;
  parent?: number | null;
}

export async function createCategory(
  args: CreateCategoryArgs,
): Promise<CategoryDetail> {
  const res = await apiPost<CategoryDetail>("/courses/categories/", args);
  return res.data as CategoryDetail;
}

export async function updateCategory(
  id: number,
  args: Partial<CreateCategoryArgs> & { is_active?: boolean },
): Promise<CategoryDetail> {
  const res = await apiPatch<CategoryDetail>(
    `/courses/categories/${id}/`,
    args,
  );
  return res.data as CategoryDetail;
}

export async function deactivateCategory(id: number): Promise<void> {
  await apiDelete(`/courses/categories/${id}/`);
}
