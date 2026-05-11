"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Image, { StaticImageData } from "next/image";
import {
  Star,
  MonitorPlay,
  Clock,
  Users,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
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
  {
    image: img1,
    title: "Complete Digital Marketing Mastery Course",
    instructor: "Jose Portella",
    rating: 4.6,
    lessons: 56,
    duration: "10h 32 min",
    students: 232,
    price: "$42.99",
  },
  {
    image: img2,
    title: "AI Engineer Agentic Track: The Complete Agent & MCP Course",
    instructor: "Jose Portella",
    rating: 4.6,
    lessons: 56,
    duration: "10h 32 min",
    students: 232,
    price: "$42.99",
  },
  {
    image: img3,
    title: "Diploma in Healthcare Administration & Leadership",
    instructor: "Jose Portella",
    rating: 4.6,
    lessons: 56,
    duration: "10h 32 min",
    students: 232,
    price: "$42.99",
  },
  {
    image: img4,
    title: "Complete UI/UX Design Course 2026: Figma + Real Project",
    instructor: "Jose Portella",
    rating: 4.6,
    lessons: 56,
    duration: "10h 32 min",
    students: 232,
    price: "$42.99",
  },
  {
    image: img5,
    title: "Python for Data Science & Machine Learning Bootcamp",
    instructor: "Jose Portella",
    rating: 4.6,
    lessons: 56,
    duration: "10h 32 min",
    students: 232,
    price: "$42.99",
  },
  {
    image: img6,
    title: "AWS Certified Solutions Architect – Professional 2026",
    instructor: "Jose Portella",
    rating: 4.6,
    lessons: 56,
    duration: "10h 32 min",
    students: 232,
    price: "$42.99",
  },
];

const VISIBLE_LG = 3;
const VISIBLE_MD = 2;
const VISIBLE_SM = 1;
const AUTO_INTERVAL = 4000;
const GAP = 20;

function getVisibleCount(): number {
  if (typeof window === "undefined") return VISIBLE_LG;
  if (window.innerWidth >= 1024) return VISIBLE_LG;
  if (window.innerWidth >= 768) return VISIBLE_MD;
  return VISIBLE_SM;
}

export default function ExploreMoreCourses() {
  const [current, setCurrent] = useState(0);
  const [activeArrow, setActiveArrow] = useState<"prev" | "next" | null>(null);
  const [visibleCount, setVisibleCount] = useState(VISIBLE_LG);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Responsive: update visibleCount AND clamp current in the same handler
  useEffect(() => {
    const handleResize = () => {
      const count = getVisibleCount();
      const max = COURSES.length - count;
      setVisibleCount(count);
      setCurrent((c) => (c > max ? max : c));
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Auto-play using a ref for the interval so it never triggers re-renders
  const startAuto = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrent((c) => {
        const max = COURSES.length - getVisibleCount();
        return c >= max ? 0 : c + 1;
      });
    }, AUTO_INTERVAL);
  }, []);

  useEffect(() => {
    startAuto();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startAuto]);

  const prev = () => {
    const max = COURSES.length - getVisibleCount();
    setCurrent((c) => (c <= 0 ? max : c - 1));
    setActiveArrow("prev");
    startAuto();
  };

  const next = () => {
    const max = COURSES.length - getVisibleCount();
    setCurrent((c) => (c >= max ? 0 : c + 1));
    setActiveArrow("next");
    startAuto();
  };

  // Calculate card width as percentage
  const cardWidth = 100 / visibleCount;
  // Calculate gap contribution per card
  const gapPerCard = (GAP * (visibleCount - 1)) / visibleCount;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="sg-h5 md:sg-h4 font-semibold --title-text mb-0">
          Explore More Courses
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={prev}
            aria-label="Previous"
            className={`w-9 h-9   cursor-pointer rounded-lg flex items-center justify-center transition-colors ${
              activeArrow === "prev"
                ? "bg-(--primary-700) border border-(--primary-700) text-white"
                : "bg-white border border-gray-200 hover:bg-gray-50"
            }`}
          >
            <ArrowLeft size={18} />
          </button>
          <button
            onClick={next}
            aria-label="Next"
            className={`w-9 h-9  cursor-pointer rounded-lg flex items-center justify-center transition-colors ${
              activeArrow === "next"
                ? "bg-(--primary-700) border border-(--primary-700) text-white"
                : "bg-white border border-gray-200 hover:bg-gray-50"
            }`}
          >
            <ArrowRight size={18} />
          </button>
        </div>
      </div>

      {/* Carousel viewport */}
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{
            gap: `${GAP}px`,
            transform: `translateX(calc(-${current * cardWidth}% - ${current * GAP}px))`,
          }}
        >
          {COURSES.map((course, i) => (
            <div
              key={i}
              className="shrink-0 p-3 md:p-4 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col"
              style={{
                width: `calc(${cardWidth}% - ${gapPerCard}px)`,
              }}
            >
              <div className="relative h-48 md:h-55 overflow-hidden rounded-lg">
                <Image
                  src={course.image}
                  alt={course.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover"
                />
              </div>

              <div className="p-3 md:p-4 flex flex-col gap-2 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="sg-p-default md:sg-h6 lg:sg-h6 font-semibold text-gray-900 leading-snug line-clamp-2 flex-1">
                    {course.title}
                  </h3>
                  <div className="flex items-center gap-1 shrink-0">
                    <Star size={13} className="fill-amber-400 text-amber-400" />
                    <span className="sg-p-small font-normal text-(--text-paragraph)">
                      {course.rating}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-gray-500">By {course.instructor}</p>

                <div className="mt-2 md:mt-3 flex flex-wrap gap-1.5 md:gap-2 border-b border-dashed border-gray-200 pb-3 md:pb-4">
                  <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-2 py-1 sg-caption text-gray-500">
                    <MonitorPlay size={12} className="text-gray-400" />
                    {course.lessons} Lessons
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-2 py-1 sg-caption text-gray-500">
                    <Clock size={12} className="text-gray-400" />
                    {course.duration}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-2 py-1 sg-caption text-gray-500">
                    <Users size={12} className="text-gray-400" />
                    {course.students} Students
                  </span>
                </div>

                <div className="flex items-center justify-between mt-auto pt-2 md:pt-3">
                  <span className="text-sm md:text-base font-bold text-gray-900">
                    {course.price}
                  </span>
                  <button className="px-3 md:px-4 py-1.5 rounded-md h-9 md:h-10 cursor-pointer text-xs md:text-sm font-semibold transition-colors border border-gray-300 text-gray-700 hover:bg-gray-50">
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
