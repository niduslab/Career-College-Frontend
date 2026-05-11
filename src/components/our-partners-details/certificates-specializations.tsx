"use client";
import { useState } from "react";
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

type Course = {
  title: string;
  instructor: string;
  lessons: string;
  duration: string;
  students: string;
  rating: string;
  price: string;
  image: StaticImageData;
};

const COURSES: Course[] = [
  {
    title: "AI Foundations for Everyone Specialization",
    instructor: "Jose Portello",
    lessons: "56 Lessons",
    duration: "10h 32 min",
    students: "232 Students",
    rating: "4.6",
    price: "$42.99",
    image: Image1,
  },
  {
    title: "Develop Generative AI Applications: Get Started",
    instructor: "Jose Portello",
    lessons: "56 Lessons",
    duration: "10h 32 min",
    students: "232 Students",
    rating: "4.6",
    price: "$42.99",
    image: Image2,
  },
  {
    title: "Supervised Machine Learning: Classification",
    instructor: "Jose Portello",
    lessons: "56 Lessons",
    duration: "10h 32 min",
    students: "232 Students",
    rating: "4.6",
    price: "$42.99",
    image: Image3,
  },
  {
    title: "Deep Learning & Neural Networks with Keras",
    instructor: "Jose Portello",
    lessons: "56 Lessons",
    duration: "10h 32 min",
    students: "232 Students",
    rating: "4.6",
    price: "$42.99",
    image: Image4,
  },
  {
    title: "Data Science Fundamentals with Python and SQL",
    instructor: "Jose Portello",
    lessons: "56 Lessons",
    duration: "10h 32 min",
    students: "232 Students",
    rating: "4.6",
    price: "$42.99",
    image: Image5,
  },
  {
    title: "IBM Full Stack Software Developer Certificate",
    instructor: "Jose Portello",
    lessons: "56 Lessons",
    duration: "10h 32 min",
    students: "232 Students",
    rating: "4.6",
    price: "$42.99",
    image: Image6,
  },
];

const PAGE_SIZE = 3;

export default function CertificatesSpecializations({
  partnerName = "IBM",
}: {
  partnerName?: string;
}) {
  const [showAll, setShowAll] = useState(false);

  const visible = showAll ? COURSES : COURSES.slice(0, PAGE_SIZE);
  const hasMore = COURSES.length > PAGE_SIZE;

  return (
    <section className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 lg:mt-25 mt-10 lg:mb-25 mb-10">
      <h2 className="text-[24px] md:text-[32px] font-semibold tracking-tight text-(--text-title)">
        Certificates & Specializations
      </h2>

      <div className="mt-8 md:mt-10 grid gap-4 lg:gap-5 md:grid-cols-2 lg:grid-cols-3">
        {visible.map((course, index) => (
          <article
            key={`${course.title}-${index}`}
            className="rounded-2xl border border-(--gray-200) bg-(--text-white) p-4"
          >
            <div className="relative h-55 overflow-hidden rounded-lg before:absolute before:inset-0 before:z-10">
              <Image
                src={course.image}
                alt={course.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover"
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
                <h3 className="line-clamp-2 sg-p-big lg:h-6 leading-[1.22] font-semibold tracking-[-0.012em] text-(--text-title)">
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
                  className="h-10 rounded-md border bg-(--primary-700) sg-p-default px-3 font-semibold text-(--text-white) transition-colors cursor-pointer"
                >
                  View Details
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {hasMore && (
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={() => setShowAll((prev) => !prev)}
            className="inline-flex h-12 cursor-pointer items-center gap-2 rounded-md bg-(--primary-700) px-6 sg-p-default font-semibold text-(--text-white)"
          >
            {showAll ? "Show Less" : "Show More"}
            <ArrowRight
              size={20}
              strokeWidth={2.4}
              className={`transition-transform duration-300 ${showAll ? "rotate-90" : ""}`}
            />
          </button>
        </div>
      )}
    </section>
  );
}
