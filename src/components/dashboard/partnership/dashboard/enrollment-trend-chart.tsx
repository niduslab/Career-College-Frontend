"use client";

import { useId, useRef, useState } from "react";
import { usePartnerEnrollmentTrend } from "@/hooks/use-partner-analytics";
import type { TrendGranularity } from "@/lib/partner-analytics-api";

const W = 560;
const H = 240;
const PAD = { l: 40, r: 16, t: 20, b: 32 };
const chartW = W - PAD.l - PAD.r;
const chartH = H - PAD.t - PAD.b;

function buildCurvePath(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return "";
  const tension = 0.4;
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(i - 1, 0)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(i + 2, pts.length - 1)];
    const cp1x = p1.x + (p2.x - p0.x) * tension;
    const cp1y = p1.y + (p2.y - p0.y) * tension;
    const cp2x = p2.x - (p3.x - p1.x) * tension;
    const cp2y = p2.y - (p3.y - p1.y) * tension;
    d += ` C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${p2.x} ${p2.y}`;
  }
  return d;
}

function formatPeriodLabel(
  period: string,
  granularity: TrendGranularity,
): string {
  if (granularity === "weekly") {
    const [, week] = period.split("-W");
    return `W${week}`;
  }
  const [year, month] = period.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString("en-US", { month: "short" });
}

export default function EnrollmentTrendChart() {
  const [granularity, setGranularity] = useState<TrendGranularity>("monthly");
  const { data, isLoading } = usePartnerEnrollmentTrend(granularity, 12);
  const svgRef = useRef<SVGSVGElement>(null);
  const gradId = useId().replace(/:/g, "");
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    label: string;
    value: number;
  } | null>(null);

  const series = data?.series ?? [];
  const values = series.map((p) => p.count);
  const maxVal = Math.max(...values, 1);
  const niceMax = Math.ceil(maxVal / 4) * 4 || 4;

  const points = series.map((p, i) => ({
    x:
      PAD.l +
      (series.length > 1 ? (i / (series.length - 1)) * chartW : chartW / 2),
    y: PAD.t + chartH - (p.count / niceMax) * chartH,
  }));

  const linePath = buildCurvePath(points);
  const areaPath =
    points.length > 1
      ? linePath +
        ` L ${points[points.length - 1].x} ${PAD.t + chartH} L ${points[0].x} ${PAD.t + chartH} Z`
      : "";

  const yLabels = [0, 1, 2, 3, 4].map((i) => Math.round((niceMax / 4) * i));

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg || points.length === 0) return;
    const rect = svg.getBoundingClientRect();
    const scaleX = W / rect.width;
    const mouseX = (e.clientX - rect.left) * scaleX;
    let closest = 0;
    let minDist = Infinity;
    points.forEach((p, i) => {
      const dist = Math.abs(p.x - mouseX);
      if (dist < minDist) {
        minDist = dist;
        closest = i;
      }
    });
    setTooltip({
      x: points[closest].x,
      y: points[closest].y,
      label: formatPeriodLabel(series[closest].period, granularity),
      value: series[closest].count,
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-(--gray-200) p-5 relative">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[14px] lg:text-[16px] font-semibold text-(--text-title)">
          Enrollment Trend
        </h3>
        <div className="flex items-center gap-1 border border-(--gray-200) rounded-lg p-0.5">
          {(["monthly", "weekly"] as const).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGranularity(g)}
              className={`text-[12px] cursor-pointer px-2.5 py-1 rounded-md transition-colors capitalize ${
                granularity === g
                  ? "bg-(--primary-600) text-white font-medium"
                  : "text-(--gray-500) hover:bg-(--gray-50)"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {isLoading || series.length === 0 ? (
        <div className="h-60 flex items-center justify-center text-[13px] text-(--gray-400)">
          {isLoading ? "Loading…" : "No enrollment data yet."}
        </div>
      ) : (
        <svg
          ref={svgRef}
          width="100%"
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="xMidYMid meet"
          className="overflow-visible cursor-crosshair"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setTooltip(null)}
        >
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor="var(--primary-600)"
                stopOpacity="0.25"
              />
              <stop
                offset="100%"
                stopColor="var(--primary-600)"
                stopOpacity="0"
              />
            </linearGradient>
          </defs>

          {yLabels.map((label, i) => {
            const y = PAD.t + chartH - (i / 4) * chartH;
            return (
              <g key={label}>
                <line
                  x1={PAD.l}
                  x2={W - PAD.r}
                  y1={y}
                  y2={y}
                  stroke="var(--gray-100)"
                  strokeWidth="1"
                />
                <text
                  x={PAD.l - 8}
                  y={y + 3}
                  textAnchor="end"
                  fontSize="10"
                  fill="var(--gray-400)"
                >
                  {label}
                </text>
              </g>
            );
          })}

          {areaPath && <path d={areaPath} fill={`url(#${gradId})`} />}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke="var(--primary-600)"
              strokeWidth="2"
            />
          )}

          {points.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={
                tooltip?.label ===
                formatPeriodLabel(series[i].period, granularity)
                  ? 4
                  : 0
              }
              fill="var(--primary-600)"
            />
          ))}

          {series.map((p, i) => (
            <text
              key={p.period}
              x={points[i].x}
              y={H - 8}
              textAnchor="middle"
              fontSize="10"
              fill="var(--gray-400)"
            >
              {formatPeriodLabel(p.period, granularity)}
            </text>
          ))}

          {tooltip && (
            <g pointerEvents="none">
              <line
                x1={tooltip.x}
                x2={tooltip.x}
                y1={PAD.t}
                y2={PAD.t + chartH}
                stroke="var(--gray-200)"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              <rect
                x={Math.min(Math.max(tooltip.x - 34, 0), W - 68)}
                y={Math.max(tooltip.y - 34, 0)}
                width="68"
                height="26"
                rx="6"
                fill="var(--text-title)"
              />
              <text
                x={Math.min(Math.max(tooltip.x, 34), W - 34)}
                y={Math.max(tooltip.y - 17, 15)}
                textAnchor="middle"
                fontSize="11"
                fill="white"
                fontWeight="600"
              >
                {tooltip.label}: {tooltip.value}
              </text>
            </g>
          )}
        </svg>
      )}
    </div>
  );
}
