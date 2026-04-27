"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Image, { StaticImageData } from "next/image";
import { ChevronLeft, ChevronRight, Star, MonitorPlay, Clock, Users } from "lucide-react";
import img1 from "@/assets/images/popular-courses/image1.webp";
import img2 from "@/assets/images/popular-courses/image2.webp";
import img3 from "@/assets/images/popular-courses/image3.webp";
import img4 from "@/assets/images/popular-courses/image4.webp";
import img5 from "@/assets/images/popular-courses/image5.webp";
import img6 from "@/assets/images/popular-courses/image6.webp";

interface Course {
  image: StaticImageData;
  title: string;
  instructor: string;
  rating: number;
  lessons: number;
  duration: string;
  students: number;
  price: string;
}

const COURSES: Course[] = [
  { image: img1, title: "Complete Digital Marketing Mastery Course",             instructor: "Jose Portella", rating: 4.6, lessons: 56, duration: "10h 32 min", students: 232, price: "$42.99" },
  { image: img2, title: "AI Engineer Agentic Track: The Complete Agent & MCP Course", instructor: "Jose Portella", rating: 4.6, lessons: 56, duration: "10h 32 min", students: 232, price: "$42.99" },
  { image: img3, title: "Diploma in Healthcare Administration & Leadership",     instructor: "Jose Portella", rating: 4.6, lessons: 56, duration: "10h 32 min", students: 232, price: "$42.99" },
  { image: img4, title: "Complete UI/UX Design Course 2026: Figma + Real Project", instructor: "Jose Portella", rating: 4.6, lessons: 56, duration: "10h 32 min", students: 232, price: "$42.99" },
  { image: img5, title: "Python for Data Science & Machine Learning Bootcamp",   instructor: "Jose Portella", rating: 4.6, lessons: 56, duration: "10h 32 min", students: 232, price: "$42.99" },
  { image: img6, title: "AWS Certified Solutions Architect – Professional 2026", instructor: "Jose Portella", rating: 4.6, lessons: 56, duration: "10h 32 min", students: 232, price: "$42.99" },
];

const VISIBLE = 3;        // cards shown at once
const AUTO_INTERVAL = 4000; // ms between auto-slides

export default function ExploreMoreCourses() {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const maxIndex = COURSES.length - VISIBLE;

  const stopAuto  = () => { if (timerRef.current) clearInterval(timerRef.current); };
  const startAuto = useCallback(() => {
    stopAuto();
    timerRef.current = setInterval(() => {
      setCurrent((c) => (c >= maxIndex ? 0 : c + 1));
    }, AUTO_INTERVAL);
  }, [maxIndex]);

  useEffect(() => {
    startAuto();
    return stopAuto;
  }, [startAuto]);

  const goTo = (idx: number) => {
    setCurrent(Math.max(0, Math.min(idx, maxIndex)));
    startAuto(); // reset timer on manual nav
  };

  const prev = () => goTo(current <= 0 ? maxIndex : current - 1);
  const next = () => goTo(current >= maxIndex ? 0 : current + 1);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Explore More Courses</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={prev}
            aria-label="Previous"
            className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={next}
            aria-label="Next"
            className="w-9 h-9 rounded-full bg-purple-600 flex items-center justify-center text-white hover:bg-purple-700 transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Carousel viewport */}
      <div className="overflow-hidden">
        <div
          className="flex gap-5 transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(calc(-${current} * (100% / ${VISIBLE} + 20px / ${VISIBLE} * (${VISIBLE} - 1) / ${VISIBLE})))` }}
        >
          {COURSES.map((course, i) => (
            <div
              key={i}
              className="shrink-0 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col"
              style={{ width: `calc((100% - ${(VISIBLE - 1) * 20}px) / ${VISIBLE})` }}
            >
              {/* Course image */}
              <div className="relative w-full h-44 shrink-0">
                <Image
                  src={course.image}
                  alt={course.title}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Card body */}
              <div className="p-4 flex flex-col gap-2 flex-1">
                {/* Title + Rating */}
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-bold text-gray-900 leading-snug line-clamp-2 flex-1">
                    {course.title}
                  </h3>
                  <div className="flex items-center gap-1 shrink-0">
                    <Star size={13} className="fill-amber-400 text-amber-400" />
                    <span className="text-xs font-semibold text-gray-700">{course.rating}</span>
                  </div>
                </div>

                {/* Instructor */}
                <p className="text-xs text-gray-500">By {course.instructor}</p>

                {/* Stats */}
                <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                  <span className="flex items-center gap-1">
                    <MonitorPlay size={12} className="text-gray-400" />
                    {course.lessons} Lessons
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} className="text-gray-400" />
                    {course.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users size={12} className="text-gray-400" />
                    {course.students} Students
                  </span>
                </div>

                {/* Price + CTA */}
                <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
                  <span className="text-base font-bold text-gray-900">{course.price}</span>
                  <button
                    className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-colors ${
                      i === current
                        ? "bg-purple-600 text-white hover:bg-purple-700"
                        : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
