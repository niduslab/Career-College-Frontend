"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Star,
  Clock,
  TrendingUp,
  Heart,
  Sparkles,
  ChevronDown,
  Search,
} from "lucide-react";
import gsap from "gsap";
import { useRouter } from "next/navigation";
import { Pagination } from "@/components/common/pagination";

import img1 from "@/assets/images/popular-courses/image1.webp";
import img2 from "@/assets/images/popular-courses/image2.webp";
import img3 from "@/assets/images/popular-courses/image3.webp";
import img4 from "@/assets/images/popular-courses/image4.webp";
import img5 from "@/assets/images/popular-courses/image5.webp";
import img6 from "@/assets/images/popular-courses/image6.webp";
import instructor1 from "@/assets/images/instructors/instructor1.webp";
import instructor2 from "@/assets/images/instructors/instructor2.webp";
import instructor3 from "@/assets/images/instructors/instructor3.webp";
import instructor4 from "@/assets/images/instructors/instructor4.webp";
import instructor5 from "@/assets/images/instructors/instructor5.webp";
import instructor6 from "@/assets/images/instructors/instructor6.webp";

const CATEGORIES = ["All", "AI & ML", "Data", "Design", "Web Dev", "Business"];
const SORT_OPTIONS = [
  "Most popular",
  "Newest",
  "Highest rated",
  "Price: Low to High",
];

interface Course {
  id: number;
  title: string;
  instructor: string;
  image: Parameters<typeof Image>[0]["src"];
  instructorImg: Parameters<typeof Image>[0]["src"];
  rating: number;
  reviews: number;
  duration: string;
  level: string;
  price: number;
  originalPrice: number;
  category: string;
  badge?: string;
  badgeColor?: string;
  wishlisted?: boolean;
}

const COURSES: Course[] = [
  {
    id: 1,
    title: "Generative AI & LLMs in Production",
    instructor: "Dr. Lena Park",
    image: img1,
    instructorImg: instructor1,
    rating: 4.9,
    reviews: 2840,
    duration: "18h",
    level: "Advanced",
    price: 89,
    originalPrice: 149,
    category: "AI & ML",
    badge: "Bestseller",
    badgeColor: "bg-amber-500",
  },
  {
    id: 2,
    title: "Prompt Engineering Masterclass",
    instructor: "Marcus Webb",
    image: img2,
    instructorImg: instructor2,
    rating: 4.8,
    reviews: 1920,
    duration: "9h",
    level: "Beginner",
    price: 59,
    originalPrice: 99,
    category: "AI & ML",
    badge: "New",
    badgeColor: "bg-emerald-500",
  },
  {
    id: 3,
    title: "Computer Vision with PyTorch",
    instructor: "Dr. Omar Said",
    image: img3,
    instructorImg: instructor3,
    rating: 4.9,
    reviews: 3410,
    duration: "22h",
    level: "Advanced",
    price: 99,
    originalPrice: 159,
    category: "AI & ML",
    badge: "Hot",
    badgeColor: "bg-rose-500",
  },
  {
    id: 4,
    title: "Data Analysis with Python & Pandas",
    instructor: "Sara Kim",
    image: img4,
    instructorImg: instructor4,
    rating: 4.7,
    reviews: 1540,
    duration: "14h",
    level: "Intermediate",
    price: 69,
    originalPrice: 119,
    category: "Data",
  },
  {
    id: 5,
    title: "UI/UX Design Fundamentals",
    instructor: "James Carter",
    image: img5,
    instructorImg: instructor5,
    rating: 4.8,
    reviews: 2210,
    duration: "11h",
    level: "Beginner",
    price: 49,
    originalPrice: 89,
    category: "Design",
    badge: "Trending",
    badgeColor: "bg-(--primary-600)",
  },
  {
    id: 6,
    title: "SQL for Data Analytics",
    instructor: "Amara Okafor",
    image: img6,
    instructorImg: instructor6,
    rating: 4.6,
    reviews: 980,
    duration: "8h",
    level: "Beginner",
    price: 39,
    originalPrice: 79,
    category: "Data",
  },
  {
    id: 7,
    title: "SQL for Data Analytics",
    instructor: "Amara Okafor",
    image: img5,
    instructorImg: instructor5,
    rating: 4.6,
    reviews: 980,
    duration: "8h",
    level: "Beginner",
    price: 39,
    originalPrice: 79,
    category: "Data",
  },
  {
    id: 8,
    title: "SQL for Data Analytics",
    instructor: "Amara Okafor",
    image: img6,
    instructorImg: instructor6,
    rating: 4.6,
    reviews: 980,
    duration: "8h",
    level: "Beginner",
    price: 39,
    originalPrice: 79,
    category: "Data",
  },
  {
    id: 9,
    title: "SQL for Data Analytics",
    instructor: "Amara Okafor",
    image: img2,
    instructorImg: instructor2,
    rating: 4.6,
    reviews: 980,
    duration: "8h",
    level: "Beginner",
    price: 39,
    originalPrice: 79,
    category: "Data",
  },
  {
    id: 10,
    title: "SQL for Data Analytics",
    instructor: "Amara Okafor",
    image: img3,
    instructorImg: instructor3,
    rating: 4.6,
    reviews: 980,
    duration: "8h",
    level: "Beginner",
    price: 39,
    originalPrice: 79,
    category: "Data",
  },
  {
    id: 11,
    title: "SQL for Data Analytics",
    instructor: "Amara Okafor",
    image: img4,
    instructorImg: instructor4,
    rating: 4.6,
    reviews: 980,
    duration: "8h",
    level: "Beginner",
    price: 39,
    originalPrice: 79,
    category: "Data",
  },
  {
    id: 12,
    title: "SQL for Data Analytics",
    instructor: "Amara Okafor",
    image: img5,
    instructorImg: instructor5,
    rating: 4.6,
    reviews: 980,
    duration: "8h",
    level: "Beginner",
    price: 39,
    originalPrice: 79,
    category: "Data",
  },
];

const LEVEL_COLOR: Record<string, string> = {
  Beginner: "text-emerald-600 bg-emerald-50",
  Intermediate: "text-amber-600 bg-amber-50",
  Advanced: "text-rose-600 bg-rose-50",
};

function CourseCard({ course }: { course: Course }) {
  const [wished, setWished] = useState(course.wishlisted ?? false);

  return (
    <div className="course-card opacity-0 bg-white rounded-2xl border border-(--gray-200) overflow-hidden hover:shadow-md transition-shadow duration-200 flex flex-col">
      {/* Thumbnail */}
      <div className="relative h-44 overflow-hidden shrink-0">
        <Image
          src={course.image}
          alt={course.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-300 hover:scale-105"
        />
        {/* Badge */}
        {course.badge && (
          <span
            className={`absolute top-3 left-3 text-[12px] font-semibold text-white px-2.5 py-1 rounded-full ${course.badgeColor}`}
          >
            {course.badge}
          </span>
        )}
        {/* Wishlist */}
        <button
          onClick={() => setWished((v) => !v)}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors cursor-pointer shadow-sm"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${wished ? "fill-rose-500 text-rose-500" : "text-(--gray-500)"}`}
          />
        </button>
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-4">
        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-2">
          <Star className="w-3.5 h-3.5 text-amber-400 fill-current shrink-0" />
          <span className="text-[14px] font-semibold text-(--text-title)">
            {course.rating}
          </span>
          <span className="text-[12px] text-(--gray-400)">
            ({course.reviews.toLocaleString()})
          </span>
        </div>

        {/* Title */}
        <h3 className="text-[14px] font-semibold text-(--text-title) leading-snug mb-3 line-clamp-2 flex-1">
          {course.title}
        </h3>

        {/* Instructor */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 border border-(--gray-100)">
            <Image
              src={course.instructorImg}
              alt={course.instructor}
              width={24}
              height={24}
              className="object-cover"
            />
          </div>
          <span className="text-[12px] text-(--gray-500) truncate">
            {course.instructor}
          </span>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-3 mb-4">
          <span className="flex items-center gap-1 text-[12px] text-(--gray-400)">
            <Clock className="w-4 h-4 shrink-0" />
            {course.duration}
          </span>
          <span className="flex items-center gap-1 text-[12px] text-(--gray-400)">
            <TrendingUp className="w-4 h-4 shrink-0" />
            {course.level}
          </span>
          <span
            className={`text-[12px] font-medium px-2 py-0.5 rounded-full ml-auto ${LEVEL_COLOR[course.level]}`}
          >
            {course.level}
          </span>
        </div>

        {/* Price + Enroll */}
        <div className="flex items-center justify-between pt-3 border-t border-(--gray-100)">
          <div className="flex items-baseline gap-1.5">
            <span className="text-[18px] font-bold text-(--text-title)">
              ${course.price}
            </span>
            <span className="text-[14px] text-(--gray-400) line-through">
              ${course.originalPrice}
            </span>
          </div>
          <button className="px-4 py-1.5 rounded-md bg-(--primary-50) hover:bg-(--primary-100) text-(--primary-600) text-[14px] font-semibold transition-colors cursor-pointer border border-(--primary-100)">
            Enroll
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CourseCatalogPage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortOpen, setSortOpen] = useState(false);
  const [sortLabel, setSortLabel] = useState("Most popular");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const PAGE_SIZE = 6;

  const headerRef = useRef<HTMLDivElement>(null);
  const bannerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const filtered = COURSES.filter((c) => {
    const matchCat = activeCategory === "All" || c.category === activeCategory;
    const matchSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.instructor.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginated = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.fromTo(
      headerRef.current,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.4 },
    ).fromTo(
      bannerRef.current,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.35 },
      "-=0.2",
    );
  }, []);

  // Animate cards when page/filter changes
  useEffect(() => {
    if (!gridRef.current) return;
    const cards = Array.from(gridRef.current.querySelectorAll(".course-card"));
    gsap.killTweensOf(cards);
    const ctx = gsap.context(() => {
      gsap.fromTo(
        cards,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.35, stagger: 0.07, ease: "power3.out" },
      );
    }, gridRef);
    return () => ctx.revert();
  }, [activeCategory, search, currentPage]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div ref={headerRef} className="opacity-0">
        <h1 className="text-[20px] md:text-[24px] lg:text-[24px] font-semibold text-(--text-title)">
          Course Catalog
        </h1>
        <p className="text-[12px] md:text-[14px] lg:text-[14px] text-(--gray-500) mt-1">
          Explore 240+ expert-led courses across AI, Data, and Design.
        </p>
      </div>

      {/* AI banner */}
      <div
        ref={bannerRef}
        className="opacity-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-(--primary-50) border border-(--primary-100) rounded-2xl px-5 py-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-(--primary-600) flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-[12px] md:text-[14px] lg:text-[14px] font-semibold text-(--text-title)">
              Not sure where to start?
            </p>
            <p className="text-[12px] md:text-[14px] lg:text-[14px] text-(--gray-500)">
              Let the AI advisor recommend a course based on your goals and
              current skills.
            </p>
          </div>
        </div>
        <button
          onClick={() => router.push("/dashboard/learner/ai-assistant")}
          className="flex items-center h-12 gap-2 px-5 py-2.5 rounded-lg bg-(--primary-600) hover:bg-(--primary-700) text-white text-[12px] md:text-[14px] lg:text-[14px] font-semibold transition-colors cursor-pointer shrink-0 whitespace-nowrap"
        >
          <Sparkles className="w-4 h-4" />
          Get AI recommendation
        </button>
      </div>

      {/* Filters + sort row */}

      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3">
        {/* Category tabs */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                setCurrentPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-md h-11 text-[12px] md:text-[14px] lg:text-[14px] font-medium transition-colors cursor-pointer border whitespace-nowrap shrink-0 ${
                activeCategory === cat
                  ? "bg-(--primary-600) text-white border-(--primary-600)"
                  : "bg-white text-(--gray-600) border-(--gray-200) hover:border-(--primary-300)"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search + sort — own row on <xl, inline on xl+ */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative flex-1 xl:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--gray-400)" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search courses..."
              className="w-full sm:w-56 xl:w-56 pl-9 pr-4 h-11 rounded-md border border-(--gray-200) text-[14px] text-(--text-title) placeholder:text-(--gray-400) outline-none focus:border-(--primary-400) transition-colors bg-white"
            />
          </div>
          <div className="relative shrink-0">
            <button
              onClick={() => setSortOpen((v) => !v)}
              className="flex items-center gap-1.5 h-11 px-3.5 rounded-md border border-(--gray-200) bg-white text-[12px] md:text-[14px] lg:text-[14px] text-(--gray-500) font-normal hover:border-(--primary-300) transition-colors cursor-pointer whitespace-nowrap"
            >
              Sort: {sortLabel}
              <ChevronDown
                className={`w-4 h-4 transition-transform ${sortOpen ? "rotate-180" : ""}`}
              />
            </button>
            {sortOpen && (
              <div className="absolute right-0 top-12 z-20 bg-white border border-(--gray-200) rounded-xl shadow-lg py-1.5 w-48">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setSortLabel(opt);
                      setSortOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-[12px] md:text-[14px] lg:text-[14px] hover:bg-(--gray-50) transition-colors cursor-pointer ${sortLabel === opt ? "font-semibold text-(--primary-600)" : "text-(--text-title)"}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Results count */}
      <p className="text-[12px] md:text-[14px] lg:text-[14px] text-(--gray-500)">
        Showing{" "}
        <span className="font-semibold text-(--text-title)">
          {filtered.length}
        </span>{" "}
        courses
        {activeCategory !== "All" && (
          <>
            {" "}
            in{" "}
            <span className="font-semibold text-(--primary-600)">
              {activeCategory}
            </span>
          </>
        )}
      </p>

      {/* Grid */}
      <div
        ref={gridRef}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4"
      >
        {paginated.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full py-16 text-center text-(--gray-400)">
            <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-[16px] font-medium">No courses found</p>
            <p className="text-[12px] md:text-[14px] lg:text-[14px] mt-1">
              Try a different keyword or category
            </p>
          </div>
        )}
      </div>

      <Pagination
        currentPage={safePage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
