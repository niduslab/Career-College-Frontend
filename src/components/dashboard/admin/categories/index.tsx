"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, Pencil, Trash2, Loader2, FolderTree } from "lucide-react";
import gsap from "gsap";
import CategoryModal, { type CategoryModalSubmitArgs } from "./category-modal";
import DeactivateModal from "./deactivate-modal";
import CategoriesStatsCards from "./stats-cards";
import { Pagination } from "@/components/common/pagination";
import {
  useCategoryTree,
  useAllCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeactivateCategory,
} from "@/hooks/use-admin-categories";
import { notify } from "@/lib/toast";
import { ApiError } from "@/lib/api";

type ModalState =
  | { mode: "create-top" }
  | { mode: "create-child"; parentId: number }
  | { mode: "edit"; id: number; name: string; parentId: number | null };

const PAGE_SIZE = 10;

export default function AdminCategoriesContent() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, isFetching } = useCategoryTree(page);
  const { data: allCategories } = useAllCategories();
  const create = useCreateCategory();
  const update = useUpdateCategory();
  const deactivate = useDeactivateCategory();
  const [modal, setModal] = useState<ModalState | null>(null);
  const [deactivatingId, setDeactivatingId] = useState<number | null>(null);
  const [deactivateTarget, setDeactivateTarget] = useState<{ id: number; name: string } | null>(
    null,
  );

  const tree = data?.results ?? [];
  const totalCount = data?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!gridRef.current || tree.length === 0) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        gridRef.current!.querySelectorAll(".category-card"),
        { opacity: 0, y: 16, scale: 0.97 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.35,
          stagger: 0.05,
          ease: "power3.out",
        },
      );
    });
    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const busy = create.isPending || update.isPending;

  const handleSubmit = (args: CategoryModalSubmitArgs) => {
    if (!modal) return;
    if (modal.mode === "edit") {
      update.mutate(
        { id: modal.id, name: args.name, parent: args.parent },
        {
          onSuccess: () => {
            notify.success("Category updated.");
            setModal(null);
          },
          onError: (err) =>
            notify.error(err instanceof ApiError ? err.detail : "Failed to update category."),
        },
      );
    } else {
      create.mutate(
        { name: args.name, parent: args.parent },
        {
          onSuccess: () => {
            notify.success("Category created.");
            setModal(null);
          },
          onError: (err) =>
            notify.error(err instanceof ApiError ? err.detail : "Failed to create category."),
        },
      );
    }
  };

  const handleConfirmDeactivate = () => {
    if (!deactivateTarget) return;
    const { id, name } = deactivateTarget;
    setDeactivatingId(id);
    deactivate.mutate(id, {
      onSuccess: () => {
        notify.success(`"${name}" deactivated.`);
        setDeactivateTarget(null);
      },
      onError: (err) =>
        notify.error(err instanceof ApiError ? err.detail : "Failed to deactivate category."),
      onSettled: () => setDeactivatingId(null),
    });
  };

  return (
    <div className="space-y-4">
      <CategoriesStatsCards />

      <div className="bg-white rounded-2xl border border-(--gray-200) px-5 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="min-w-0">
            <p className="text-[14px] lg:text-[16px] font-semibold text-(--text-title)">
              Category Tree
            </p>
            <p className="text-[12px] text-(--gray-500) mt-0.5">
              Two levels only. Deactivating hides a category from the public catalog filter.
            </p>
          </div>
          <button
            onClick={() => setModal({ mode: "create-top" })}
            className="flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-lg text-[13px] font-medium bg-linear-to-br from-(--primary-600) to-(--primary-700) hover:from-(--primary-700) hover:to-(--primary-900) text-white transition-all cursor-pointer shrink-0 whitespace-nowrap shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Category
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-32 rounded-xl border border-(--gray-200) bg-(--gray-50) animate-pulse"
              />
            ))}
          </div>
        ) : isError ? (
          <p className="text-[13px] text-red-500 text-center py-8">Failed to load categories.</p>
        ) : tree.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-(--gray-400)">
            <FolderTree className="w-8 h-8" />
            <p className="text-[13px]">No categories yet.</p>
          </div>
        ) : (
          <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {tree.map((parent) => (
              <div
                key={parent.id}
                className="category-card opacity-0 group rounded-xl border border-(--gray-200) bg-linear-to-b from-(--primary-50)/40 to-white p-4 flex flex-col gap-3 shadow-sm hover:shadow-lg hover:-translate-y-0.5 hover:border-(--primary-200) transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="w-9 h-9 rounded-[6px_4px_6px_6px] flex items-center justify-center shrink-0 bg-linear-to-br from-(--primary-500) to-(--primary-600) text-white shadow-sm">
                      <FolderTree className="w-4.5 h-4.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13.5px] font-semibold text-(--text-title) truncate">
                        {parent.name}
                      </p>
                      {parent.children.length > 0 ? (
                        <span className="inline-block text-[11px] font-semibold text-(--primary-600) bg-(--primary-100) rounded-full px-2 py-0.5 mt-1">
                          {parent.children.length} subcategor
                          {parent.children.length === 1 ? "y" : "ies"}
                        </span>
                      ) : (
                        <span className="inline-block text-[11px] font-medium text-(--gray-500) bg-(--gray-100) rounded-full px-2 py-0.5 mt-1">
                          No subcategories
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setModal({ mode: "create-child", parentId: parent.id })}
                      title="Add subcategory"
                      className="w-7 h-7 rounded-md flex items-center justify-center text-(--gray-500) hover:bg-(--gray-100) hover:text-(--primary-600) transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() =>
                        setModal({ mode: "edit", id: parent.id, name: parent.name, parentId: null })
                      }
                      title="Edit"
                      className="w-7 h-7 rounded-md flex items-center justify-center text-(--gray-500) hover:bg-(--gray-100) hover:text-(--gray-600) transition-colors cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeactivateTarget({ id: parent.id, name: parent.name })}
                      disabled={deactivatingId === parent.id}
                      title="Deactivate"
                      className="w-7 h-7 rounded-md flex items-center justify-center text-(--gray-500) hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {deactivatingId === parent.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {parent.children.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-dashed border-(--gray-200)">
                    {parent.children.map((child) => (
                      <div
                        key={child.id}
                        className="group/child flex items-center gap-1 text-[11px] font-medium text-(--gray-600) bg-(--gray-100) hover:bg-(--gray-200) rounded-full pl-2.5 pr-1 py-1 transition-colors"
                      >
                        <button
                          onClick={() =>
                            setModal({
                              mode: "edit",
                              id: child.id,
                              name: child.name,
                              parentId: parent.id,
                            })
                          }
                          title="Edit subcategory"
                          className="cursor-pointer"
                        >
                          {child.name}
                        </button>
                        <button
                          onClick={() => setDeactivateTarget({ id: child.id, name: child.name })}
                          disabled={deactivatingId === child.id}
                          title="Deactivate subcategory"
                          className="w-4.5 h-4.5 rounded-full flex items-center justify-center text-(--gray-400) hover:bg-red-100 hover:text-red-500 transition-colors cursor-pointer disabled:opacity-50 shrink-0"
                        >
                          {deactivatingId === child.id ? (
                            <Loader2 className="w-2.5 h-2.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-2.5 h-2.5" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {!isLoading && !isError && totalCount > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4 pt-4 border-t border-(--gray-100)">
            <p className="text-[12px] text-(--gray-400)">
              {isFetching && "Refreshing… · "}
              Showing {(currentPage - 1) * PAGE_SIZE + 1}
              {"–"}
              {Math.min(currentPage * PAGE_SIZE, totalCount)} of {totalCount} top-level categories
            </p>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>

      {modal && (
        <CategoryModal
          mode={modal.mode}
          parentOptions={allCategories ?? []}
          initialName={modal.mode === "edit" ? modal.name : ""}
          initialParentId={
            modal.mode === "edit" ? modal.parentId : modal.mode === "create-child" ? modal.parentId : null
          }
          submitting={busy}
          onSubmit={handleSubmit}
          onClose={() => setModal(null)}
        />
      )}

      {deactivateTarget && (
        <DeactivateModal
          categoryName={deactivateTarget.name}
          submitting={deactivatingId === deactivateTarget.id}
          onConfirm={handleConfirmDeactivate}
          onClose={() => setDeactivateTarget(null)}
        />
      )}
    </div>
  );
}
