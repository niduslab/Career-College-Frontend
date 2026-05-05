"use client";
import Image from "next/image";
import {
  Trash2,
  Star,
  Clock,
  MonitorPlay,
  Users,
  Clock3,
  CirclePlay,
} from "lucide-react";
import img1 from "@/assets/images/courses-details/image.webp";
import img2 from "@/assets/images/courses-details/image.webp";

interface CartItem {
  id: number;
  image: Parameters<typeof Image>[0]["src"];
  title: string;
  instructor: string;
  rating: number;
  reviews: number;
  enrolled: number;
  duration: string;
  lessons: number;
  price: number;
}

const INITIAL_ITEMS: CartItem[] = [
  {
    id: 1,
    image: img1,
    title: "Complete UI/UX Design Course 2026: Figma + Real Project",
    instructor: "Daniel Walter Scott",
    rating: 4.7,
    reviews: 46245,
    enrolled: 87398,
    duration: "10 hours 45 min",
    lessons: 92,
    price: 42.99,
  },
  {
    id: 2,
    image: img2,
    title: "Complete UI/UX Design Course 2026: Figma + Real Project",
    instructor: "Daniel Walter Scott",
    rating: 4.7,
    reviews: 46245,
    enrolled: 87398,
    duration: "10 hours 45 min",
    lessons: 92,
    price: 42.99,
  },
];

interface CartItemsProps {
  items: CartItem[];
  onRemove: (id: number) => void;
}

export type { CartItem };
export { INITIAL_ITEMS };

export default function CartItems({ items, onRemove }: CartItemsProps) {
  return (
    <div className="space-y-5">
      {items.map((item) => (
        <div
          key={item.id}
          className="bg-white rounded-2xl border border-gray-200 p-6 flex gap-4"
        >
          {/* Thumbnail */}
          <div className="shrink-0 w-36 h-24 md:w-44 md:h-28 rounded-xl overflow-hidden">
            <Image
              src={item.image}
              alt={item.title}
              width={182}
              height={141}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="sg-p-default lg:sg-h5 font-semibold text-[#12100e] leading-snug line-clamp-2">
                  {item.title}
                </h3>
                <p className="sg-caption text-(--text-paragraph) mt-2">
                  By {item.instructor}
                </p>
              </div>
              <span className="shrink-0 sg-p-default lg:sg-h6 font-semibold text-(--text-title)">
                ${item.price.toFixed(2)}
              </span>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-1 mt-3">
              <Star size={14} className="fill-[#FFA500] text-[#FFA500]" />
              <span className="sg-caption font-normal text-(--text-paragraph)">
                {item.rating}
              </span>
              <span className="sg-caption text-(--text-paragraph) underline cursor-pointer">
                ({item.reviews.toLocaleString()} Reviews)
              </span>
            </div>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 sg-caption text-(--text-paragraph)">
              <span className="flex items-center gap-1">
                <Users size={14} className="text-gray-500" />
                Enrolled {item.enrolled.toLocaleString()}
              </span>
              <span className="flex items-center gap-1">
                <Clock3 size={14} className="text-gray-500" />
                {item.duration}
              </span>
              <span className="flex items-center gap-1">
                <CirclePlay size={14} className="text-gray-500" />
                Total {item.lessons} Videos
              </span>
            </div>

            {/* Remove */}
            <div className="flex justify-end mt-2.5">
              <button
                onClick={() => onRemove(item.id)}
                className="flex items-center gap-1 sg-p-small text-(--danger-500)   cursor-pointer transition-colors"
              >
                <Trash2 size={16} />
                Remove
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
