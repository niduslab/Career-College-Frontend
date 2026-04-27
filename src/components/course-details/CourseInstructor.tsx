import logo from "@/assets/images/courses-details/logo.webp";
import Image from "next/image";

export default function CourseInstructor() {
  return (
    <div>
      <h2 className="text-lg font-bold text-gray-900 mb-3">
        Course Instructor
      </h2>

      <div className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4 shadow-sm">
        <Image
          src={logo}
          alt="Daniel Walter Scott"
          width={72}
          height={72}
          className="w-[72px] h-[72px] rounded-full object-cover flex-shrink-0"
        />
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">
            Daniel Walter Scott
          </h3>
          <div className="flex flex-col gap-1 text-sm text-gray-500">
            <span>885,935 Students</span>
            <span>29,376 Reviews</span>
            <span>4.7 Ratings</span>
            <span>38 Courses</span>
          </div>
        </div>
      </div>
    </div>
  );
}
