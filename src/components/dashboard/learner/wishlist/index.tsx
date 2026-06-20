"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Star,
  Clock,
  TrendingUp,
  Heart,
  ShoppingCart,
  Trash2,
  Search,
  BookOpen,
} from "lucide-react";
import gsap from "gsap";
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

interface WishlistCourse {
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
  addedDate: string;
}

const LEVEL_COLOR: Record<string, string> = {
  Beginner: "text-emerald-600 bg-emerald-50",
  Intermediate: "text-amber-600 bg-amber-50",
  Advanced: "text-rose-600 bg-rose-50",
};

const INITIAL_WISHLIST: WishlistCourse[] = [
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
    addedDate: "Jun 10, 2026",
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
    addedDate: "Jun 8, 2026",
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
    addedDate: "Jun 5, 2026",
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
    addedDate: "May 30, 2026",
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
    addedDate: "May 22, 2026",
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
    addedDate: "May 15, 2026",
  },
];

interface CardProps {
  course: WishlistCourse;
  onRemove: (id: number) => void;
}

function WishlistCard({ course, onRemove }: CardProps) {
  return (
    <div className="wishlist-card opacity-0 bg-white rounded-2xl border border-(--gray-200) overflow-hidden hover:shadow-md transition-shadow duration-200 flex flex-col sm:flex-row">
      {/* Thumbnail */}
      <div className="relative h-44 sm:h-auto sm:w-52 sm:shrink-0 overflow-hidden">
        <Image
          src={course.image}
          alt={course.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-300 hover:scale-105"
        />
        {course.badge && (
          <span
            className={`absolute top-3 left-3 text-[12px] font-semibold text-white px-2.5 py-1 rounded-full ${course.badgeColor}`}
          >
            {course.badge}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-4 sm:p-5">
        {/* Top row */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-1.5">
            <Star className="w-4 h-4 text-amber-400 fill-current shrink-0" />
            <span className="text-[14px] font-semibold text-(--text-title)">
              {course.rating}
            </span>
            <span className="text-[12px] text-(--gray-400)">
              ({course.reviews.toLocaleString()})
            </span>
          </div>
          <span
            className={`text-[12px] font-medium px-2 py-0.5 rounded-full shrink-0 ${LEVEL_COLOR[course.level]}`}
          >
            {course.level}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-[16px] font-semibold text-(--text-title) leading-snug mb-2 line-clamp-2">
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
        <div className="flex items-center gap-4 mb-auto">
          <span className="flex items-center gap-1 text-[12px] text-(--gray-400)">
            <Clock className="w-4 h-4 shrink-0" />
            {course.duration}
          </span>
          <span className="flex items-center gap-1 text-[12px] text-(--gray-400)">
            <TrendingUp className="w-4 h-4 shrink-0" />
            {course.level}
          </span>
          <span className="text-[12px] text-(--gray-400) ml-auto hidden sm:block">
            Added {course.addedDate}
          </span>
        </div>

        {/* Divider */}
        <div className="border-t  border-(--gray-100) mt-3 mb-3" />

        {/* Price + actions */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-baseline gap-1.5">
            <span className="text-[20px] font-bold text-(--text-title)">
              ${course.price}
            </span>
            <span className="text-[14px] text-(--gray-400) line-through">
              ${course.originalPrice}
            </span>
            <span className="text-[12px] font-semibold text-emerald-600 ml-1">
              {Math.round((1 - course.price / course.originalPrice) * 100)}% off
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onRemove(course.id)}
              className="w-9 h-9 flex items-center justify-center rounded-md border border-(--gray-200) text-(--gray-400) hover:border-rose-300 hover:text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
              title="Remove from wishlist"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button className="flex items-center gap-1.5 h-9 px-4 rounded-md border border-(--primary-200) bg-(--primary-50) hover:bg-(--primary-100) text-(--primary-600) text-[12px] font-semibold transition-colors cursor-pointer whitespace-nowrap">
              <ShoppingCart className="w-4 h-4" />
              Enroll Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistCourse[]>(INITIAL_WISHLIST);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const PAGE_SIZE = 4;

  const headerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = items.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.instructor.toLowerCase().includes(search.toLowerCase()),
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginated = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  const handleRemove = (id: number) => {
    setItems((prev) => prev.filter((c) => c.id !== id));
  };

  useEffect(() => {
    gsap.fromTo(
      headerRef.current,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" },
    );
  }, []);

  useEffect(() => {
    if (!listRef.current) return;
    const cards = Array.from(
      listRef.current.querySelectorAll(".wishlist-card"),
    );
    gsap.fromTo(
      cards,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.35, stagger: 0.07, ease: "power3.out" },
    );
  }, [filtered.length, search, currentPage]);

  const totalSavings = filtered.reduce(
    (sum, c) => sum + (c.originalPrice - c.price),
    0,
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div ref={headerRef} className="opacity-0">
        <h1 className="text-[20px] md:text-[24px] font-semibold text-(--text-title)">
          Wishlist
        </h1>
        <p className="text-[12px] md:text-[14px] lg:text-[14px] font-normal text-(--gray-500) mt-1">
          <span className="font-medium text-(--text-title)">
            {items.length}
          </span>{" "}
          saved courses · Enroll whenever you&apos;re ready.
        </p>
      </div>

      {/* Summary bar */}
      {items.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-(--primary-50) border border-(--primary-100) rounded-2xl px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-(--primary-600) flex items-center justify-center shrink-0">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[14px] font-semibold text-(--text-title)">
                {items.length} courses saved
              </p>
              <p className="text-[12px] text-(--gray-500)">
                You&apos;re saving{" "}
                <span className="font-semibold text-(--primary-600)">
                  ${totalSavings}
                </span>{" "}
                off the original prices.
              </p>
            </div>
          </div>
          <button className="flex items-center gap-2 h-11 px-5 rounded-lg bg-(--primary-600) hover:bg-(--primary-700) text-white text-[14px] font-semibold transition-colors cursor-pointer shrink-0 whitespace-nowrap">
            <BookOpen className="w-4 h-4" />
            Enroll All
          </button>
        </div>
      )}

      {/* Search */}
      {items.length > 0 && (
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--gray-400)" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            placeholder="Search wishlist..."
            className="w-full pl-9 pr-4 h-11 rounded-md border border-(--gray-200) text-[14px] text-(--text-title) placeholder:text-(--gray-400) outline-none focus:border-(--primary-400) transition-colors bg-white"
          />
        </div>
      )}

      {/* List */}
      <div ref={listRef} className="space-y-4">
        {paginated.map((course) => (
          <WishlistCard
            key={course.id}
            course={course}
            onRemove={handleRemove}
          />
        ))}

        {/* Empty state — no search match */}
        {items.length > 0 && filtered.length === 0 && (
          <div className="py-16 text-center text-(--gray-400)">
            <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-[16px] font-medium">
              No courses match your search
            </p>
            <p className="text-[14px] mt-1">Try a different keyword</p>
          </div>
        )}

        {/* Empty state — wishlist cleared */}
        {items.length === 0 && (
          <div className="py-20 text-center text-(--gray-400)">
            <Heart className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="text-[20px] font-semibold text-(--text-title) mb-1">
              Your wishlist is empty
            </p>
            <p className="text-[14px]">
              Browse the Course Catalog and save courses you&apos;re interested
              in.
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
