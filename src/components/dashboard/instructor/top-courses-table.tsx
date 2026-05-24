import Image, { StaticImageData } from "next/image";
import { MoreHorizontal, ArrowUpRight } from "lucide-react";
import img1 from "@/assets/images/popular-courses/image1.webp";
import img2 from "@/assets/images/popular-courses/image2.webp";
import img3 from "@/assets/images/popular-courses/image3.webp";
import img4 from "@/assets/images/popular-courses/image4.webp";

const courses: {
  title: string;
  category: string;
  students: number;
  revenue: string;
  status: "Published" | "Drafting";
  image: StaticImageData;
}[] = [
  {
    title: "Mastering UI/UX Design",
    category: "Creative Direction",
    students: 10,
    revenue: "$12,450",
    status: "Published",
    image: img1,
  },
  {
    title: "AI Agents Course",
    category: "Software",
    students: 5,
    revenue: "$5,810",
    status: "Published",
    image: img2,
  },
  {
    title: "Full Stack Web Development",
    category: "Creative Direction",
    students: 2,
    revenue: "$0.00",
    status: "Drafting",
    image: img3,
  },
  {
    title: "Automated Digital Marketing",
    category: "Creative Direction",
    students: 1,
    revenue: "$4,210",
    status: "Published",
    image: img4,
  },
];

const statusStyles: Record<string, string> = {
  Published: "bg-[#eaf7f0] text-(--success-500)",
  Drafting: "bg-(--gray-100) text-(--gray-500)",
};

const headers = ["Course", "Students", "Revenue", "Status", "Action"];

export default function TopCoursesTable() {
  return (
    <div className="bg-white rounded-2xl border border-(--gray-200) overflow-hidden">
      {/* Title row */}
      <div className="flex items-center justify-between px-5 py-4">
        <h3 className="text-[14px] lg:text-[16px] font-semibold text-(--text-title)">
          Top Performing Courses
        </h3>
        <button className="text-[12px] text-(--primary-600) font-medium flex items-center gap-1 hover:underline">
          View all <ArrowUpRight className="w-3 h-3" />
        </button>
      </div>

      {/* Responsive table — horizontal scroll on small screens */}
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-150">
          <thead>
            <tr className="bg-(--primary-50)">
              {headers.map((h) => (
                <th
                  key={h}
                  className="text-left text-[14px] font-semibold text-(--text-paragraph)   tracking-wider px-5 py-3 whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {courses.map((c, i) => (
              <tr
                key={i}
                className="border-b border-(--gray-100) last:border-0 hover:bg-(--gray-50) transition-colors"
              >
                {/* Course */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-sm overflow-hidden shrink-0">
                      <Image
                        src={c.image}
                        alt={c.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-[14px] font-medium text-(--text-title) leading-tight whitespace-nowrap">
                        {c.title}
                      </p>
                      <p className="text-[12px] text-(--text-paragraph) font-normal mt-0.5">
                        {c.category}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Students */}
                <td className="px-5 py-4 text-[14px] text-(--text-paragraph) font-normal whitespace-nowrap">
                  {c.students}
                </td>

                {/* Revenue */}
                <td className="px-5 py-4 text-[14px] text-(--text-paragraph) font-normal whitespace-nowrap">
                  {c.revenue}
                </td>

                {/* Status */}
                <td className="px-5 py-4 whitespace-nowrap">
                  <span
                    className={`inline-block text-[12px] font-semibold px-3 py-1 rounded-full ${statusStyles[c.status]}`}
                  >
                    {c.status}
                  </span>
                </td>

                {/* Action */}
                <td className="px-5 py-4">
                  <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-(--gray-100) transition-colors">
                    <MoreHorizontal className="w-4 h-4 text-(--gray-400)" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
