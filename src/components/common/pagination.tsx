"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
}

function getPageRange(
  current: number,
  total: number,
  siblings: number,
): (number | "...")[] {
  const totalSlots = siblings * 2 + 5; // first + last + current + 2 siblings + 2 ellipses

  if (total <= totalSlots) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const leftSibling = Math.max(current - siblings, 2);
  const rightSibling = Math.min(current + siblings, total - 1);

  const showLeftDots = leftSibling > 2;
  const showRightDots = rightSibling < total - 1;

  const pages: (number | "...")[] = [1];

  if (showLeftDots) pages.push("...");
  for (let i = leftSibling; i <= rightSibling; i++) pages.push(i);
  if (showRightDots) pages.push("...");
  pages.push(total);

  return pages;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = getPageRange(currentPage, totalPages, siblingCount);

  const btnBase =
    "inline-flex h-9 min-w-10 items-center justify-center rounded-[4px] border border-(--gray-200) text-[14px] font-normal text-(--text-title) transition-colors cursor-pointer select-none px-2";
  const activeBtn =
    "border-(--primary-700) bg-(--primary-700) text-(--text-white)";
  const inactiveBtn =
    "border-(--gray-200) bg-(--text-white) text-(--text-title) hover:border-(--primary-300) hover:text-(--primary-700)";
  const arrowBtn =
    "gap-1.5 px-4 border-(--gray-200) bg-(--gray-50) text-(--text-title) hover:border-(--primary-300) hover:text-(--primary-700) disabled:opacity-40 disabled:cursor-not-allowed";

  return (
    <nav
      aria-label="Pagination"
      className="mt-5 flex items-center justify-start gap-1.5"
    >
      {/* Back */}
      <button
        type="button"
        aria-label="Previous page"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className={`${btnBase} ${arrowBtn}`}
      >
        <ChevronLeft size={16} strokeWidth={2} />
        Back
      </button>

      {/* Page numbers */}
      {pages.map((page, idx) =>
        page === "..." ? (
          <span
            key={`dots-${idx}`}
            className="inline-flex h-9 min-w-9 items-center justify-center text-[14px] text-(--gray-400) select-none"
          >
            …
          </span>
        ) : (
          <button
            key={page}
            type="button"
            aria-label={`Page ${page}`}
            aria-current={page === currentPage ? "page" : undefined}
            onClick={() => onPageChange(page as number)}
            className={`${btnBase} ${page === currentPage ? activeBtn : inactiveBtn}`}
          >
            {page}
          </button>
        ),
      )}

      {/* Next */}
      <button
        type="button"
        aria-label="Next page"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className={`${btnBase} ${arrowBtn}`}
      >
        Next
        <ChevronRight size={16} strokeWidth={2} />
      </button>
    </nav>
  );
}
