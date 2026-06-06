"use client";

import { useState } from "react";
import Image, { StaticImageData } from "next/image";
import { Star, Users, Pencil } from "lucide-react";
import PageHeader from "@/components/dashboard/instructor/page-header";
import SearchFilterBar from "@/components/dashboard/instructor/search-filter-bar";
import { Pagination } from "@/components/common/pagination";
import img1 from "@/assets/images/popular-courses/image1.webp";
import img2 from "@/assets/images/popular-courses/image2.webp";
import img3 from "@/assets/images/popular-courses/image3.webp";
import img4 from "@/assets/images/popular-courses/image4.webp";
import img5 from "@/assets/images/popular-courses/image5.webp";
import img6 from "@/assets/images/popular-courses/image6.webp";

type Status = "Published" | "Drafting" | "In Review";

interface Course {
  id: number;
  title: string;
  category: string;
  status: Status;
  students: number;
  rating: number;
  price: string;
  image: StaticImageData;
}

const allCourses: Course[] = [
  {
    id: 1,
    title: "Figma UI/UX Design Essential",
    category: "Creative Direction",
    status: "Published",
    students: 87398,
    rating: 4.7,
    price: "$16.99",
    image: img1,
  },
  {
    id: 2,
    title: "Figma UI UX Design Advanced",
    category: "Creative Direction",
    status: "Published",
    students: 87398,
    rating: 4.7,
    price: "$19.99",
    image: img2,
  },
  {
    id: 3,
    title: "Adobe Premier Pro CC Advanced",
    category: "Creative Direction",
    status: "Published",
    students: 87398,
    rating: 4.7,
    price: "$22.99",
    image: img3,
  },
  {
    id: 4,
    title: "UX Case Study Advanced",
    category: "Creative Direction",
    status: "Drafting",
    students: 87398,
    rating: 4.7,
    price: "$40.99",
    image: img4,
  },
  {
    id: 5,
    title: "UX Resume Builder fo Marketplace",
    category: "Creative Direction",
    status: "In Review",
    students: 87398,
    rating: 4.7,
    price: "$12.99",
    image: img5,
  },
  {
    id: 6,
    title: "Figma Design System",
    category: "Creative Direction",
    status: "Published",
    students: 87398,
    rating: 4.7,
    price: "$129.00",
    image: img6,
  },
  {
    id: 7,
    title: "UI/UX Design Basic (Figma)",
    category: "Creative Direction",
    status: "Published",
    students: 87398,
    rating: 4.7,
    price: "$27.99",
    image: img1,
  },
  {
    id: 8,
    title: "Product Design Real Project",
    category: "Creative Direction",
    status: "In Review",
    students: 87398,
    rating: 4.7,
    price: "$56.00",
    image: img2,
  },
  {
    id: 9,
    title: "UX Research Fundamentals",
    category: "Creative Direction",
    status: "Published",
    students: 87398,
    rating: 4.7,
    price: "$34.99",
    image: img3,
  },
  {
    id: 10,
    title: "Design Systems at Scale",
    category: "Creative Direction",
    status: "Drafting",
    students: 87398,
    rating: 4.7,
    price: "$49.99",
    image: img4,
  },
];

const statusStyle: Record<Status, string> = {
  Published: "bg-[#D0FAE5] text-[#007A55]",
  Drafting: "bg-[#E5E7EB] text-[#6A7282]",
  "In Review": "bg-[#FFF5C4] text-[#8F4300]",
};

const STATUS_OPTIONS = ["All Status", "Published", "Drafting", "In Review"];
const ITEMS_PER_PAGE = 8;

export default function MyCoursePage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatus] = useState("All Status");
  const [page, setPage] = useState(1);

  const filtered = allCourses.filter((c) => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === "All Status" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );


  return (
    <div className="space-y-5">
      <PageHeader
        title="My Courses"
        subtitle="6 active courses, 1 currently in review."
        buttonLabel="Create New Course"
      />

      <SearchFilterBar
        searchPlaceholder="search courses..."
        filterOptions={STATUS_OPTIONS}
        searchValue={search}
        filterValue={statusFilter}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        onFilterChange={(v) => {
          setStatus(v);
          setPage(1);
        }}
      />

      {/* Course Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {paginated.map((course) => (
          <div
            key={course.id}
            className="bg-white rounded-2xl border border-(--gray-200) overflow-hidden flex flex-col hover:shadow-md transition-shadow"
          >
            {/* Thumbnail */}
            <div className="relative">
              <Image
                src={course.image}
                alt={course.title}
                className="w-full h-42.5 object-cover"
              />
              <span className="absolute top-3 left-3 bg-[rgba(3,7,18,0.59)] text-white text-[12px] font-medium px-2 py-1 rounded-full backdrop-blur-sm">
                {course.category}
              </span>
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col flex-1 gap-2">
              <span
                className={`self-start text-[12px] font-medium px-2.5 py-1 rounded-full ${statusStyle[course.status]}`}
              >
                {course.status}
              </span>

              <p className="text-[14px] lg:text-[16px] font-semibold text-(--text-title) leading-snug line-clamp-2">
                {course.title}
              </p>

              <div className="flex items-center gap-3 text-[12px] text-[#4e4758] font-normal">
                <span className="flex items-center gap-2">
                  <Users className="w-3.75 h-3.75" />
                  {course.students.toLocaleString()} Students
                </span>
                <span className="flex items-center gap-2">
                  <Star className="w-3.75 h-3.75 text-(--warning-500) fill-(--warning-500)" />
                  {course.rating}
                </span>
              </div>

              <div className="border border-(--gray-200) mt-4 mb-4 border-dashed"></div>
              <div className="flex items-center justify-between mt-auto pt-2 ">
                <span className="lg:text-[14px] text-[12px]  font-semibold text-(--text-title)">
                  {course.price}
                </span>
                <div className="flex items-center gap-3">
                  <button className="text-[12px]  cursor-pointer text-(--primary-600) font-normal hover:underline">
                    View Details
                  </button>
                  <button className="flex items-center gap-1 text-[12px] font-normal h-6 p-1.5 rounded-sm bg-(--gray-100)   text-(--text-paragraph) hover:text-(--text-title) transition-colors">
                    <Pencil className="w-3 h-3" /> Edit
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
