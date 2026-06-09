"use client";

import KpiCards from "./analytics/kpi-cards";
import WatchTimeChart from "./analytics/watch-time-chart";
import TrafficDonut from "./analytics/traffic-donut";
import CompletionFunnel from "./analytics/completion-funnel";
import TopCourses from "./analytics/top-courses";
import AiInsights from "./analytics/ai-insights";

export default function AnalyticsPageContent() {
  return (
    <div className="flex flex-col gap-4">
      <KpiCards />
      <div className="flex flex-col xl:flex-row gap-4">
        <WatchTimeChart />
        <TrafficDonut />
      </div>
      <CompletionFunnel />
      <TopCourses />
      {/* <AiInsights /> */}
    </div>
  );
}
