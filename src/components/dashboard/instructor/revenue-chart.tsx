"use client";

import { useState, useId } from "react";
import { ChevronDown } from "lucide-react";

const allData: Record<string, { months: string[]; values: number[] }> = {
  "3 months": {
    months: ["Apr", "May", "Jun"],
    values: [13500, 19000, 26000],
  },
  "4 months": {
    months: ["Mar", "Apr", "May", "Jun"],
    values: [9500, 13500, 19000, 26000],
  },
  "5 months": {
    months: ["Feb", "Mar", "Apr", "May", "Jun"],
    values: [6800, 9500, 13500, 19000, 26000],
  },
  "6 months": {
    months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    values: [6600, 6800, 9500, 13500, 19000, 26000],
  },
};

const filters = ["3 months", "4 months", "5 months", "6 months"] as const;
type Filter = (typeof filters)[number];

const Y_LABELS = [0, 6500, 13000, 19500, 26000];
const MAX_VAL = 28000;
const W = 560;
const H = 240;
const PAD = { l: 56, r: 16, t: 20, b: 32 };
const chartW = W - PAD.l - PAD.r;
const chartH = H - PAD.t - PAD.b;

// Catmull-Rom to cubic bezier — produces a natural flowing curve matching figma
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

export default function RevenueChart() {
  const [active, setActive] = useState<Filter>("6 months");
  const [open, setOpen] = useState(false);
  const gradId = useId().replace(/:/g, "");
  const clipId = useId().replace(/:/g, "");

  const { months, values } = allData[active];

  const points = values.map((v, i) => ({
    x: PAD.l + (i / (values.length - 1)) * chartW,
    y: PAD.t + chartH - (v / MAX_VAL) * chartH,
  }));

  const linePath = buildCurvePath(points);
  const areaPath =
    linePath +
    ` L ${points[points.length - 1].x} ${PAD.t + chartH} L ${points[0].x} ${PAD.t + chartH} Z`;

  return (
    <div className="bg-white rounded-xl border border-(--gray-200) p-5 flex-1 relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[15px] font-bold text-(--text-title)">
          Revenue Growth
        </h3>

        {/* Filter dropdown */}
        <div className="relative">
          <button
            onClick={() => setOpen((v) => !v)}
            className="text-[12px] text-(--gray-500) border border-(--gray-200) rounded-lg px-3 py-1.5 flex items-center gap-1.5 hover:bg-(--gray-50) transition-colors"
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
                  key={f}
                  onClick={() => {
                    setActive(f);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-[12px] transition-colors ${
                    f === active
                      ? "bg-(--primary-50) text-(--primary-600) font-semibold"
                      : "text-(--gray-600) hover:bg-(--gray-50)"
                  }`}
                >
                  Last {f}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chart */}
      <svg
        width="100%"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid meet"
        className="overflow-visible"
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.02" />
          </linearGradient>
          {/* Clip that reveals left-to-right for line draw animation */}
          <clipPath id={clipId}>
            <rect
              x={PAD.l}
              y="0"
              width={chartW}
              height={H}
              style={{
                animation: `clipReveal 1s cubic-bezier(0.4,0,0.2,1) forwards`,
              }}
            />
          </clipPath>
        </defs>

        {/* Y grid lines + labels */}
        {Y_LABELS.map((val) => {
          const y = PAD.t + chartH - (val / MAX_VAL) * chartH;
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
                fontSize="10"
                fill="#9ca3af"
                fontFamily="inherit"
              >
                {val === 0 ? "0" : val.toLocaleString()}
              </text>
            </g>
          );
        })}

        {/* Area fill — fades in */}
        <path
          key={`area-${active}`}
          d={areaPath}
          fill={`url(#${gradId})`}
          style={{
            animation: "areaFade 1s cubic-bezier(0.4,0,0.2,1) forwards",
          }}
        />

        {/* Line — draws left to right via strokeDashoffset */}
        <path
          key={`line-${active}`}
          d={linePath}
          fill="none"
          stroke="#7c3aed"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength="1"
          style={{
            strokeDasharray: 1,
            strokeDashoffset: 1,
            animation: "lineDraw 1s cubic-bezier(0.4,0,0.2,1) forwards",
          }}
        />

        {/* X labels */}
        {months.map((m, i) => (
          <text
            key={`${m}-${i}-${active}`}
            x={PAD.l + (i / (months.length - 1)) * chartW}
            y={H - 6}
            textAnchor="middle"
            fontSize="10"
            fill="#9ca3af"
            fontFamily="inherit"
          >
            {m}
          </text>
        ))}
      </svg>

      <style>{`
        @keyframes lineDraw {
          from { stroke-dashoffset: 1; }
          to   { stroke-dashoffset: 0; }
        }
        @keyframes areaFade {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes clipReveal {
          from { width: 0; }
          to   { width: ${chartW}px; }
        }
      `}</style>
    </div>
  );
}
