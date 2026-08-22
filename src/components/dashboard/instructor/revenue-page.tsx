"use client";

import { useMemo, useRef, useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Download,
  Wallet,
  CircleDollarSign,
  CalendarDays,
  ChevronDown,
  BookOpen,
  Loader2,
  Landmark,
} from "lucide-react";
import {
  useInstructorRevenueSummary,
  useInstructorOrders,
} from "@/hooks/use-instructor-revenue";
import type {
  InstructorCourseOption,
  OrderRow,
  OrderSort,
  RevenueTrendPoint,
} from "@/lib/instructor-revenue-api";
import { Pagination } from "@/components/common/pagination";
import { SearchableDropdown } from "@/components/dashboard/common/searchable-dropdown";

const PAGE_SIZE = 10;

const SORT_OPTIONS: { value: OrderSort; label: string }[] = [
  { value: "-paid_at", label: "Newest first" },
  { value: "paid_at", label: "Oldest first" },
  { value: "-amount", label: "Highest amount" },
  { value: "amount", label: "Lowest amount" },
];

function formatMoney(amount: string | number, currency: string): string {
  const n = typeof amount === "string" ? parseFloat(amount) : amount;
  return `${currency} ${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatPeriodLabel(
  period: string,
  granularity: "monthly" | "weekly",
): string {
  // period is "YYYY-MM" (monthly) or "YYYY-Www" (weekly) from build_value_series.
  if (granularity === "weekly") return period.replace(/^\d{4}-/, "");
  const [y, m] = period.split("-");
  const date = new Date(Number(y), Number(m) - 1, 1);
  return date.toLocaleDateString(undefined, { month: "short" });
}

function GrowthBadge({ pct }: { pct: number | null }) {
  if (pct === null) {
    return (
      <p className="text-[12px] text-(--gray-400)">No prior data to compare</p>
    );
  }
  const up = pct >= 0;
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <p
      className={`text-[12px] font-medium flex items-center gap-1 ${up ? "text-(--success-500)" : "text-(--danger-500)"}`}
    >
      <Icon className="w-4 h-4 shrink-0" />
      {up ? "+" : ""}
      {pct}% vs previous period
    </p>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  children,
}: {
  label: string;
  value: string;
  icon: typeof Wallet;
  children?: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-(--gray-200) flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[12px] text-(--gray-500) font-normal mb-2">
            {label}
          </p>
          <p className="lg:text-[24px] text-[20px] font-semibold text-(--text-title) leading-none">
            {value}
          </p>
        </div>
        <div className="w-10 h-10 xl:w-8 xl:h-8 rounded-[6px_4px_6px_6px] bg-(--primary-50) flex items-center justify-center shrink-0">
          <Icon className="w-6 h-6 xl:w-5 xl:h-5 text-(--primary-600)" />
        </div>
      </div>
      <div className="border border-dashed border-(--gray-200)" />
      <div className="space-y-1">{children}</div>
    </div>
  );
}

// Real, data-driven line chart. Renders whatever the backend's zero-filled
// trend series returns — no seed data, no fixed 6-month shape.
const PAD = { top: 20, right: 16, bottom: 32, left: 56 };

function RevenueChart({
  points,
  granularity,
  currency,
}: {
  points: RevenueTrendPoint[];
  granularity: "monthly" | "weekly";
  currency: string;
}) {
  const W = 900;
  const H = 240;
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const [hovered, setHovered] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const maxVal = Math.max(1, ...points.map((p) => p.value));
  const pts = points.map((p, i) => ({
    x:
      PAD.left +
      (points.length > 1 ? (i / (points.length - 1)) * innerW : innerW / 2),
    y: PAD.top + innerH - (p.value / maxVal) * innerH,
    ...p,
  }));

  function smooth(list: { x: number; y: number }[]) {
    if (list.length < 2) return "";
    let d = `M ${list[0].x} ${list[0].y}`;
    for (let i = 0; i < list.length - 1; i++) {
      const p0 = list[Math.max(i - 1, 0)];
      const p1 = list[i];
      const p2 = list[i + 1];
      const p3 = list[Math.min(i + 2, list.length - 1)];
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return d;
  }

  const linePath = pts.length > 1 ? smooth(pts) : "";
  const areaPath =
    pts.length > 1
      ? `${linePath} L ${pts[pts.length - 1].x} ${PAD.top + innerH} L ${pts[0].x} ${PAD.top + innerH} Z`
      : "";

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(maxVal * f));

  function handleMouseMove(e: React.MouseEvent<SVGSVGElement>) {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const scaleX = W / rect.width;
    const svgX = (e.clientX - rect.left) * scaleX;
    let closest = 0;
    let minDist = Infinity;
    pts.forEach((pt, i) => {
      const dist = Math.abs(pt.x - svgX);
      if (dist < minDist) {
        minDist = dist;
        closest = i;
      }
    });
    setHovered(closest);
  }

  const hp = hovered !== null ? pts[hovered] : null;
  const TT_W = 130;
  const tooltipX = hp
    ? Math.min(Math.max(hp.x - TT_W / 2, PAD.left), PAD.left + innerW - TT_W)
    : 0;
  const tooltipY = hp ? Math.max(hp.y - 52, PAD.top) : 0;

  const allZero = points.every((p) => p.value === 0);

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto cursor-crosshair"
        preserveAspectRatio="none"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHovered(null)}
      >
        <defs>
          <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {yTicks.map((tick, i) => {
          const y = PAD.top + innerH - (tick / maxVal) * innerH;
          return (
            <g key={i}>
              <line
                x1={PAD.left}
                y1={y}
                x2={PAD.left + innerW}
                y2={y}
                stroke="#e5e7eb"
                strokeWidth="1"
                strokeDasharray="5 4"
              />
              <text
                x={PAD.left - 8}
                y={y + 4}
                textAnchor="end"
                fontSize="14"
                fill="#9ca3af"
              >
                {tick >= 1000 ? `${Math.round(tick / 1000)}k` : tick}
              </text>
            </g>
          );
        })}

        {pts.map((pt) => (
          <text
            key={pt.period}
            x={pt.x}
            y={H - 8}
            textAnchor="middle"
            fontSize="14"
            fill="#9ca3af"
          >
            {formatPeriodLabel(pt.period, granularity)}
          </text>
        ))}

        {areaPath && <path d={areaPath} fill="url(#revenueGrad)" />}
        {linePath && (
          <path
            d={linePath}
            fill="none"
            stroke="#7c3aed"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {hp && (
          <line
            x1={hp.x}
            y1={PAD.top}
            x2={hp.x}
            y2={PAD.top + innerH}
            stroke="#7c3aed"
            strokeWidth="1"
            strokeDasharray="3 3"
            opacity="0.5"
          />
        )}
        {hp && (
          <circle
            cx={hp.x}
            cy={hp.y}
            r="5"
            fill="white"
            stroke="#7c3aed"
            strokeWidth="2"
          />
        )}
        {hovered === null &&
          pts.map((pt) => (
            <circle
              key={pt.period}
              cx={pt.x}
              cy={pt.y}
              r="3.5"
              fill="#7c3aed"
              stroke="white"
              strokeWidth="2"
            />
          ))}

        {hp && (
          <g
            transform={`translate(${
              tooltipX > PAD.left + innerW - TT_W
                ? tooltipX - TT_W - 8
                : tooltipX
            }, ${tooltipY})`}
          >
            <rect x="0" y="0" width={TT_W} height="42" rx="8" fill="#1e1b4b" />
            <text x="10" y="16" fontSize="10" fill="#c4b5fd">
              {formatPeriodLabel(hp.period, granularity)}
            </text>
            <text x="10" y="33" fontSize="13" fontWeight="600" fill="white">
              {formatMoney(hp.value, currency)}
            </text>
          </g>
        )}
      </svg>
      {allZero && (
        <p className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-[13px] text-(--gray-400)">
          No revenue yet in this period.
        </p>
      )}
    </div>
  );
}

const ROW_GRID = "grid grid-cols-[1.6fr_1.4fr_1fr_1fr] gap-x-6";

function OrderTableRow({ row }: { row: OrderRow }) {
  return (
    <div
      className={`${ROW_GRID} items-center px-3 py-3 rounded-xl hover:bg-(--gray-50) transition-colors`}
    >
      <div className="min-w-0">
        <p className="text-[13px] font-semibold text-(--text-title) truncate">
          {row.course.title}
        </p>
        <p className="text-[12px] text-(--gray-500) truncate">
          {row.learner_name}
        </p>
      </div>
      <div className="flex items-center gap-2 min-w-0">
        <Landmark className="w-4 h-4 text-(--gray-400) shrink-0" />
        <span className="text-[12px] text-(--gray-600) truncate">
          Course purchase
        </span>
      </div>
      <p className="text-[14px] font-bold text-(--text-title)">
        {formatMoney(row.amount, row.currency)}
      </p>
      <p className="text-[12px] text-(--gray-500) text-right">
        {formatDateTime(row.paid_at)}
      </p>
    </div>
  );
}

export default function RevenuePage() {
  const [granularity, setGranularity] = useState<"monthly" | "weekly">(
    "monthly",
  );
  const [courseId, setCourseId] = useState<number | "">("");
  const [sort, setSort] = useState<OrderSort>("-paid_at");
  const [page, setPage] = useState(1);

  const summaryQuery = useInstructorRevenueSummary({
    granularity,
    periods: granularity === "weekly" ? 8 : 6,
  });
  const ordersQuery = useInstructorOrders({
    course_id: courseId,
    sort,
    page,
    page_size: PAGE_SIZE,
  });

  const summary = summaryQuery.data;
  const orders = ordersQuery.data;

  const courseOptions = useMemo(
    () => [
      { value: "" as number | "", label: "All courses" },
      ...(summary?.courses ?? []).map((c: InstructorCourseOption) => ({
        value: c.id as number | "",
        label: c.title,
      })),
    ],
    [summary?.courses],
  );

  const totalPages = orders
    ? Math.max(1, Math.ceil(orders.count / PAGE_SIZE))
    : 1;
  const maxByCourse = summary?.by_course?.length
    ? Math.max(...summary.by_course.map((c) => parseFloat(c.gross)))
    : 1;

  function exportCSV() {
    if (!orders?.results?.length) return;
    const header = "Date,Course,Learner,Amount,Currency";
    const rows = orders.results.map(
      (o) =>
        `${o.paid_at},"${o.course.title}","${o.learner_name}",${o.amount},${o.currency}`,
    );
    const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "revenue-orders.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  if (summaryQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-(--primary-600)" />
      </div>
    );
  }

  if (summaryQuery.isError || !summary) {
    return (
      <div className="bg-white rounded-2xl border border-(--gray-200) p-8 text-center">
        <p className="text-[14px] text-(--gray-500)">
          Could not load your revenue. Please try again.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Stat cards — gross-only. No payout/balance/commission: none of
          those have a backing model on the backend yet. */}
      <div className="grid grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-3">
        <StatCard
          label="Total Revenue"
          value={formatMoney(summary.gross, summary.currency)}
          icon={CircleDollarSign}
        >
          <p className="text-[12px] text-(--gray-500)">
            {summary.paid_orders} paid order
            {summary.paid_orders === 1 ? "" : "s"}
          </p>
        </StatCard>

        <StatCard
          label={`Revenue (${summary.window_days}d)`}
          value={formatMoney(summary.window_gross, summary.currency)}
          icon={CalendarDays}
        >
          <GrowthBadge pct={summary.growth_pct} />
        </StatCard>

        <StatCard
          label="Avg. Order Value"
          value={formatMoney(summary.avg_order_value, summary.currency)}
          icon={Wallet}
        >
          <p className="text-[12px] text-(--gray-500)">per paid order</p>
        </StatCard>

        <StatCard
          label="Courses Earning"
          value={String(summary.by_course.length)}
          icon={BookOpen}
        >
          <p className="text-[12px] text-(--gray-500)">
            of {summary.courses.length} course
            {summary.courses.length === 1 ? "" : "s"}
          </p>
        </StatCard>
      </div>

      {/* Revenue trend */}
      <div className="bg-white border border-(--gray-200) rounded-2xl px-5 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-(--primary-700)" />
            <p className="text-[14px] lg:text-[16px] font-semibold text-(--text-title)">
              Revenue Trend
            </p>
          </div>
          <div className="flex gap-1">
            {(["monthly", "weekly"] as const).map((g) => (
              <button
                key={g}
                onClick={() => setGranularity(g)}
                className={`h-7 px-3 text-[12px] font-medium rounded-md transition-colors cursor-pointer capitalize ${
                  granularity === g
                    ? "bg-(--primary-700) text-white"
                    : "text-(--gray-500) hover:bg-(--gray-100)"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
        <RevenueChart
          points={summary.trend.series}
          granularity={summary.trend.granularity}
          currency={summary.currency}
        />
      </div>

      {/* Revenue by course */}
      <div className="bg-white border border-(--gray-200) rounded-2xl px-5 py-4 space-y-3">
        <p className="text-[14px] lg:text-[16px] font-semibold text-(--text-title)">
          Revenue by Course
        </p>
        {summary.by_course.length === 0 ? (
          <p className="text-[13px] text-(--gray-400) py-4 text-center">
            No paid orders yet.
          </p>
        ) : (
          <div className="space-y-3">
            {summary.by_course.map((c) => (
              <div key={c.id} className="flex items-center gap-3">
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[13px] font-medium text-(--text-title) truncate">
                      {c.title}
                    </p>
                    <span className="text-[13px] font-semibold text-(--text-title) shrink-0">
                      {formatMoney(c.gross, summary.currency)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-(--gray-100) rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-(--primary-600) transition-all duration-700"
                        style={{
                          width: `${Math.round((parseFloat(c.gross) / maxByCourse) * 100)}%`,
                        }}
                      />
                    </div>
                    <span className="text-[11px] text-(--gray-400) shrink-0">
                      {c.paid_orders} order{c.paid_orders === 1 ? "" : "s"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order history */}
      <div className="bg-white border border-(--gray-200) rounded-2xl px-5 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          <p className="text-[14px] lg:text-[16px] font-semibold text-(--text-title)">
            Order History
            <span className="ml-2 text-[12px] font-normal text-(--gray-500)">
              ({orders?.count ?? 0})
            </span>
          </p>
          <div className="flex items-center gap-2 sm:ml-auto">
            <SearchableDropdown
              value={courseId}
              options={courseOptions}
              onChange={(v) => {
                setCourseId(v);
                setPage(1);
              }}
              icon={BookOpen}
              minWidth="min-w-52"
              align="right"
              searchable={courseOptions.length > 8}
              searchPlaceholder="Search courses..."
            />
            <SearchableDropdown
              value={sort}
              options={SORT_OPTIONS}
              onChange={(v) => {
                setSort(v);
                setPage(1);
              }}
              minWidth="min-w-44"
              align="right"
            />
            <button
              onClick={exportCSV}
              disabled={!orders?.results?.length}
              className="flex items-center gap-1.5 h-10 px-3 text-[12px] font-medium text-(--primary-700) border border-(--primary-200) rounded-md hover:bg-(--primary-50) disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shrink-0"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>

        <div className="overflow-x-auto -mx-5 px-5">
          <div className="min-w-160">
            <div
              className={`${ROW_GRID} px-3 pb-2 border-b border-(--gray-100)`}
            >
              {["Course & Learner", "Item", "Amount", "Paid At"].map((h, i) => (
                <p
                  key={h}
                  className={`text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase ${i === 3 ? "text-right" : ""}`}
                >
                  {h}
                </p>
              ))}
            </div>

            {ordersQuery.isLoading ? (
              <div className="py-12 flex justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-(--primary-600)" />
              </div>
            ) : ordersQuery.isError ? (
              <div className="py-12 text-center">
                <p className="text-[14px] text-(--gray-500)">
                  Could not load orders. Please try again.
                </p>
              </div>
            ) : !orders || orders.results.length === 0 ? (
              <div className="py-12 text-center">
                <Wallet className="w-8 h-8 text-(--gray-300) mx-auto mb-2" />
                <p className="text-[14px] text-(--gray-500)">
                  No paid orders {courseId ? "for this course" : "yet"}.
                </p>
              </div>
            ) : (
              <div
                className={`space-y-1 pt-1 transition-opacity ${ordersQuery.isFetching ? "opacity-60" : ""}`}
              >
                {orders.results.map((row) => (
                  <OrderTableRow key={row.order_id} row={row} />
                ))}
              </div>
            )}
          </div>
        </div>

        {orders && orders.count > PAGE_SIZE && (
          <div className="pt-2 border-t border-(--gray-100)">
            <p className="text-[12px] text-(--gray-500)">
              Page {page} of {totalPages} · {orders.count} order
              {orders.count === 1 ? "" : "s"}
            </p>
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}
