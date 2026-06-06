"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Star, BarChart2 } from "lucide-react";

const TOP_COURSES = [
  { name: "UI/UX Design Mastery",      students: 420, rating: 4.9, completion: 78 },
  { name: "React & Next.js Bootcamp",  students: 380, rating: 4.8, completion: 71 },
  { name: "Figma for Beginners",       students: 310, rating: 4.9, completion: 85 },
  { name: "Advanced CSS Techniques",   students: 190, rating: 4.7, completion: 66 },
  { name: "Product Design Principles", students: 120, rating: 4.6, completion: 60 },
];

const maxStudents = Math.max(...TOP_COURSES.map((c) => c.students));

export default function TopCourses() {
  const rowsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    rowsRef.current.forEach((el, i) => {
      if (!el) return;
      gsap.fromTo(el,
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.4, delay: 0.3 + i * 0.08, ease: "power2.out" },
      );
    });
  }, []);

  return (
    <div className="bg-white border border-(--gray-200) rounded-2xl px-5 py-4 space-y-3 flex-1">
      <div className="flex items-center gap-2">
        <BarChart2 className="w-5 h-5 text-(--primary-600)" />
        <p className="text-[15px] font-semibold text-(--text-title)">Top Performing Courses</p>
      </div>
      <div className="space-y-1">
        {TOP_COURSES.map((c, i) => (
          <div
            key={c.name}
            ref={(el) => { rowsRef.current[i] = el; }}
            className="opacity-0 flex items-center gap-3 py-3 border-b border-(--gray-100) last:border-0"
          >
            <div className="w-7 h-7 rounded-full bg-(--primary-700) text-white text-[11px] font-bold flex items-center justify-center shrink-0">
              {i + 1}
            </div>
            <p className="flex-1 text-[13px] font-medium text-(--text-title) truncate min-w-0">{c.name}</p>
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-24 h-2.5 bg-(--gray-100) rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-(--primary-600)" style={{ width: `${(c.students / maxStudents) * 100}%` }} />
              </div>
              <span className="text-[12px] font-semibold text-(--text-title) w-10 text-right">{c.students.toLocaleString()}</span>
            </div>
            <span className="flex items-center gap-1 shrink-0">
              <Star className="w-3.5 h-3.5 text-yellow-400 fill-current" />
              <span className="text-[12px] font-semibold text-(--text-title)">{c.rating}</span>
            </span>
            <div className="flex items-center gap-1.5 shrink-0 w-20">
              <div className="flex-1 h-2 bg-(--gray-100) rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${c.completion >= 80 ? "bg-green-500" : c.completion >= 65 ? "bg-blue-500" : "bg-orange-400"}`}
                  style={{ width: `${c.completion}%` }}
                />
              </div>
              <span className="text-[11px] text-(--gray-500) shrink-0">{c.completion}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
