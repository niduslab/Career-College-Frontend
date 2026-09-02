"use client";

import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import type { CodingRunResult, CodingTestResult } from "@/lib/course-api";

export function StatusIcon({ status }: { status: CodingTestResult["status"] }) {
  if (status === "passed")
    return <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />;
  if (status === "failed")
    return <XCircle className="w-4 h-4 text-red-500 shrink-0" />;
  return <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />;
}

/** Per-test rows for one sandbox run. Shared by the builder's Run panel and the
 *  AI review modal's verification. */
export default function RunResultPanel({ result }: { result: CodingRunResult }) {

  return (
    <div className="border border-(--gray-200) rounded-xl overflow-hidden mt-2">
      <div className="flex items-center justify-between px-4 py-2.5 bg-(--gray-50) border-b border-(--gray-200)">
        <div className="flex items-center gap-2">
          <StatusIcon status={result.status} />
          <span className="text-[13px] font-semibold text-(--text-title) capitalize">
            {result.status}
          </span>
        </div>
        <span className="text-[12px] text-(--gray-500)">
          {result.passed_tests}/{result.total_tests} passed ·{" "}
          {result.runtime_ms} ms
        </span>
      </div>
      {result.error_message && (
        <pre className="px-4 py-3 text-[12px] font-mono text-red-600 whitespace-pre-wrap border-b border-(--gray-100)">
          {result.error_message}
        </pre>
      )}
      <div className="divide-y divide-(--gray-100)">
        {result.test_results.map((t) => (
          <div key={t.position} className="px-4 py-3 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <StatusIcon status={t.status} />
                <span className="text-[13px] font-mono text-(--text-title) truncate">
                  {t.test_name}
                </span>
              </div>
              <span className="text-[12px] text-(--gray-500) shrink-0">
                {t.runtime_ms} ms
              </span>
            </div>
            {t.stdout && (
              <pre className="text-[12px] font-mono text-(--text-paragraph) bg-(--gray-50) rounded-md px-3 py-2 whitespace-pre-wrap overflow-x-auto">
                {t.stdout}
              </pre>
            )}
            {t.status !== "passed" && t.stderr && (
              <pre className="text-[12px] font-mono text-red-600 bg-red-50 rounded-md px-3 py-2 whitespace-pre-wrap overflow-x-auto">
                {t.stderr}
              </pre>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
