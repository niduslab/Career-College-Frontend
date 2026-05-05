"use client";
import Image from "next/image";
import { Clock, BarChart3, CirclePlay, Medal } from "lucide-react";
import image from "@/assets/images/courses-details/image.webp";

const INFO_ITEMS = [
  { icon: CirclePlay, label: "Total 92 Videos" },
  { icon: Clock, label: "Duration 10 hours 45 min" },
  { icon: BarChart3, label: "Intermediate Level" },
  { icon: Medal, label: "Get Certificate" },
];

interface CourseInformationProps {
  hideImage?: boolean;
}

export default function PartnerCourseDetailsInformation({
  hideImage = false,
}: CourseInformationProps) {
  return (
    <div className="sticky top-24 rounded-2xl w-full lg:w-90 xl:w-90 bg-white shadow-md overflow-hidden">
      {/* Cover image */}
      {!hideImage && (
        <div className="w-full h-75 relative rounded-t-2xl overflow-hidden">
          <Image src={image} alt="Course Cover" fill className="object-cover" />
        </div>
      )}

      <div className="p-5 pb-6">
        {/* Course info list */}
        <h3 className="font-semibold lg:sg-h5 sg-p-big mb-6 mt-3 --title-text">
          Course Information
        </h3>
        <ul className="space-y-2.5 lg:mt-6 mt-5 sg-p-default --text-paragraph mb-6">
          {INFO_ITEMS.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-2">
              <Icon size={20} className="text-gray-500 shrink-0" />
              {label}
            </li>
          ))}
        </ul>
        <div className="border mb-6 mt-4"></div>

        {/* Price */}
        <div className="flex items-center justify-between mb-5">
          <span className="sg-p-default text-(--text-paragraph)">
            Price of This Course:
          </span>
          <span className="text-2xl font-semibold text-(--text-title)">
            $42.99
          </span>
        </div>

        {/* Add to Cart button */}
        <button className="w-full bg-(--primary-700) cursor-pointer text-white font-semibold py-3 rounded-lg transition-colors sg-p-default">
          Add to Cart
        </button>
      </div>
    </div>
  );
}
