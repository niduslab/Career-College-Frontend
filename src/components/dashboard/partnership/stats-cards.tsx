import { Wallet, Handshake, Building2, TrendingUp, Star } from "lucide-react";

const stats = [
  {
    label: "Total Revenue",
    value: "$38,540",
    change: "+18.3% vs last month",
    changeType: "TrendingUp",
    icon: Wallet,
    iconBg: "bg-[var(--primary-50)]",
    iconColor: "text-[var(--primary-600)]",
    iconFill: false,
  },
  {
    label: "Active Partnerships",
    value: "24",
    change: "+3 new this month",
    changeType: "TrendingUp",
    icon: Handshake,
    iconBg: "bg-[var(--primary-50)]",
    iconColor: "text-[var(--primary-600)]",
    iconFill: false,
  },
  {
    label: "Organizations",
    value: "12",
    change: "+2 onboarded this quarter",
    changeType: "TrendingUp",
    icon: Building2,
    iconBg: "bg-[var(--primary-50)]",
    iconColor: "text-[var(--primary-600)]",
    iconFill: false,
  },
  {
    label: "Avg. Partner Rating",
    value: "4.87",
    change: "(96 reviews)",
    changeType: "neutral",
    icon: Star,
    iconBg: "bg-[var(--primary-50)]",
    iconColor: "text-[var(--primary-600)]",
    iconFill: true,
    stars: true,
  },
];

export default function PartnershipStatsCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="bg-white rounded-2xl p-4 border border-(--gray-200) flex flex-col gap-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[12px] text-[#4a5565] font-regular mb-2">
                  {stat.label}
                </p>
                <p className="lg:text-[24px] text-[20px] font-semibold text-(--text-title) leading-none">
                  {stat.value}
                </p>
              </div>
              <div
                className={`w-10 h-10 rounded-[6px_4px_6px_6px] ${stat.iconBg} flex items-center justify-center shrink-0`}
              >
                <Icon
                  className={`w-6 h-6 ${stat.iconColor}`}
                  fill={stat.iconFill ? "currentColor" : "none"}
                />
              </div>
            </div>
            <div className="border border-dashed border-gray-200 mt-4 mb-4"></div>
            {stat.stars ? (
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className="w-3.5 h-3.5 text-(--warning-500) fill-current"
                  />
                ))}
                <span className="text-[12px] text-(--gray-500) ml-1">
                  {stat.change}
                </span>
              </div>
            ) : (
              <p
                className={`text-[12px] font-medium flex items-center gap-1 ${
                  stat.changeType === "TrendingUp"
                    ? "text-(--success-500)"
                    : "text-[#4a5565]"
                }`}
              >
                {stat.changeType === "TrendingUp" && (
                  <TrendingUp className="w-4 h-4 shrink-0" />
                )}
                {stat.change}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
