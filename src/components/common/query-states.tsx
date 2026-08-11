"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Loading / empty / error presentation shared by the data-backed dashboard
 * pages. Every one of them needs the same three states, so they live here
 * rather than being re-invented per page.
 */

interface SkeletonProps {
  count?: number;
  className?: string;
}

/** Shimmer placeholders for a card grid (courses, certificates, notes). */
export function CardGridSkeleton({ count = 6, className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3",
        className,
      )}
      aria-busy="true"
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="h-40 w-full bg-slate-200 dark:bg-slate-800" />
          <div className="space-y-3 p-4">
            <div className="h-4 w-3/4 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-3 w-1/2 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-3 w-2/3 rounded bg-slate-200 dark:bg-slate-800" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Shimmer placeholders for a stacked list (orders, activity, threads). */
export function ListSkeleton({ count = 5, className }: SkeletonProps) {
  return (
    <div className={cn("space-y-3", className)} aria-busy="true">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="flex animate-pulse items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="h-12 w-12 shrink-0 rounded-lg bg-slate-200 dark:bg-slate-800" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-1/3 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-3 w-1/2 rounded bg-slate-200 dark:bg-slate-800" />
          </div>
          <div className="h-6 w-20 rounded-full bg-slate-200 dark:bg-slate-800" />
        </div>
      ))}
    </div>
  );
}

/** Shimmer placeholders for a KPI tile row. */
export function StatsSkeleton({ count = 4, className }: SkeletonProps) {
  return (
    <div
      className={cn("grid grid-cols-2 gap-4 lg:grid-cols-4", className)}
      aria-busy="true"
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse space-y-3 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="h-9 w-9 rounded-xl bg-slate-200 dark:bg-slate-800" />
          <div className="h-6 w-16 rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-3 w-24 rounded bg-slate-200 dark:bg-slate-800" />
        </div>
      ))}
    </div>
  );
}

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 px-6 py-16 text-center dark:border-slate-700 dark:bg-slate-900/40",
        className,
      )}
    >
      {icon ? (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-200/70 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
          {icon}
        </div>
      ) : null}
      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
        {title}
      </h3>
      {description ? (
        <p className="mt-1 max-w-md text-sm text-slate-500 dark:text-slate-400">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  description = "We couldn't load this right now. Please try again.",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-rose-200 bg-rose-50/60 px-6 py-14 text-center dark:border-rose-900/50 dark:bg-rose-950/20",
        className,
      )}
      role="alert"
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400">
        <AlertCircle className="h-6 w-6" />
      </div>
      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
        {title}
      </h3>
      <p className="mt-1 max-w-md text-sm text-slate-500 dark:text-slate-400">
        {description}
      </p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
        >
          <RefreshCw className="h-4 w-4" />
          Try again
        </button>
      ) : null}
    </div>
  );
}
