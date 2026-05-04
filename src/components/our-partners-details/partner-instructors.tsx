"use client";
import { useCallback, useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";

import image1 from "@/assets/images/instructors/image1.webp";
import image2 from "@/assets/images/instructors/image2.webp";
import image3 from "@/assets/images/instructors/image3.webp";
import image4 from "@/assets/images/instructors/image4.webp";
import instructor1 from "@/assets/images/instructors/instructor1.webp";
import instructor2 from "@/assets/images/instructors/instructor2.webp";
import instructor3 from "@/assets/images/instructors/instructor3.webp";
import instructor4 from "@/assets/images/instructors/instructor4.webp";
import instructor5 from "@/assets/images/instructors/instructor5.webp";
import instructor6 from "@/assets/images/instructors/instructor6.webp";

const INSTRUCTORS = [
  {
    name: "Aije Egwaikhide",
    role: "Senior Data Scientist",
    image: instructor1,
  },
  { name: "Alex Aklson", role: "Ph.D. Data Scientist", image: instructor2 },
  { name: "Artem Arutyunov", role: "Aije Egwaikhide", image: instructor3 },
  { name: "Bethany Hudnutt", role: "Learning Consultant", image: instructor4 },
  { name: "Alex Parker", role: "Cloud Kubernetes Service", image: instructor5 },
  { name: "Abhishek Gagneja", role: "Python & AI Expert", image: instructor6 },
  { name: "Zubair Mahmud", role: "Sr. UI/UX Designer", image: image1 },
  { name: "Mahmudul Karim", role: "Full-Stack Developer", image: image2 },
  { name: "Rafia Siddique", role: "Digital Marketing Expert", image: image3 },
  { name: "Saif Islam", role: "Sr. Python & AI Expert", image: image4 },
];

const VISIBLE = 6;

export default function PartnerInstructors() {
  const [index, setIndex] = useState(0);
  const [activeBtn, setActiveBtn] = useState<"prev" | "next" | null>(null);

  const maxIndex = INSTRUCTORS.length - VISIBLE;

  const next = useCallback(() => {
    setIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    setActiveBtn("next");
  }, [maxIndex]);

  const prev = useCallback(() => {
    setIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
    setActiveBtn("prev");
  }, [maxIndex]);

  const visible = INSTRUCTORS.slice(index, index + VISIBLE);

  return (
    <section className="mx-auto bg-white max-w-7xl px-4 md:px-6 lg:px-8 lg:mb-25 mb-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 md:mb-10">
        <h2 className="text-[24px] md:text-[32px] font-semibold tracking-tight text-(--text-title)">
          Instructors
        </h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={prev}
            aria-label="Previous"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border transition-all duration-200 cursor-pointer"
            style={
              activeBtn === "prev"
                ? {
                    background: "var(--primary-700)",
                    borderColor: "var(--primary-700)",
                    color: "#fff",
                  }
                : {
                    background: "#fff",
                    borderColor: "#e5e7eb",
                    color: "#4b5563",
                  }
            }
          >
            <ArrowLeft size={18} />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Next"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border transition-all duration-200 cursor-pointer"
            style={
              activeBtn === "next"
                ? {
                    background: "var(--primary-700)",
                    borderColor: "var(--primary-700)",
                    color: "#fff",
                  }
                : {
                    background: "#fff",
                    borderColor: "#e5e7eb",
                    color: "#4b5563",
                  }
            }
          >
            <ArrowRight size={18} />
          </button>
        </div>
      </div>

      {/* Slider */}
      <div className="overflow-hidden">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 transition-all duration-500">
          {visible.map((instructor, i) => (
            <div
              key={`${instructor.name}-${index + i}`}
              className="flex flex-col items-center border border-gray-100 rounded-2xl p-4 bg-white hover:shadow-md transition-shadow"
            >
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-100 shrink-0">
                <Image
                  src={instructor.image}
                  alt={instructor.name}
                  width={88}
                  height={88}
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <h3 className="mt-4 text-center sg-p-small font-semibold text-(--text-title) leading-snug">
                {instructor.name}
              </h3>
              <p className="mt-1 text-center sg-caption text-(--gray-500)">
                {instructor.role}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Dot indicators */}
      <div className="mt-6 flex justify-center gap-1.5">
        {Array.from({ length: maxIndex + 1 }).map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIndex(i)}
            className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
              i === index
                ? "w-6 bg-(--primary-700)"
                : "w-1.5 bg-gray-300 hover:bg-gray-400"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
