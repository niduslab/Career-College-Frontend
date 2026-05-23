import { DollarSign, Users, BookOpen, Star } from "lucide-react";

const stats = [
  {
    label: "Total Revenue",
    value: "$24,802",
    change: "+12.5% vs last month",
    changeType: "up",
    icon: DollarSign,
    iconBg: "bg-[var(--primary-50)]",
    iconColor: "text-[var(--primary-600)]",
  },
  {
    label: "Total Students",
    value: "1,420",
    change: "+4.2% new enrollments vs last month",
    changeType: "up",
    icon: Users,
    iconBg: "bg-[#eaf7f0]",
    iconColor: "text-[var(--success-500)]",
  },
  {
    label: "Active Course",
    value: "06",
    change: "+2 this month · 4 published · 2 drafts",
    changeType: "up",
    icon: BookOpen,
    iconBg: "bg-[#e8f4ff]",
    iconColor: "text-[#3b82f6]",
  },
  {
    label: "Avg. Rating",
    value: "4.92",
    change: "(204 reviews)",
    changeType: "neutral",
    icon: Star,
    iconBg: "bg-[#fff8e6]",
    iconColor: "text-[var(--warning-500)]",
    stars: true,
  },
];

export default function StatsCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="bg-white rounded-xl p-5 border border-(--gray-200) flex flex-col gap-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[12px] text-(--gray-500) font-medium mb-1">
                  {stat.label}
                </p>
                <p className="text-[26px] font-bold text-(--text-title) leading-none">
                  {stat.value}
                </p>
              </div>
              <div
                className={`w-10 h-10 rounded-lg ${stat.iconBg} flex items-center justify-center shrink-0`}
              >
                <Icon className={`w-5 h-5 ${stat.iconColor}`} />
              </div>
            </div>

            {stat.stars ? (
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <svg
                    key={i}
                    className="w-3.5 h-3.5 text-(--warning-500) fill-current"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                <span className="text-[12px] text-(--gray-500) ml-1">
                  {stat.change}
                </span>
              </div>
            ) : (
              <p
                className={`text-[12px] font-medium ${
                  stat.changeType === "up"
                    ? "text-(--success-500)"
                    : "text-(--gray-500)"
                }`}
              >
                {stat.changeType === "up" && "↑ "}
                {stat.change}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
