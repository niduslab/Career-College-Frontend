import { MoreHorizontal, ArrowUpRight } from "lucide-react";

const courses = [
  {
    title: "Mastering UI/UX Design",
    category: "Creative Direction",
    students: 842,
    revenue: "$12,450",
    status: "Published",
    color: "bg-(--primary-100)",
    initial: "M",
  },
  {
    title: "AI Agents Course",
    category: "Software",
    students: 160,
    revenue: "$5,810",
    status: "Published",
    color: "bg-[#e8f4ff]",
    initial: "A",
  },
  {
    title: "Full Stack Web Development",
    category: "Creative Direction",
    students: 130,
    revenue: "$0.00",
    status: "Drafting",
    color: "bg-(--gray-100)",
    initial: "F",
  },
  {
    title: "Automated Digital Marketing",
    category: "Creative Direction",
    students: 216,
    revenue: "$4,210",
    status: "Published",
    color: "bg-[#fff8e6]",
    initial: "A",
  },
];

const statusStyles: Record<string, string> = {
  Published: "bg-[#eaf7f0] text-(--success-500)",
  Drafting: "bg-(--gray-100) text-(--gray-500)",
};

export default function TopCoursesTable() {
  return (
    <div className="bg-white rounded-xl border border-(--gray-200) p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[14px] font-semibold text-(--text-title)">Top Performing Courses</h3>
        <button className="text-[12px] text-(--primary-600) font-medium flex items-center gap-1 hover:underline">
          View all <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-(--gray-100)">
              {["Course", "Students", "Revenue", "Status", "Action"].map((h) => (
                <th
                  key={h}
                  className="text-left text-[11px] font-semibold text-(--gray-400) uppercase tracking-wider pb-3 pr-4 last:pr-0"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {courses.map((c, i) => (
              <tr key={i} className="border-b border-(--gray-50) last:border-0">
                <td className="py-3.5 pr-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg ${c.color} flex items-center justify-center shrink-0`}>
                      <span className="text-[13px] font-bold text-(--gray-600)">{c.initial}</span>
                    </div>
                    <div>
                      <p className="text-[13px] font-medium text-(--text-title) leading-tight">{c.title}</p>
                      <p className="text-[11px] text-(--gray-400)">{c.category}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3.5 pr-4 text-[13px] text-(--gray-600)">{c.students}</td>
                <td className="py-3.5 pr-4 text-[13px] font-medium text-(--text-title)">{c.revenue}</td>
                <td className="py-3.5 pr-4">
                  <span className={`inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full ${statusStyles[c.status]}`}>
                    {c.status}
                  </span>
                </td>
                <td className="py-3.5">
                  <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-(--gray-100) transition-colors">
                    <MoreHorizontal className="w-4 h-4 text-(--gray-400)" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile card list */}
      <div className="md:hidden space-y-3">
        {courses.map((c, i) => (
          <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-(--gray-100)">
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-9 h-9 rounded-lg ${c.color} flex items-center justify-center shrink-0`}>
                <span className="text-[13px] font-bold text-(--gray-600)">{c.initial}</span>
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-(--text-title) leading-tight truncate">{c.title}</p>
                <p className="text-[11px] text-(--gray-400)">{c.category}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[11px] text-(--gray-500)">{c.students} students</span>
                  <span className="text-[11px] font-medium text-(--text-title)">{c.revenue}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-2">
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${statusStyles[c.status]}`}>
                {c.status}
              </span>
              <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-(--gray-100) transition-colors">
                <MoreHorizontal className="w-4 h-4 text-(--gray-400)" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
