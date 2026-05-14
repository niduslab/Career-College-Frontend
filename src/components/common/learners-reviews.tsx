import Image from "next/image";
import { ArrowRight, Star } from "lucide-react";
import comaSvg from "@/assets/images/testimonials/Coma.svg";
import avatar1 from "@/assets/images/hero/avatar1.webp";
import avatar2 from "@/assets/images/hero/avatar2.webp";
import avatar3 from "@/assets/images/hero/avatar3.webp";

const REVIEWS = [
  {
    text: "I started with zero knowledge in UI/UX design, and within 3 months, I landed my first freelance client. The course structure and mentorship were incredibly helpful.",
    name: "Nusrat Jahan",
    avatar: avatar1,
    rating: 5,
  },
  {
    text: "I started with zero knowledge in UI/UX design, and within 3 months, I landed my first freelance client. The course structure and mentorship were incredibly helpful.",
    name: "Nusrat Jahan",
    avatar: avatar2,
    rating: 5,
  },
  {
    text: "I started with zero knowledge in UI/UX design, and within 3 months, I landed my first freelance client. The course structure and mentorship were incredibly helpful.",
    name: "Nusrat Jahan",
    avatar: avatar3,
    rating: 5,
  },
  {
    text: "I started with zero knowledge in UI/UX design, and within 3 months, I landed my first freelance client. The course structure and mentorship were incredibly helpful.",
    name: "Nusrat Jahan",
    avatar: avatar1,
    rating: 5,
  },
];

export default function LearnersReviews() {
  return (
    <div className="mt-6 lg:mt-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="sg-h5 font-semibold --title-text mb-4">
          Learners Reviews
        </h2>
        <a
          href="#"
          className="sg-p-small underline font-semibold text-(--primary-700) transition-colors inline-flex items-center gap-1"
        >
          Show all reviews
          <ArrowRight size={20} color="#6f15ec" />
        </a>
      </div>

      {/* 2×2 review grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {REVIEWS.map((review, i) => (
          <div
            key={i}
            className="bg-gray-100 rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-4"
          >
            {/* Quote mark */}
            <span className="relative h-7 w-6.25">
              <Image
                src={comaSvg}
                alt=""
                fill
                sizes="25px"
                className="object-contain"
              />
            </span>

            {/* Review text */}
            <p className="sg-p-default --title-text font-normal leading-relaxed flex-1">
              {review.text}
            </p>

            {/* Reviewer */}
            <div className="flex items-center gap-3 pt-1">
              <Image
                src={review.avatar}
                alt={review.name}
                width={48}
                height={48}
                className="w-12 h-12 rounded-full object-cover shrink-0"
              />
              <div>
                <p className="sg-h6 font-semibold --text-title">
                  {review.name}
                </p>
                <div className="flex items-center gap-0.5 mt-0.5">
                  {Array.from({ length: review.rating }).map((_, s) => (
                    <Star
                      key={s}
                      size={16}
                      className="text-(--warning-500) fill-(--warning-500)"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
