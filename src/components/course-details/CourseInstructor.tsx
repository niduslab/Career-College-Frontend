import logo from "@/assets/images/courses-details/logo.webp";
import Image from "next/image";
import { Users, Star, BarChart2, BookOpen } from "lucide-react";

const STATS = [
  { icon: Users,     label: "885,935 Students" },
  { icon: Star,      label: "278,376 Reviews"  },
  { icon: BarChart2, label: "4.7 Ratings"      },
  { icon: BookOpen,  label: "38 Courses"       },
];

export default function CourseInstructor() {
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-4">Course Instructor</h2>

      <div className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-5 shadow-sm">
        <Image
          src={logo}
          alt="Daniel Walter Scott"
          width={80}
          height={80}
          className="w-20 h-20 rounded-full object-cover shrink-0"
        />
        <div>
          <h3 className="font-semibold text-gray-900 text-base mb-3">
            Daniel Walter Scott
          </h3>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
            {STATS.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-1.5 text-sm text-gray-500">
                <Icon size={14} className="text-gray-400 shrink-0" />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
