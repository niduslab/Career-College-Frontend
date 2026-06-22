import { ArrowUpRight } from "lucide-react";
import Image, { StaticImageData } from "next/image";
import avatar1 from "@/assets/images/instructors/instructor1.webp";
import avatar2 from "@/assets/images/instructors/instructor2.webp";
import avatar3 from "@/assets/images/instructors/instructor3.webp";
import avatar4 from "@/assets/images/instructors/instructor4.webp";

type PipelineStatus = "Draft" | "Pending" | "Approved" | "Rejected";

interface PipelineItem {
  title: string;
  org: string;
  avatar: StaticImageData;
  value: string;
  status: PipelineStatus;
  days: number;
}

const PIPELINE: PipelineItem[] = [
  {
    title: "Enterprise Training 2026",
    org: "TechCorp International",
    avatar: avatar1,
    value: "$18,500",
    status: "Approved",
    days: 0,
  },
  {
    title: "Academic Certification",
    org: "Greenfield University",
    avatar: avatar2,
    value: "$7,200",
    status: "Pending",
    days: 3,
  },
  {
    title: "SMB Skills Bundle",
    org: "Apex Solutions",
    avatar: avatar3,
    value: "$3,400",
    status: "Rejected",
    days: 0,
  },
  {
    title: "FinTech Leadership Dev.",
    org: "NovaTech Partners",
    avatar: avatar4,
    value: "$12,000",
    status: "Draft",
    days: 7,
  },
];

const STATUS_STYLE: Record<PipelineStatus, string> = {
  Approved: "text-emerald-600 bg-emerald-50 border-emerald-200",
  Pending: "text-orange-500 bg-orange-50 border-orange-200",
  Rejected: "text-red-500 bg-red-50 border-red-200",
  Draft: "text-gray-500 bg-gray-50 border-gray-200",
};

const COLS: Record<PipelineStatus, PipelineItem[]> = {
  Draft: PIPELINE.filter((p) => p.status === "Draft"),
  Pending: PIPELINE.filter((p) => p.status === "Pending"),
  Approved: PIPELINE.filter((p) => p.status === "Approved"),
  Rejected: PIPELINE.filter((p) => p.status === "Rejected"),
};

const COL_HEADER: Record<PipelineStatus, string> = {
  Draft: "bg-gray-50 text-gray-500",
  Pending: "bg-orange-50 text-orange-500",
  Approved: "bg-emerald-50 text-emerald-600",
  Rejected: "bg-red-50 text-red-500",
};

export default function ProposalsPipeline() {
  return (
    <div className="bg-white rounded-2xl border border-(--gray-200) px-5 py-4">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[14px] lg:text-[16px] font-semibold text-(--text-title)">
          Proposals Pipeline
        </p>
        <button
          type="button"
          className="text-[12px] text-(--primary-600) font-medium flex items-center gap-0.5 hover:underline cursor-pointer"
        >
          View all <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {(["Draft", "Pending", "Approved", "Rejected"] as PipelineStatus[]).map(
          (col) => (
            <div key={col} className="space-y-2">
              {/* Column header */}
              <div
                className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg ${COL_HEADER[col]}`}
              >
                <span className="text-[11px] font-semibold uppercase tracking-wider">
                  {col}
                </span>
                <span className="text-[11px] font-bold">
                  {COLS[col].length}
                </span>
              </div>
              {/* Cards */}
              <div className="space-y-2">
                {COLS[col].length === 0 ? (
                  <div className="border border-dashed border-(--gray-200) rounded-xl px-3 py-4 text-center">
                    <p className="text-[11px] text-(--gray-400)">
                      No proposals
                    </p>
                  </div>
                ) : (
                  COLS[col].map((item) => (
                    <div
                      key={item.title}
                      className="border border-(--gray-200) rounded-xl p-3 space-y-2.5 hover:border-(--primary-200) hover:shadow-sm transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-6 h-6 rounded-full overflow-hidden shrink-0">
                          <Image
                            src={item.avatar}
                            alt={item.org}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <p className="text-[11px] text-(--gray-500) truncate">
                          {item.org}
                        </p>
                      </div>
                      <p className="text-[12px] font-semibold text-(--text-title) leading-snug line-clamp-2">
                        {item.title}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] font-bold text-(--text-title)">
                          {item.value}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${STATUS_STYLE[item.status]}`}
                        >
                          {item.status}
                        </span>
                      </div>
                      {/* {item.days > 0 && (
                      <p className="text-[10px] text-orange-500 font-medium">⚠ Expires in {item.days}d</p>
                    )} */}
                    </div>
                  ))
                )}
              </div>
            </div>
          ),
        )}
      </div>
    </div>
  );
}
