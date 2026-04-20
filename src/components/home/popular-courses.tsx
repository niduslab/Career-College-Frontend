"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import type { StaticImageData } from "next/image";
import {
  ArrowRight,
  BookOpen,
  Clock3,
  Heart,
  Star,
  UsersRound,
} from "lucide-react";
import Image1 from "@/assets/images/popular-courses/image1.webp";
import Image2 from "@/assets/images/popular-courses/image2.webp";
import Image3 from "@/assets/images/popular-courses/image3.webp";
import Image4 from "@/assets/images/popular-courses/image4.webp";
import Image5 from "@/assets/images/popular-courses/image5.webp";
import Image6 from "@/assets/images/popular-courses/image6.webp";
import { gsap, prepareGsap } from "@/lib/gsap";

type CourseCard = {
  category: CategoryTab;
  title: string;
  instructor: string;
  lessons: string;
  duration: string;
  students: string;
  rating: string;
  price: string;
  image: StaticImageData;
};

const CATEGORY_TABS = [
  "All Courses",
  "UI/UX Design",
  "Digital Marketing",
  "Machine Learning",
  "Web Development",
  "Health & Fitness",
  "Lifestyle",
] as const;

type CategoryTab = (typeof CATEGORY_TABS)[number];

const COURSES: CourseCard[] = [
  {
    category: "Digital Marketing",
    title: "Complete Digital Marketing Mastery Course",
    instructor: "Jose Portello",
    lessons: "56 Lessons",
    duration: "10h 32 min",
    students: "232 Students",
    rating: "4.6",
    price: "$42.99",
    image: Image1,
  },
  {
    category: "Machine Learning",
    title: "AI Engineer Agentic Track: The Complete Agent & MCP Course",
    instructor: "Jose Portello",
    lessons: "56 Lessons",
    duration: "10h 32 min",
    students: "232 Students",
    rating: "4.6",
    price: "$42.99",
    image: Image2,
  },
  {
    category: "Health & Fitness",
    title: "Diploma in Healthcare Administration & Leadership",
    instructor: "Jose Portello",
    lessons: "56 Lessons",
    duration: "10h 32 min",
    students: "232 Students",
    rating: "4.6",
    price: "$42.99",
    image: Image3,
  },
  {
    category: "UI/UX Design",
    title: "Complete Digital Marketing Mastery Course",
    instructor: "Jose Portello",
    lessons: "56 Lessons",
    duration: "10h 32 min",
    students: "232 Students",
    rating: "4.6",
    price: "$42.99",
    image: Image4,
  },
  {
    category: "Lifestyle",
    title: "Complete Digital Marketing Mastery Course",
    instructor: "Jose Portello",
    lessons: "56 Lessons",
    duration: "10h 32 min",
    students: "232 Students",
    rating: "4.6",
    price: "$42.99",
    image: Image5,
  },
  {
    category: "Web Development",
    title: "Complete Full-Stack Web Development",
    instructor: "Jose Portello",
    lessons: "56 Lessons",
    duration: "10h 32 min",
    students: "232 Students",
    rating: "4.6",
    price: "$42.99",
    image: Image6,
  },
];

export function PopularCourses() {
  const [activeTab, setActiveTab] = useState<CategoryTab>("All Courses");
  const sectionRef = useRef<HTMLElement | null>(null);

  const filteredCourses = useMemo(() => {
    if (activeTab === "All Courses") {
      return COURSES;
    }

    return COURSES.filter((course) => course.category === activeTab);
  }, [activeTab]);

  useEffect(() => {
    if (!sectionRef.current) {
      return;
    }

    prepareGsap();

    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-course-card]",
        { opacity: 0, y: 14 },
        {
          opacity: 1,
          y: 0,
          duration: 0.42,
          stagger: 0.06,
          ease: "power2.out",
          clearProps: "opacity,transform",
        },
      );
    }, sectionRef);

    return () => {
      ctx.revert();
    };
  }, [activeTab]);

  return (
    <section
      ref={sectionRef}
      className="w-full bg-[#f4f5f8] lg:mt-25 mt-10 py-12 md:py-16 lg:py-20"
    >
      <div className="mx-auto w-full max-w-310 px-4 md:px-6 lg:px-8">
        <h2 className="text-center text-[24px] leading-[1.12] font-semibold tracking-[-0.03em] text-(--text-title) md:text-[40px] lg:text-[40px]">
          Our Popular Courses
          <br />
          You Can Start
        </h2>

        <div className="-mx-4 mt-6 overflow-x-auto px-4 pb-2 md:mx-0 md:mt-8 md:overflow-visible md:px-0 md:pb-0">
          <div className="flex w-max flex-nowrap items-center gap-4 md:w-auto md:flex-wrap md:justify-center">
            {CATEGORY_TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                aria-pressed={activeTab === tab}
                onClick={() => {
                  setActiveTab(tab);
                }}
                className={`cursor-pointer whitespace-nowrap h-10 rounded-md px-4 py-1 border sg-p-default   transition-colors md:text-sm ${
                  activeTab === tab
                    ? "border-(--primary-700) bg-(--primary-700) text-(--text-white) font-medium"
                    : "border-(--gray-300) bg-(--gray-100) text-(--text-title) hover:border-(--primary-300) font-normal"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-10 grid lg:gap-5 gap-4 md:mt-12 lg:mt-15 md:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course, index) => (
            <article
              key={`${course.title}-${index}`}
              data-course-card
              className="rounded-2xl  border border-(--gray-200) bg-(--text-white) p-4"
            >
              <div
                className={`relative overflow-hidden rounded-lg   before:absolute before:inset-0 before:z-10`}
              >
                <Image
                  src={course.image}
                  alt={course.title}
                  width={368}
                  height={262}
                  className="h-65.5 w-full object-cover"
                />
                <button
                  type="button"
                  aria-label="Add to favorites"
                  className="absolute right-3 top-3 z-20 inline-flex h-9 w-9 items-center justify-center rounded-full bg-(--text-white)/95 text-(--gray-500) shadow-[0_8px_20px_rgba(16,24,40,0.12)]"
                >
                  <Heart size={18} strokeWidth={2.2} />
                </button>
              </div>

              <div className="mt-3 px-1">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="line-clamp-2 sg-p-big leading-[1.22] font-semibold tracking-[-0.012em] text-(--text-title)">
                    {course.title}
                  </h3>
                  <span className="inline-flex shrink-0 items-center gap-1 pt-0.5 sg-p-small font-normal text-(--text-paragraph)">
                    <Star
                      size={16}
                      className="fill-[#ffa500] text-(--warning-500)"
                    />
                    {course.rating}
                  </span>
                </div>
                <p className="mt-2 sg-p-small font-normal text-(--text-paragraph)">
                  By {course.instructor}
                </p>
                <div className="mt-5 flex flex-wrap gap-4 border-b border-dashed border-(--gray-200) pb-4">
                  <span className="inline-flex items-center gap-1 rounded-full border border-(--gray-200) px-2 py-1 sg-caption text-(--gray-500)">
                    <BookOpen size={14} />
                    {course.lessons}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-(--gray-200) px-2 py-1 sg-caption text-(--gray-500)">
                    <Clock3 size={14} />
                    {course.duration}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-(--gray-200) px-2 py-1 sg-caption text-(--gray-500)">
                    <UsersRound size={14} />
                    {course.students}
                  </span>
                </div>

                <div className="flex items-center justify-between py-4">
                  <p className="text-[24px] leading-none font-semibold tracking-[-0.02em] text-(--text-title)">
                    {course.price}
                  </p>
                  <button
                    type="button"
                    className="h-10 rounded-md border bg-(--primary-700) sg-p-default  px-3  font-semibold text-(--text-white) transition-colors cursor-pointer"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-8 flex justify-center md:mt-10">
          <button
            type="button"
            className="inline-flex h-12 items-center gap-2 rounded-md bg-(--primary-700) px-6 sg-p-default font-semibold text-(--text-white)"
          >
            View All Courses
            <ArrowRight size={20} strokeWidth={2.4} />
          </button>
        </div>
      </div>
    </section>
  );
}
