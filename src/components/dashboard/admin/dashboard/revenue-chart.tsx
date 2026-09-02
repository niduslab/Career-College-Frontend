"use client";

import { useState, useId, useRef, useEffect } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import { useRevenueTrend, useAdminAnalyticsSummary } from "@/hooks/use-admin-analytics";

const filters = [
  { label: "3 months", periods: 3 },
  { label: "6 months", periods: 6 },
  { label: "12 months", periods: 12 },
] as const;
type Filter = (typeof filters)[number]["label"];

const W = 560;
const H = 240;
const PAD = { l: 56, r: 16, t: 20, b: 32 };
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

function formatAxis(val: number): string {
  if (val === 0) return "0";
  if (val >= 1000) return `${Math.round(val / 1000)}k`;
  return String(Math.round(val));
}

/** "2026-07" -> "Jul" */
function monthLabel(period: string): string {
  const [year, month] = period.split("-");
  if (!year || !month) return period;
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString("en-US", { month: "short" });
}

export default function AdminRevenueChart() {
  const [active, setActive] = useState<Filter>("6 months");
  const [open, setOpen] = useState(false);
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    month: string;
    value: number;
  } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const gradId = useId().replace(/:/g, "");

  const periods = filters.find((f) => f.label === active)?.periods ?? 6;
  const { data, isLoading } = useRevenueTrend({ granularity: "monthly", periods });
  const { data: summary } = useAdminAnalyticsSummary();
  const currency = summary?.revenue.currency ?? "";

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const series = data?.series ?? [];
  const months = series.map((p) => monthLabel(p.period));
  const values = series.map((p) => p.value);
  const maxVal = Math.max(1, ...values);
  const yLabels = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(maxVal * f));

  const points = values.map((v, i) => ({
    x: PAD.l + (values.length > 1 ? (i / (values.length - 1)) * chartW : chartW / 2),
    y: PAD.t + chartH - (v / maxVal) * chartH,
  }));

  const linePath = buildCurvePath(points);
  const areaPath =
    points.length > 1
      ? linePath +
        ` L ${points[points.length - 1].x} ${PAD.t + chartH} L ${points[0].x} ${PAD.t + chartH} Z`
      : "";

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (points.length === 0) return;
    const svg = svgRef.current;
    if (!svg) return;
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
      month: months[closest],
      value: values[closest],
    });
  };

  return (
    <div className="bg-white rounded-xl border border-(--gray-200) p-5 flex-1 h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[16px] font-semibold text-(--text-title)">
          Platform Revenue
        </h3>
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen((v) => !v)}
            className="text-[12px] cursor-pointer text-(--gray-500) border border-(--gray-200) rounded-lg px-3 py-1.5 flex items-center gap-1.5 hover:bg-(--gray-50) transition-colors"
          >
            Last {active}
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            />
          </button>
          {open && (
            <div className="absolute right-0 top-full mt-1 bg-white border border-(--gray-200) rounded-xl shadow-lg z-10 py-1 min-w-32.5">
              {filters.map((f) => (
                <button
                  key={f.label}
                  onClick={() => {
                    setActive(f.label);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 cursor-pointer text-[12px] transition-colors ${
                    f.label === active
                      ? "bg-(--primary-50) text-(--primary-600) font-semibold"
                      : "text-(--gray-600) hover:bg-(--gray-50)"
                  }`}
                >
                  Last {f.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-60 text-(--gray-400)">
          <Loader2 className="w-5 h-5 animate-spin" />
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
              <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {yLabels.map((val) => {
            const y = PAD.t + chartH - (val / maxVal) * chartH;
            return (
              <g key={val}>
                <line
                  x1={PAD.l}
                  y1={y}
                  x2={PAD.l + chartW}
                  y2={y}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                  strokeDasharray="5 4"
                />
                <text
                  x={PAD.l - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="chart-axis-text"
                  fill="#9ca3af"
                  fontFamily="inherit"
                >
                  {formatAxis(val)}
                </text>
              </g>
            );
          })}

          {areaPath && (
            <path
              key={`area-${active}`}
              d={areaPath}
              fill={`url(#${gradId})`}
              style={{
                animation: "areaFade 1s cubic-bezier(0.4,0,0.2,1) forwards",
              }}
            />
          )}
          {linePath && (
            <path
              key={`line-${active}`}
              d={linePath}
              fill="none"
              stroke="#7c3aed"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              pathLength="1"
              style={{
                strokeDasharray: 1,
                strokeDashoffset: 1,
                animation: "lineDraw 1s cubic-bezier(0.4,0,0.2,1) forwards",
              }}
            />
          )}

          {months.map((m, i) => (
            <text
              key={`${m}-${i}-${active}`}
              x={points[i]?.x ?? 0}
              y={H - 6}
              textAnchor="middle"
              className="chart-axis-text"
              fill="#9ca3af"
              fontFamily="inherit"
            >
              {m}
            </text>
          ))}

          {tooltip && (
            <g>
              <line
                x1={tooltip.x}
                y1={PAD.t}
                x2={tooltip.x}
                y2={PAD.t + chartH}
                stroke="#7c3aed"
                strokeWidth="1"
                strokeDasharray="3 3"
                opacity="0.5"
              />
              <circle
                cx={tooltip.x}
                cy={tooltip.y}
                r="5"
                fill="white"
                stroke="#7c3aed"
                strokeWidth="2"
              />
              <g
                transform={`translate(${tooltip.x > W - 110 ? tooltip.x - 100 : tooltip.x + 10}, ${tooltip.y > 60 ? tooltip.y - 52 : tooltip.y + 10})`}
              >
                <rect x="0" y="0" width="100" height="42" rx="8" fill="#1e1b4b" />
                <text
                  x="10"
                  y="16"
                  fontSize="10"
                  fill="#c4b5fd"
                  fontFamily="inherit"
                >
                  {tooltip.month}
                </text>
                <text
                  x="10"
                  y="32"
                  fontSize="12"
                  fontWeight="600"
                  fill="white"
                  fontFamily="inherit"
                >
                  {currency} {tooltip.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </text>
              </g>
            </g>
          )}
        </svg>
      )}

      <style>{`
        @keyframes lineDraw { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
        @keyframes areaFade { from { opacity: 0; } to { opacity: 1; } }
        .chart-axis-text { font-size: 12px; }
        @media (min-width: 1024px) { .chart-axis-text { font-size: 10px; } }
      `}</style>
    </div>
  );
}
