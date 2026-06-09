import RevenuePage from "@/components/dashboard/instructor/revenue-page";

export default function Page() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[20px] lg:text-[24px] font-semibold text-(--text-title)">
          Revenue
        </h1>
        <p className="text-[14px] text-(--gray-500) mt-0.5">
          Track your earnings, payouts and platform fees.
        </p>
      </div>
      <RevenuePage />
    </div>
  );
}
