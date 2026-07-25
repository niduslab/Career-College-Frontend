"use client";

import { useEffect, useRef, useState } from "react";
import { X, Loader2, ChevronDown, Search } from "lucide-react";
import { useLockBodyScroll } from "@/hooks/use-lock-body-scroll";
import type { CategoryTreeNode } from "@/lib/admin-categories-api";

export interface CategoryModalSubmitArgs {
  name: string;
  parent: number | null;
}

interface CategoryModalProps {
  mode: "create-top" | "create-child" | "edit";
  parentOptions: CategoryTreeNode[];
  initialName?: string;
  initialParentId?: number | null;
  submitting: boolean;
  onSubmit: (args: CategoryModalSubmitArgs) => void;
  onClose: () => void;
}

export default function CategoryModal({
  mode,
  parentOptions,
  initialName = "",
  initialParentId = null,
  submitting,
  onSubmit,
  onClose,
}: CategoryModalProps) {
  const [name, setName] = useState(initialName);
  const [parentId, setParentId] = useState<number | null>(initialParentId);
  const [error, setError] = useState("");
  const [parentOpen, setParentOpen] = useState(false);
  const [parentSearch, setParentSearch] = useState("");
  const parentRef = useRef<HTMLDivElement>(null);

  useLockBodyScroll();

  useEffect(() => {
    if (!parentOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (parentRef.current && !parentRef.current.contains(e.target as Node)) {
        setParentOpen(false);
        setParentSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [parentOpen]);

  const selectedParentName = parentId
    ? parentOptions.find((p) => p.id === parentId)?.name ?? "— Top level —"
    : "— Top level —";

  const filteredParentOptions = parentOptions.filter((p) =>
    p.name.toLowerCase().includes(parentSearch.trim().toLowerCase()),
  );

  const title =
    mode === "edit" ? "Edit Category" : mode === "create-child" ? "Add Subcategory" : "Add Category";

  const handleSubmit = () => {
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    onSubmit({ name: name.trim(), parent: mode === "create-child" ? parentId : mode === "edit" ? parentId : null });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-(--gray-100)">
          <h3 className="text-[16px] font-semibold text-(--text-title)">{title}</h3>
          <button
            onClick={onClose}
            disabled={submitting}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-(--gray-100) text-(--gray-400) transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="text-[13px] font-medium text-(--text-title) mb-1.5 block">Name</label>
            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError("");
              }}
              autoFocus
              placeholder="e.g. Data Science"
              className={`w-full h-10 px-3 text-[13px] text-(--text-title) placeholder:text-(--gray-400) border rounded-lg outline-none focus:ring-2 transition-all ${
                error
                  ? "border-red-300 focus:ring-red-200"
                  : "border-(--gray-200) focus:ring-(--primary-200) focus:border-(--primary-300)"
              }`}
            />
            {error && <p className="text-[12px] text-red-500 mt-1">{error}</p>}
          </div>

          {mode !== "create-top" && (
            <div>
              <label className="text-[13px] font-medium text-(--text-title) mb-1.5 block">
                Parent category
              </label>
              <div className="relative" ref={parentRef}>
                <button
                  type="button"
                  onClick={() => setParentOpen((v) => !v)}
                  className="w-full h-10 px-3 flex items-center justify-between text-[13px] text-(--text-title) border border-(--gray-200) rounded-lg outline-none focus:ring-2 focus:ring-(--primary-200) focus:border-(--primary-300) transition-all cursor-pointer hover:bg-(--gray-50)"
                >
                  <span className="truncate">{selectedParentName}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-(--gray-400) shrink-0 transition-transform ${parentOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {parentOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-(--gray-200) rounded-xl shadow-lg z-10 flex flex-col max-h-64">
                    <div className="relative p-2 border-b border-(--gray-100) shrink-0">
                      <Search className="w-3.5 h-3.5 text-(--gray-400) absolute left-4.5 top-1/2 -translate-y-1/2" />
                      <input
                        value={parentSearch}
                        onChange={(e) => setParentSearch(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        autoFocus
                        placeholder="Search category..."
                        className="w-full h-8 pl-7 pr-2 text-[12px] text-(--text-title) placeholder:text-(--gray-400) border border-(--gray-200) rounded-md outline-none focus:ring-2 focus:ring-(--primary-200) focus:border-(--primary-300) transition-all"
                      />
                    </div>
                    <div className="py-1 overflow-y-auto">
                      <button
                        type="button"
                        onClick={() => {
                          setParentId(null);
                          setParentOpen(false);
                          setParentSearch("");
                        }}
                        className={`w-full text-left px-3 py-2 text-[13px] cursor-pointer transition-colors ${
                          parentId === null
                            ? "bg-(--primary-50) text-(--primary-600) font-semibold"
                            : "text-(--gray-600) hover:bg-(--gray-50)"
                        }`}
                      >
                        — Top level —
                      </button>
                      {filteredParentOptions.length === 0 ? (
                        <p className="px-3 py-2 text-[12px] text-(--gray-400)">No matches.</p>
                      ) : (
                        filteredParentOptions.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => {
                              setParentId(p.id);
                              setParentOpen(false);
                              setParentSearch("");
                            }}
                            className={`w-full text-left px-3 py-2 text-[13px] cursor-pointer transition-colors ${
                              p.id === parentId
                                ? "bg-(--primary-50) text-(--primary-600) font-semibold"
                                : "text-(--gray-600) hover:bg-(--gray-50)"
                            }`}
                          >
                            {p.name}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 px-6 pb-6 pt-2">
          <button
            onClick={onClose}
            disabled={submitting}
            className="h-9 px-4 rounded-lg text-[13px] font-medium text-(--gray-600) hover:bg-(--gray-50) transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="h-9 px-4 rounded-lg text-[13px] font-medium bg-(--primary-600) text-white hover:bg-(--primary-700) transition-colors cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
          >
            {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {submitting ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
