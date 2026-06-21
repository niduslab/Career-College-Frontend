import Image, { StaticImageData } from "next/image";
import { MoreHorizontal, ArrowUpRight } from "lucide-react";
import avatar1 from "@/assets/images/instructors/instructor1.webp";
import avatar2 from "@/assets/images/instructors/instructor2.webp";
import avatar3 from "@/assets/images/instructors/instructor3.webp";
import avatar4 from "@/assets/images/instructors/instructor4.webp";
import avatar5 from "@/assets/images/instructors/instructor5.webp";

const partnerships: {
  name: string;
  type: string;
  contacts: number;
  revenue: string;
  status: "Active" | "Pending" | "Inactive";
  avatar: StaticImageData;
}[] = [
  {
    name: "TechCorp International",
    type: "Enterprise",
    contacts: 8,
    revenue: "$14,200",
    status: "Active",
    avatar: avatar1,
  },
  {
    name: "Greenfield University",
    type: "Academic",
    contacts: 5,
    revenue: "$9,650",
    status: "Active",
    avatar: avatar2,
  },
  {
    name: "Apex Solutions",
    type: "SMB",
    contacts: 3,
    revenue: "$0.00",
    status: "Pending",
    avatar: avatar3,
  },
  {
    name: "NovaTech Partners",
    type: "Enterprise",
    contacts: 6,
    revenue: "$7,840",
    status: "Active",
    avatar: avatar4,
  },
  {
    name: "Bright Future NGO",
    type: "Non-profit",
    contacts: 2,
    revenue: "$1,200",
    status: "Inactive",
    avatar: avatar5,
  },
];

const statusStyles: Record<string, string> = {
  Active: "bg-[#eaf7f0] text-(--success-500)",
  Pending: "bg-[#fffbea] text-(--warning-500)",
  Inactive: "bg-(--gray-100) text-(--gray-500)",
};

const headers = ["Partner", "Type", "Contacts", "Revenue", "Status", "Action"];

export default function PartnershipsTable() {
  return (
    <div className="bg-white rounded-2xl border border-(--gray-200) overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4">
        <h3 className=" text-[16px] font-semibold text-(--text-title)">
          Active Partnerships
        </h3>
        <button className="text-[12px] text-(--primary-600) cursor-pointer font-medium flex items-center gap-1 hover:underline">
          View all <ArrowUpRight className="w-3 h-3" />
        </button>
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-150">
          <thead>
            <tr className="bg-(--primary-50)">
              {headers.map((h) => (
                <th
                  key={h}
                  className="text-left text-[14px] font-semibold text-(--text-paragraph) tracking-wider px-5 py-3 whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {partnerships.map((p, i) => (
              <tr
                key={i}
                className="border-b border-(--gray-100) last:border-0 hover:bg-(--gray-50) transition-colors"
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full overflow-hidden shrink-0">
                      <Image
                        src={p.avatar}
                        alt={p.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-[14px] font-medium text-(--text-title) leading-tight whitespace-nowrap">
                      {p.name}
                    </p>
                  </div>
                </td>

                <td className="px-5 py-4 text-[14px] text-(--text-paragraph) font-normal whitespace-nowrap">
                  {p.type}
                </td>

                <td className="px-5 py-4 text-[14px] text-(--text-paragraph) font-normal whitespace-nowrap">
                  {p.contacts}
                </td>

                <td className="px-5 py-4 text-[14px] text-(--text-paragraph) font-normal whitespace-nowrap">
                  {p.revenue}
                </td>

                <td className="px-5 py-4 whitespace-nowrap">
                  <span
                    className={`inline-block text-[12px] font-semibold px-3 py-1 rounded-full ${statusStyles[p.status]}`}
                  >
                    {p.status}
                  </span>
                </td>

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
