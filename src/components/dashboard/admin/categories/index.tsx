"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Loader2, FolderTree } from "lucide-react";
import CategoryModal, { type CategoryModalSubmitArgs } from "./category-modal";
import DeactivateModal from "./deactivate-modal";
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
      <div className="bg-white rounded-2xl border border-(--gray-200) px-5 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[14px] lg:text-[16px] font-semibold text-(--text-title)">
              Category Tree
            </p>
            <p className="text-[12px] text-(--gray-500) mt-0.5">
              Two levels only. Deactivating hides a category from the public catalog filter.
            </p>
          </div>
          <button
            onClick={() => setModal({ mode: "create-top" })}
            className="flex items-center gap-1.5 h-9 px-3.5 rounded-lg text-[13px] font-medium bg-(--primary-600) text-white hover:bg-(--primary-700) transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Category
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-10 text-(--gray-400)">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        ) : isError ? (
          <p className="text-[13px] text-red-500 text-center py-8">Failed to load categories.</p>
        ) : tree.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-(--gray-400)">
            <FolderTree className="w-8 h-8" />
            <p className="text-[13px]">No categories yet.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {tree.map((parent) => (
              <div key={parent.id}>
                <div className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-(--gray-50) transition-colors">
                  <p className="text-[13px] font-semibold text-(--text-title)">{parent.name}</p>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setModal({ mode: "create-child", parentId: parent.id })}
                      title="Add subcategory"
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-(--gray-400) hover:bg-(--gray-100) hover:text-(--primary-600) transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() =>
                        setModal({ mode: "edit", id: parent.id, name: parent.name, parentId: null })
                      }
                      title="Edit"
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-(--gray-400) hover:bg-(--gray-100) hover:text-(--gray-600) transition-colors cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeactivateTarget({ id: parent.id, name: parent.name })}
                      disabled={deactivatingId === parent.id}
                      title="Deactivate"
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-(--gray-400) hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer disabled:opacity-50"
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
                  <div className="pl-6 space-y-0.5">
                    {parent.children.map((child) => (
                      <div
                        key={child.id}
                        className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-(--gray-50) transition-colors"
                      >
                        <p className="text-[13px] text-(--gray-600)">{child.name}</p>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() =>
                              setModal({
                                mode: "edit",
                                id: child.id,
                                name: child.name,
                                parentId: parent.id,
                              })
                            }
                            title="Edit"
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-(--gray-400) hover:bg-(--gray-100) hover:text-(--gray-600) transition-colors cursor-pointer"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeactivateTarget({ id: child.id, name: child.name })}
                            disabled={deactivatingId === child.id}
                            title="Deactivate"
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-(--gray-400) hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer disabled:opacity-50"
                          >
                            {deactivatingId === child.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
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
