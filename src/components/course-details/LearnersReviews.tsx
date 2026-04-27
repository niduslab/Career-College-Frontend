import Image from "next/image";
import { Star } from "lucide-react";
import comaSvg  from "@/assets/images/testimonials/Coma.svg";
import avatar1  from "@/assets/images/hero/avatar1.webp";
import avatar2  from "@/assets/images/hero/avatar2.webp";
import avatar3  from "@/assets/images/hero/avatar3.webp";

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
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-gray-900">Learners Reviews</h2>
        <a href="#" className="text-sm font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1 transition-colors">
          Show all reviews <span aria-hidden>→</span>
        </a>
      </div>

      {/* 2×2 review grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {REVIEWS.map((review, i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4"
          >
            {/* Quote mark */}
            <Image src={comaSvg} alt="" width={32} height={24} className="opacity-80" />

            {/* Review text */}
            <p className="text-sm text-gray-600 leading-relaxed flex-1">
              {review.text}
            </p>

            {/* Reviewer */}
            <div className="flex items-center gap-3 pt-1">
              <Image
                src={review.avatar}
                alt={review.name}
                width={40}
                height={40}
                className="w-10 h-10 rounded-full object-cover shrink-0"
              />
              <div>
                <p className="text-sm font-semibold text-gray-900">{review.name}</p>
                <div className="flex items-center gap-0.5 mt-0.5">
                  {Array.from({ length: review.rating }).map((_, s) => (
                    <Star key={s} size={12} className="fill-orange-400 text-orange-400" />
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
