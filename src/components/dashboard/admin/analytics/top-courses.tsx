"use client";

import { Loader2, Star } from "lucide-react";
import { useTopCourses } from "@/hooks/use-admin-analytics";

export default function TopCourses() {
  const { data: courses, isLoading } = useTopCourses("enrollments", 5);

  return (
    <div className="bg-white rounded-2xl border border-(--gray-200) px-5 py-4 space-y-4">
      <p className="text-[14px] lg:text-[16px] font-semibold text-(--text-title)">
        Top Courses
      </p>
      {isLoading ? (
        <div className="flex items-center justify-center py-10 text-(--gray-400)">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
      ) : !courses || courses.length === 0 ? (
        <p className="text-[13px] text-(--gray-400) py-4 text-center">No course data yet.</p>
      ) : (
        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full min-w-120 border-collapse">
            <thead>
              <tr className="border-b border-(--gray-100)">
                <th className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase text-left pb-2">
                  Course
                </th>
                <th className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase text-center pb-2">
                  Enrolled
                </th>
                <th className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase text-center pb-2">
                  Completion
                </th>
                <th className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase text-center pb-2">
                  Rating
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--gray-50)">
              {courses.map((c) => (
                <tr key={c.id}>
                  <td className="py-3 pr-3">
                    <p className="text-[13px] font-semibold text-(--text-title)">
                      {c.title}
                    </p>
                    <p className="text-[11px] text-(--gray-400) mt-0.5 capitalize">
                      {c.status}
                    </p>
                  </td>
                  <td className="py-3 text-[13px] text-(--gray-600) text-center">
                    {c.enrollments.toLocaleString()}
                  </td>
                  <td className="py-3 text-center">
                    <span className="text-[12px] font-semibold text-emerald-600 bg-emerald-50 rounded-full px-2.5 py-1">
                      {c.completion_rate}%
                    </span>
                  </td>
                  <td className="py-3 text-center">
                    <span className="inline-flex items-center justify-center gap-1 text-[13px] font-semibold text-(--text-title)">
                      {c.review_count > 0 ? (
                        <>
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          {c.avg_rating.toFixed(1)}
                        </>
                      ) : (
                        <span className="text-(--gray-400)">—</span>
                      )}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
