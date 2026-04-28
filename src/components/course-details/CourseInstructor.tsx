import logo from "@/assets/images/courses-details/logo.webp";
import Image from "next/image";
import { Users, Star, BarChart2, BookOpen, PlayCircle } from "lucide-react";

const STATS = [
  { icon: Users, label: "885,935 Students" },
  { icon: Star, label: "278,376 Reviews" },
  { icon: BarChart2, label: "4.7 Ratings" },
  { icon: PlayCircle, label: "38 Courses" },
];

export default function CourseInstructor() {
  return (
    <div className="lg:mt-10 mt-6">
      <h2 className="sg-h5 font-semibold --title-text mb-4">
        Course Instructor
      </h2>

      <div className="rounded-2xl   border-gray-200 p-6 flex items-center gap-5 shadow-sm">
        <Image
          src={logo}
          alt="Daniel Walter Scott"
          width={100}
          height={100}
          className="w-25 h-25 rounded-full object-cover shrink-0"
        />
        <div>
          <h3 className="font-medium --text-title  sg-p-big mb-3">
            Daniel Walter Scott
          </h3>
          <div className="grid grid-cols-1 gap-x-6 gap-y-1">
            {STATS.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 sg-caption font-normal text-sm --text-paragraph"
              >
                <Icon size={16} className="text-gray-500 shrink-0" />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
