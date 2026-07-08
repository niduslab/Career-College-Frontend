"use client";

import { TOP_COURSES } from "./data";

export default function TopCourses() {
  return (
    <div className="bg-white rounded-2xl border border-(--gray-200) px-5 py-4 space-y-4">
      <p className="text-[14px] lg:text-[16px] font-semibold text-(--text-title)">
        Top Courses
      </p>
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
                Revenue
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-(--gray-50)">
            {TOP_COURSES.map((c) => (
              <tr key={c.title}>
                <td className="py-3 pr-3">
                  <p className="text-[13px] font-semibold text-(--text-title)">
                    {c.title}
                  </p>
                  <p className="text-[11px] text-(--gray-400) mt-0.5">
                    {c.category}
                  </p>
                </td>
                <td className="py-3 text-[13px] text-(--gray-600) text-center">
                  {c.enrolled.toLocaleString()}
                </td>
                <td className="py-3 text-center">
                  <span className="text-[12px] font-semibold text-emerald-600 bg-emerald-50 rounded-full px-2.5 py-1">
                    {c.completion}%
                  </span>
                </td>
                <td className="py-3 text-[13px] font-semibold text-(--text-title) text-center">
                  {c.revenue}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
